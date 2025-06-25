"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./CallUI.module.css";
import { useDispatch } from "react-redux";
import { supabase } from "@/app/_lib/supabase";
import { call } from "@/app/_store/callSlice";
import { User } from "@/index";
import { useWebRTCSignaling } from "@/app/_hooks/useWebRTCSignaling";
import {
    HeadphonesIcon,
    MicrophoneIcon,
    MicrophoneSlashIcon,
    PhoneSlashIcon,
    VideoCameraIcon,
    VideoCameraSlashIcon,
    WarningIcon,
} from "@phosphor-icons/react/dist/ssr";

interface CallUIProps {
    inCall: boolean;
    caller: string | null;
    type: "video" | "audio";
    channel: string | null;
    callerName: string | null;
    receiverName: string | null;
    userInfo: User;
}

/**
 * Main UI component for an active audio/video call.
 * Handles media controls, call duration, error display, and leverages
 * the useWebRTCSignaling hook for peer connection and signaling.
 *
 * @param {CallUIProps} props - Props for call information and user
 * @returns {JSX.Element | null} The call UI, or null if not in a call
 */
export default function CallUI({
    inCall,
    caller,
    type,
    channel,
    callerName,
    receiverName,
    userInfo,
}: CallUIProps) {
    // UI state
    const [muted, setMuted] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [connectionState, setConnectionState] = useState<
        "disconnected" | "connecting" | "connected" | "failed"
    >("connecting");
    const [callTimeElapsed, setCallTimeElapsed] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const dispatch = useDispatch();
    const localRef = useRef<HTMLVideoElement | null>(null);
    const remoteRef = useRef<HTMLVideoElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Get current user ID and determine if this user is the caller
    const userId = userInfo[0]?.user_id as string;
    const isCaller = caller === userId;

    /**
     * useWebRTCSignaling hook manages all peer connection, signaling, and media negotiation.
     * It returns the local stream and provides callbacks for remote stream, connection state, and error messages.
     */
    const { localStream } = useWebRTCSignaling({
        channel: channel!,
        type,
        userId,
        isCaller,
        onRemoteStream: (stream) => setRemoteStream(stream),
        onConnectionState: (state) =>
            setConnectionState(state as "disconnected" | "connecting" | "connected" | "failed"),
        onError: (msg) => setErrorMessage(msg),
    });

    /**
     * Effect: Attach the obtained local media stream to the local video element.
     */
    useEffect(() => {
        if (localRef.current && localStream) {
            localRef.current.srcObject = localStream;
        }
    }, [localStream]);

    /**
     * Effect: Attach the obtained remote media stream to the remote video element.
     */
    useEffect(() => {
        if (remoteRef.current && remoteStream) {
            remoteRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    /**
     * Effect: Start and clear the call timer based on connection state.
     */
    useEffect(() => {
        if (connectionState === "connected") {
            timerRef.current = setInterval(() => {
                setCallTimeElapsed((prev) => prev + 1);
            }, 1000);
        } else {
            setCallTimeElapsed(0);
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [connectionState]);

    /**
     * Show call controls for 3 seconds after mouse move.
     */
    const showControlsTemporarily = () => {
        setShowControls(true);
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    /**
     * Toggle mute state for the local audio track.
     */
    const toggleMute = () => {
        if (!localStream) return;
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setMuted(!audioTrack.enabled);
        }
    };

    /**
     * Toggle enabled state for the local video track.
     */
    const toggleVideo = () => {
        if (!localStream || type === "audio") return;
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setVideoEnabled(videoTrack.enabled);
        }
    };

    /**
     * End the call by updating the status, cleaning up media, and Redux.
     */
    const endCall = async () => {
        try {
            await supabase
                .from("call_requests")
                .update({ status: "ended" })
                .eq("channel", channel);
        } catch (error) {
            // ignore for now
        }
        dispatch(
            call({
                inCall: false,
                channel: null,
                type: "video",
                caller: null,
                callerName: null,
                receiverName: null,
            })
        );
    };

    if (!inCall) return null;

    /**
     * Format time in mm:ss for UI.
     * @param {number} seconds
     * @returns {string}
     */
    function formatTimeElapsed(seconds: number) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    }

    // --- RENDER ---
    return (
        <div className={styles.callWrapper} onMouseMove={showControlsTemporarily}>
            {/* Error message display */}
            {errorMessage && (
                <div className={styles.errorMessage}>
                    <div className={styles.errorIcon}>
                        <WarningIcon size={24} weight="fill" color="white" />
                    </div>
                    <div className={styles.errorText}>{errorMessage}</div>
                    <button onClick={endCall} className={styles.endCallButton}>
                        Close
                    </button>
                </div>
            )}

            {/* Status indicators */}
            <div className={styles.statusBar}>
                <div
                    className={`${styles.statusIndicator} ${connectionState === "connected" ? styles.connected : ""
                        }`}
                >
                    {connectionState === "connecting"
                        ? "Establishing Connection..."
                        : connectionState === "connected"
                            ? "Connected"
                            : "Disconnected"}
                </div>
                {connectionState === "connected" && (
                    <div className={styles.callTimer}>
                        {formatTimeElapsed(callTimeElapsed)}
                    </div>
                )}
                {muted && (
                    <div className={styles.mutedIndicator}>
                        <MicrophoneSlashIcon size={24} weight="fill" color="white" /> Muted
                    </div>
                )}
                {!videoEnabled && type === "video" && (
                    <div className={styles.videoOffIndicator}>
                        <VideoCameraIcon size={24} weight="fill" color="white" /> Video Off
                    </div>
                )}
            </div>

            {/* Remote video */}
            <div
                className={`${styles.videoContainer} ${type === "audio" ? styles.audioMode : ""
                    }`}
            >
                {connectionState === "connected" ? (
                    <>
                        <video
                            ref={remoteRef}
                            autoPlay
                            playsInline
                            className={styles.remoteVideo}
                        />
                        {type === "audio" && (
                            <div className={styles.audioAvatar}>
                                <div className={styles.avatarIcon}>👤</div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.placeholderVideo}>
                        <div className={styles.connectingAnimation}>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                        </div>
                        <div className={styles.connectingText}>
                            {connectionState === "connecting"
                                ? "Connecting..."
                                : "No Video"}
                        </div>
                    </div>
                )}
            </div>

            {/* Local video */}
            <div
                className={`${styles.localVideoContainer} ${!videoEnabled ? styles.videoDisabled : ""
                    }`}
            >
                {type === "video" ? (
                    <video
                        ref={localRef}
                        autoPlay
                        muted
                        playsInline
                        className={styles.localVideo}
                    />
                ) : (
                    <div className={styles.localAudioIndicator}>
                        <div className={styles.micIcon}>
                            <MicrophoneIcon size={24} weight="fill" color="white" />
                        </div>
                        <div className={styles.pulsingCircle}></div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div
                className={`${styles.controls} ${showControls ? styles.controlsVisible : styles.controlsHidden
                    }`}
            >
                <div className={styles.controlBar}>
                    <button
                        className={`${styles.iconButton} ${muted ? styles.active : ""}`}
                        onClick={toggleMute}
                        title={muted ? "Unmute" : "Mute"}
                    >
                        <div className={styles.buttonIcon}>
                            {muted ? (
                                <MicrophoneSlashIcon size={24} weight="fill" color="white" />
                            ) : (
                                <MicrophoneIcon size={24} weight="fill" color="white" />
                            )}
                        </div>
                        <div className={styles.buttonLabel}>
                            {muted ? "Unmute" : "Mute"}
                        </div>
                    </button>

                    {/* Only show video toggle if we have video capability */}
                    {type === "video" && (
                        <button
                            className={`${styles.iconButton} ${!videoEnabled ? styles.active : ""
                                }`}
                            onClick={toggleVideo}
                            title={videoEnabled ? "Stop Video" : "Start Video"}
                        >
                            <div className={styles.buttonIcon}>
                                {videoEnabled ? (
                                    <VideoCameraIcon size={24} weight="fill" color="white" />
                                ) : (
                                    <VideoCameraSlashIcon size={24} weight="fill" color="white" />
                                )}
                            </div>
                            <div className={styles.buttonLabel}>
                                {videoEnabled ? "Off" : "On"}
                            </div>
                        </button>
                    )}

                    <button
                        onClick={endCall}
                        className={styles.endCallButton}
                        title="End Call"
                    >
                        <div className={styles.hangupIcon}>
                            <PhoneSlashIcon size={24} weight="fill" color="white" />
                        </div>
                        <div className={styles.buttonLabel}>End</div>
                    </button>
                </div>
            </div>
        </div>
    );
}