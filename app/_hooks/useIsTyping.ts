import { useEffect, useState, useRef } from "react";
import { supabase } from "../_lib/supabase";

/**
 * Hook to listen for typing status from another user via Supabase Realtime,
 * with debounced updates to avoid flicker.
 *
 * @param userId       The current user's ID (receiver)
 * @param otherUserId  The other user's ID (sender of typing events)
 * @param debounceMs   The debounce delay in milliseconds (optional, default: 200ms)
 */
export function useIsTyping(
  userId: string | null | undefined,
  otherUserId: string | null | undefined,
  debounceMs: number = 200
): { isTyping: boolean } {
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId || !otherUserId) return;

    const channel = supabase.channel(`typing-${otherUserId}-${userId}`, {
      config: {
        broadcast: { self: false },
      },
    });

    channel
      .on("broadcast", { event: "typing" }, (payload: any) => {
        const typing = !!payload.payload.typing;
        // Debounce the update to avoid flicker
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
          setIsTyping(typing);
        }, debounceMs);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [userId, otherUserId, debounceMs]);

  return { isTyping };
}
