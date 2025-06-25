import { useEffect, useState } from "react";
import { supabase } from "../_lib/supabase";

/**
 * Type definition for a chat message.
 */
export interface ChatMessage {
  id: string;
  sender_id: string;
  reciever_id: string;
  message: string;
  created_at: string;
  [key: string]: any; // For additional fields
}

type ChannelKey = string;
type ChannelInstance = ReturnType<typeof supabase.channel>;
type MessageCallback = (msg: ChatMessage) => void;

const channelMap = new Map<ChannelKey, ChannelInstance>();
const callbackMap = new Map<ChannelKey, Set<MessageCallback>>();

/**
 * Get or create a shared Supabase channel for a chat pair.
 * Ensures only one subscription per chat pair.
 * Allows registering multiple message callbacks (for multiple consumers).
 */
export function getOrCreateChannel(
  userId: string,
  receiverId: string,
  onMessage: MessageCallback
) {
  const key = `chat-${userId}-${receiverId}`;
  if (!callbackMap.has(key)) {
    callbackMap.set(key, new Set());
  }
  callbackMap.get(key)!.add(onMessage);

  if (channelMap.has(key)) {
    return channelMap.get(key)!;
  }

  const channel = supabase
    .channel(key)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const newMessage: ChatMessage = {
          id: payload.new.id,
          sender_id: payload.new.sender_id,
          reciever_id: payload.new.reciever_id,
          message: payload.new.message,
          created_at: payload.new.created_at,
          ...payload.new, // include any additional fields
        };

        // Call all registered callbacks for this channel key
        callbackMap.get(key)?.forEach((cb) => cb(newMessage));
      }
    )
    .subscribe();

  channelMap.set(key, channel);
  return channel;
}

/**
 * Removes a callback from a channel, and cleans up the channel if no callbacks remain.
 */
export function removeChannelCallback(
  userId: string,
  receiverId: string,
  onMessage: MessageCallback
) {
  const key = `chat-${userId}-${receiverId}`;
  const callbackSet = callbackMap.get(key);
  if (callbackSet) {
    callbackSet.delete(onMessage);
    if (callbackSet.size === 0) {
      // No more listeners, clean up the channel
      callbackMap.delete(key);
      const channel = channelMap.get(key);
      if (channel) {
        supabase.removeChannel(channel);
        channelMap.delete(key);
      }
    }
  }
}

/**
 * React hook to subscribe to real-time messages between two users.
 * Fetches the latest 30 messages and listens for new ones via a shared subscription.
 *
 * @param userId      - The current user's ID.
 * @param receiverId  - The receiver's user ID.
 * @returns           - An array of messages between userId and receiverId.
 */
export function useMessage(
  userId: string | undefined,
  receiverId: string | null = null
): ChatMessage[] {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!userId || !receiverId) return;

    setMessages([]);

    /**
     * Fetches the latest 30 messages between userId and receiverId.
     */
    const fetchMessages = async () => {
      // Get the total count of messages between the two users
      const { count, error: countError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .or(
          `and(sender_id.eq.${userId},reciever_id.eq.${receiverId}),and(sender_id.eq.${receiverId},reciever_id.eq.${userId})`
        );

      if (countError) {
        // Optionally handle error UI
        return;
      }

      const messagesToFetch = Math.min(count || 0, 30);

      // Fetch the latest messages in order
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},reciever_id.eq.${receiverId}),and(sender_id.eq.${receiverId},reciever_id.eq.${userId})`
        )
        .order("created_at", { ascending: true })
        .range((count || 0) - messagesToFetch, (count || 0) - 1);

      if (data) setMessages(data as ChatMessage[]);
      // Optionally handle error UI for error
    };

    fetchMessages();

    // Shared real-time subscription for new messages
    const handleNewMessage = (newMessage: ChatMessage) => {
      // Only add if not already in the list (prevent duplicates)
      setMessages((prev) =>
        prev.find((msg) => msg.id === newMessage.id)
          ? prev
          : [...prev, newMessage]
      );
    };
    getOrCreateChannel(userId, receiverId, handleNewMessage);

    return () => {
      removeChannelCallback(userId, receiverId, handleNewMessage);
    };
  }, [userId, receiverId]);

  return messages;
}
