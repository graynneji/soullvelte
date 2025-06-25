"use client";
import React, { useRef, useState, ChangeEvent, FormEvent } from "react";
import styles from "./MessageInput.module.css";
import { PaperPlaneRightIcon } from "@phosphor-icons/react/dist/ssr";
import { useSelector } from "react-redux";
import { sendMessage } from "@/app/_lib/services";
import { useTypingStatus } from "@/app/_hooks/useTypingStatus";
import { User } from "@/index";
import { RootState } from "@/app/_store/store";
import Input from "../Input/Input";

/**
 * Type for the user object stored in Redux.
 * Extend this type according to your Redux state shape if needed.
 */
interface Therapist {
    therapist_id: string;
}

/**
 * MessageInput is a React component for sending chat messages.
 * It notifies the other user when you are typing and sends messages via a server action.
 * It uses an uncontrolled input approach, resetting the form after submission.
 */
function MessageInput({ userInfo }: { userInfo: User }) {
    // Get users and patient receiver ID from Redux state
    const selectedPatient = useSelector(
        (state: RootState) => state.selectedPatientId.selectedPatient
    );

    // Determine the sender and receiver IDs
    const users = {
        senderId: userInfo[0]?.user_id ?? "",
        receiverId:
            userInfo[0]?.therapist?.therapist_id ?? selectedPatient?.patientId ?? "",
    };

    // Prepare the sendMessage function with user IDs
    const messageSend = sendMessage.bind(null, users);

    // Uncontrolled input (form reset instead of setState)
    // If you want to make it controlled, uncomment setNewMessage and value binding
    // const [newMessage, setNewMessage] = useState<string>("");

    // Ref for the form to be able to reset it after submission
    const formRef = useRef<HTMLFormElement>(null);

    // Custom hook to send typing status
    const { sendTyping } = useTypingStatus(
        users?.senderId,
        users?.receiverId
    );

    /**
     * Called when the textarea value changes.
     * Notifies the other user that you are typing.
     */
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        sendTyping();
        // For controlled component:
        // setNewMessage(e.target.value);
    };

    /**
     * Handles form submission using server action.
     * Resets the form after sending the message.
     */
    const handleAction = async (formData: FormData) => {
        await messageSend(formData);
        // For controlled component:
        // setNewMessage("");
        formRef.current?.reset();
    };

    return (
        <div className={styles.messageInputContainer}>
            <form
                className={styles.messageForm}
                action={handleAction}
                ref={formRef}
            >
                <div className={styles.textareaWrapper}>
                    <Input
                        inputType="message"
                        id="message"
                        onChange={() => handleChange}
                        placeholder="Type your message here..."
                        rows={1}
                    />
                </div>
                <button
                    type="submit"
                    className={styles.sendButton}
                    aria-label="Send message"
                >
                    <PaperPlaneRightIcon size={18} weight="fill" />
                </button>
            </form>
        </div>
    );
}

export default MessageInput;