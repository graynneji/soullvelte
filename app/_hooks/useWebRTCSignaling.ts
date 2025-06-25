import { useEffect, useRef, useState } from "react";
import { supabase } from "@/app/_lib/supabase";
import {
  createPeerConnection,
  addTracks,
  createOffer,
  handleOffer,
  handleAnswer,
  addIceCandidate,
  closeConnection,
  getUserMediaStream,
} from "@/app/_lib/webrtc";

interface UseWebRTCSignalingProps {
  channel: string;
  type: "audio" | "video";
  userId: string;
  isCaller: boolean;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionState: (state: string) => void;
  onError: (err: string) => void;
}

export function useWebRTCSignaling({
  channel,
  type,
  userId,
  isCaller,
  onRemoteStream,
  onConnectionState,
  onError,
}: UseWebRTCSignalingProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    let supabaseChannel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      try {
        // Get user media
        const stream = await getUserMediaStream(type);
        setLocalStream(stream);

        // Create peer connection
        createPeerConnection(
          (event: RTCTrackEvent) => {
            if (event.streams[0]) onRemoteStream(event.streams[0]);
          },
          async (candidate: RTCIceCandidateInit) => {
            // Append new candidate to DB
            const { data: row } = await supabase
              .from("call_requests")
              .select("candidates")
              .eq("channel", channel)
              .maybeSingle();
            if (row) {
              const existing = row.candidates || [];
              await supabase
                .from("call_requests")
                .update({ candidates: [...existing, candidate] })
                .eq("channel", channel);
            }
          },
          onConnectionState
        );
        if (stream) {
          addTracks(stream);
        }

        // Subscribe to signaling channel
        supabaseChannel = supabase
          .channel(`rtc-${channel}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "call_requests",
              filter: `channel=eq.${channel}`,
            },
            async (payload) => {
              const { offer, answer, candidates, status } = payload.new;

              if (status === "ended") {
                closeConnection();
                if (localStream)
                  localStream.getTracks().forEach((t) => t.stop());
                setLocalStream(null);
                return;
              }

              // Callee receives offer, creates answer
              if (!isCaller && offer && !answer) {
                const ans = await handleOffer(offer);
                if (ans) {
                  await supabase
                    .from("call_requests")
                    .update({ answer: ans, status: "answered" })
                    .eq("channel", channel);
                }
              }

              // Caller receives answer
              if (isCaller && answer) {
                await handleAnswer(answer);
              }

              // Handle ICE candidates
              if (candidates?.length) {
                const oldCount = payload.old?.candidates?.length || 0;
                const newCandidates = candidates.slice(oldCount);
                for (let c of newCandidates) {
                  await addIceCandidate(c);
                }
              }
            }
          )
          .subscribe();

        // Offer/answer logic
        const { data: row } = await supabase
          .from("call_requests")
          .select("*")
          .eq("channel", channel)
          .maybeSingle();

        if (!row) throw new Error("No call row");

        if (isCaller && row.status === "accepted" && !row.offer) {
          const offer = await createOffer();
          if (offer) {
            await supabase
              .from("call_requests")
              .update({ offer, status: "ringing" })
              .eq("channel", channel);
          }
        }
      } catch (err: any) {
        onError(err.message || "WebRTC error");
      }
    };

    setup();

    return () => {
      isComponentMounted.current = false;
      if (supabaseChannel) supabase.removeChannel(supabaseChannel);
      closeConnection();
      setLocalStream(null);
    };
    // eslint-disable-next-line
  }, [channel, type, userId, isCaller]);

  return { localStream };
}
