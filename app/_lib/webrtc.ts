/**
 * WebRTC utility module for audio/video calls.
 * Handles peer connection lifecycle, media stream management, ICE candidates, and signaling state.
 *
 * Usage order:
 * 1. await getUserMediaStream(type)
 * 2. createPeerConnection(...)
 * 3. addTracks(localStream)
 * 4. createOffer() or handleOffer()
 * 5. Exchange ICE candidates using addIceCandidate()
 * 6. Call closeConnection() when done
 */

let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteDescriptionSet: boolean = false;
let pendingCandidates: RTCIceCandidateInit[] = [];

/**
 * STUN/TURN server configuration for WebRTC.
 * Includes public TURN for development to ensure NAT traversal.
 */
const config: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

type OnTrackCallback = (event: RTCTrackEvent) => void;
type OnCandidateCallback = (candidate: RTCIceCandidate) => void;
type OnConnectionStateChangeCallback = (
  state: RTCPeerConnectionState | string
) => void;

/**
 * Creates (or recreates) a new RTCPeerConnection.
 * Cleans up any existing connection, resets state, and sets up event handlers.
 */
export function createPeerConnection(
  onTrack: OnTrackCallback,
  onCandidate: OnCandidateCallback,
  onConnectionStateChange?: OnConnectionStateChangeCallback
): RTCPeerConnection {
  if (peerConnection && peerConnection.connectionState !== "closed") {
    peerConnection.close();
  }
  peerConnection = new RTCPeerConnection(config);
  remoteDescriptionSet = false;
  pendingCandidates = [];

  peerConnection.ontrack = onTrack;

  peerConnection.onconnectionstatechange = () => {
    if (onConnectionStateChange) {
      onConnectionStateChange(peerConnection!.connectionState);
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    if (
      peerConnection &&
      (peerConnection.iceConnectionState === "connected" ||
        peerConnection.iceConnectionState === "completed")
    ) {
      if (onConnectionStateChange) {
        onConnectionStateChange("connected");
      }
    }
  };

  peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      onCandidate(event.candidate);
    }
  };

  return peerConnection;
}

/**
 * Checks for available audio and video input devices.
 * @returns An object indicating device availability.
 */
export const checkDevicesAvailability = async (): Promise<{
  video: boolean;
  audio: boolean;
}> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    const audioDevices = devices.filter(
      (device) => device.kind === "audioinput"
    );
    return {
      video: videoDevices.length > 0,
      audio: audioDevices.length > 0,
    };
  } catch {
    return { video: false, audio: false };
  }
};

/**
 * Obtains the user's media stream, with constraints based on type and device availability.
 * Throws a detailed error for the UI to handle if it fails.
 * Stores the stream in the module for cleanup.
 */
export const getUserMediaStream = async (
  type: "video" | "audio"
): Promise<MediaStream | null> => {
  try {
    const devices = await checkDevicesAvailability();
    const constraints: MediaStreamConstraints = {
      video:
        type === "video" && devices.video
          ? {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 30 },
            }
          : false,
      audio: devices.audio,
    };

    if ((type === "video" && !devices.video) || !devices.audio) {
      return null;
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStream = stream; // store for cleanup
    return stream;
  } catch (error: any) {
    throw {
      type: error.name,
      message: error.message,
      original: error,
    };
  }
};

/**
 * Adds all tracks from a media stream to the current peer connection.
 * Only call this ONCE per peer connection, and always before offer/answer.
 */
export function addTracks(stream: MediaStream): void {
  if (!peerConnection) return;
  if (!stream) return;
  // Prevent duplicate tracks
  const senders = peerConnection.getSenders();
  stream.getTracks().forEach((track) => {
    const alreadyAdded = senders.find((sender) => sender.track === track);
    if (!alreadyAdded) {
      peerConnection!.addTrack(track, stream);
    }
  });
}

/**
 * Creates and sets a local offer, returning the offer SDP.
 */
export async function createOffer(): Promise<RTCSessionDescriptionInit | null> {
  if (!peerConnection || peerConnection.signalingState === "closed")
    return null;
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  } catch {
    return null;
  }
}

/**
 * Handles an incoming offer, sets it as the remote description, processes buffered ICE candidates,
 * creates an answer, sets it as local description, and returns the answer.
 */
export async function handleOffer(
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit | null> {
  if (!peerConnection || peerConnection.signalingState === "closed")
    return null;
  if (!offer) return null;
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    remoteDescriptionSet = true;
    for (let c of pendingCandidates) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(c));
    }
    pendingCandidates = [];
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  } catch {
    return null;
  }
}

/**
 * Handles an incoming answer, sets it as the remote description, and processes buffered ICE candidates.
 */
export async function handleAnswer(
  answer: RTCSessionDescriptionInit
): Promise<void> {
  if (!peerConnection || peerConnection.signalingState === "closed") return;
  if (!answer) return;
  try {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
    remoteDescriptionSet = true;
    for (let c of pendingCandidates) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(c));
    }
    pendingCandidates = [];
  } catch {}
}

/**
 * Adds an ICE candidate to the peer connection.
 * Buffers candidates if the remote description is not yet set.
 */
export async function addIceCandidate(
  candidate: RTCIceCandidateInit
): Promise<void> {
  if (!peerConnection) return;
  if (!candidate) return;
  try {
    if (!remoteDescriptionSet) {
      pendingCandidates.push(candidate);
    } else {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  } catch {}
}

/**
 * Closes the peer connection, stops all local media tracks, and resets internal state.
 */
export function closeConnection(): void {
  try {
    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.oniceconnectionstatechange = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.close();
      peerConnection = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      localStream = null;
    }
    remoteDescriptionSet = false;
    pendingCandidates = [];
  } catch {}
}
