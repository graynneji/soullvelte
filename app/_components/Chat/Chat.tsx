"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./Chat.module.css";
import { useMessage, ChatMessage } from "../../_hooks/useMessage";
import { formatTime } from "@/app/_utils";
import type { RootState } from "@/app/_store/store";
import { User } from "@/index";
import { SelectedPatientIdState } from "@/app/_store/selectedPatientIdSlice";

/**
 * Type definition for the messages grouped by date.
 */
type MessageGroups = {
    [date: string]: ChatMessage[];
};

interface ChatProps {
    userInfo: User
}

/**
 * Chat component: a chat interface for patient-therapist communication.
 * Displays messages grouped by date and auto-scrolls to the latest message.
 */
const Chat: React.FC<ChatProps> = ({ userInfo }) => {
    const [newMessage, setNewMessage] = useState<string>("");
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const dispatch = useDispatch();

    // Get IDs from Redux state
    const selectedPatient = useSelector(
        (state: RootState) => state.selectedPatientId.selectedPatient
    );

    const userId: string | undefined = userInfo[0]?.user_id;

    // Compute receiver id: therapist or patient, depending on user role
    const recieverId: string | undefined = userInfo[0]?.therapist
        ? userInfo[0]?.therapist?.therapist_id
        : selectedPatient?.patientId;

    // Subscribe to real-time messages between userId and recieverId
    const messages: ChatMessage[] = useMessage(userId, recieverId);

    /**
     * Scrolls to the bottom of the chat when messages change.
     */
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    /**
     * Checks if a timestamp belongs to the current day.
     * @param timestamp ISO date string or null
     * @returns True if timestamp is today, false otherwise
     */
    const isToday = (timestamp: string | null): boolean => {
        if (!timestamp) return false;
        const today = new Date();
        const messageDate = new Date(timestamp);
        return (
            messageDate.getDate() === today.getDate() &&
            messageDate.getMonth() === today.getMonth() &&
            messageDate.getFullYear() === today.getFullYear()
        );
    };

    /**
     * Groups messages by their creation date (as a locale date string).
     * @returns An object mapping dates to arrays of ChatMessage
     */
    const groupMessagesByDate = (): MessageGroups => {
        const groups: MessageGroups = {};
        messages?.forEach((msg) => {
            const date = msg.created_at
                ? new Date(msg.created_at).toLocaleDateString()
                : "Unknown Date";
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate();

    return (
        <div className={styles.container}>
            <div className={styles.chatWrapper}>
                <div className={styles.chatContent} ref={chatContainerRef}>
                    {Object.entries(messageGroups).map(([date, msgs]) => (
                        <div key={date} className={styles.dateGroup}>
                            <div className={styles.dateHeader}>
                                <span className={styles.dateLabel}>
                                    {isToday(msgs[0]?.created_at) ? "Today" : date}
                                </span>
                            </div>

                            {msgs.map((msg) => {
                                const isSender = msg.sender_id === userId;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`${styles.messageRow} ${isSender ? styles.senderRow : styles.receiverRow
                                            }`}
                                    >
                                        <div
                                            className={`${styles.messageBubble} ${isSender ? styles.senderBubble : styles.receiverBubble
                                                }`}
                                        >
                                            <div className={styles.messageText}>{msg.message}</div>
                                            <div
                                                className={`${styles.messageTime} ${isSender ? styles.senderTime : styles.receiverTime
                                                    }`}
                                            >
                                                {formatTime(msg.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>
        </div>
    );
}

export default Chat