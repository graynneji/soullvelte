import { useEffect, useState } from "react";
import { supabase } from "../_lib/supabase";
import { fetchLastMessages } from "../_lib/services";

// Define the shape of your message object based on your "messages" table
export interface Message {
  id: string; // or number, depending on your schema
  sender_id: string;
  reciever_id: string;
  created_at: string;
  message: string;
  // Add any other fields from your "messages" table here
}

// Record keyed by the other user's id, holding their latest message
type Conversations = Record<string, Message>;

export function usePreviousMsg(
  userId: string | null | undefined
): Conversations {
  const [conversations, setConversations] = useState<Conversations>({}); // { otherUserId: latestMessage }

  useEffect(() => {
    if (!userId) return;

    setConversations({});

    const fetchConversations = async () => {
      const res = await fetchLastMessages();

      if (res.error) {
        // Handle/report error
        throw new Error(res.error);
      }

      if (!res.data) {
        // Defensive: No data, but no error message? This shouldn't happen, but guard anyway.
        throw new Error("No data returned from fetchLastMessages");
      }

      const data = res.data;

      const latestPerConversation: Conversations = {};

      data.forEach((msg: Message) => {
        const otherUserId =
          msg.sender_id === userId ? msg.reciever_id : msg.sender_id;

        // First (newest) message with this other user
        if (!latestPerConversation[otherUserId]) {
          latestPerConversation[otherUserId] = msg;
        }
      });

      setConversations(latestPerConversation);
    };

    fetchConversations();

    const channel = supabase
      .channel(`chat-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Only interested if the user is sender or receiver
          if (
            newMessage.sender_id !== userId &&
            newMessage.reciever_id !== userId
          )
            return;

          const otherUserId =
            newMessage.sender_id === userId
              ? newMessage.reciever_id
              : newMessage.sender_id;

          setConversations((prev) => {
            const prevMessage = prev[otherUserId];

            // Update if no message yet or the new one is newer
            if (
              !prevMessage ||
              new Date(newMessage.created_at) > new Date(prevMessage.created_at)
            ) {
              return {
                ...prev,
                [otherUserId]: newMessage,
              };
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return conversations; // { otherUserId: latestMessage }
}
