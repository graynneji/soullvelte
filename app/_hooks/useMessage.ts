import { useEffect, useState, useRef } from "react";
import { supabase } from "../_lib/supabase";

export interface Message {
  id: string;
  sender_id: string;
  reciever_id: string;
  message: string;
  created_at: string;
}

export interface UseMessageProps {
  userId: string;
  receiverId: string | null;
}

export function useMessage({
  userId,
  receiverId = null,
}: UseMessageProps): Message[] {
  const [messages, setMessages] = useState<Message[]>([]);
  const latestMessageId = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!userId || !receiverId) return;

    let isMounted = true;
    setMessages([]);

    // Only fetch the most recent 30 messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},reciever_id.eq.${receiverId}),and(sender_id.eq.${receiverId},reciever_id.eq.${userId})`
        )
        .order("created_at", { ascending: true })
        .limit(30);

      if (error) {
        console.error(error);
        return;
      }
      if (isMounted && data) {
        setMessages(data as Message[]);
        if (data.length > 0) {
          latestMessageId.current = data[data.length - 1].id;
        }
      }
    };

    fetchMessages();

    // Only subscribe to new inserts, not all changes. Use a filter on the channel for these two user IDs.
    const channel = supabase
      .channel(`chat-${userId}-${receiverId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or=(and(sender_id.eq.${userId},reciever_id.eq.${receiverId}),and(sender_id.eq.${receiverId},reciever_id.eq.${userId}))`,
        },
        (payload: { new: Message }) => {
          const newMessage = payload.new;
          // Avoid duplicates if the same message arrives via subscription and REST
          if (
            !messages.find((msg) => msg.id === newMessage.id) &&
            ((newMessage.sender_id === userId &&
              newMessage.reciever_id === receiverId) ||
              (newMessage.sender_id === receiverId &&
                newMessage.reciever_id === userId))
          ) {
            setMessages((prev) => [...prev, newMessage]);
            latestMessageId.current = newMessage.id;
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, receiverId]);

  return messages;
}
