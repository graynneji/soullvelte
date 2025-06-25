import { useEffect, useRef } from "react";
import { supabase } from "../_lib/supabase";

type UseTypingStatusReturn = {
  sendTyping: () => void;
};

/**
 * Custom hook to manage and broadcast typing status between two users via Supabase Realtime channels.
 *
 * @param userId - The ID of the current user.
 * @param otherUserId - The ID of the other user in the conversation.
 * @returns An object containing the sendTyping function to notify typing events.
 */
export function useTypingStatus(
  userId: string | null | undefined,
  otherUserId: string | null | undefined
): UseTypingStatusReturn {
  // Ref to store the timeout for resetting typing status
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Do nothing if either user ID is not provided
    if (!userId || !otherUserId) return;

    // Create a Supabase Realtime channel for typing events
    const channel = supabase.channel(`typing-${userId}-${otherUserId}`, {
      config: {
        broadcast: { self: false },
      },
    });

    // Subscribe to the channel
    channel.subscribe();

    // Cleanup: remove the channel on unmount or when dependencies change
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, otherUserId]);

  /**
   * Broadcasts a "typing" event to the other user and sets a timeout to reset the typing status after 2 seconds.
   */
  const sendTyping = () => {
    if (!userId || !otherUserId) return;

    // Broadcast that this user is typing
    supabase.channel(`typing-${userId}-${otherUserId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { typing: true, userId },
    });

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // After 2 seconds, broadcast that typing has stopped
    timeoutRef.current = setTimeout(() => {
      supabase.channel(`typing-${userId}-${otherUserId}`).send({
        type: "broadcast",
        event: "typing",
        payload: { typing: false, userId },
      });
    }, 2000);
  };

  return { sendTyping };
}
