"use client";
import styles from "./IncomingCallModal.module.css";
import { supabase } from "@/app/_lib/supabase";
import { call as callAction } from "@/app/_store/callSlice";
import { PhoneDisconnectIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { User } from "@/index";

/**
 * Represents a call request as stored in the database.
 */
interface CallRequest {
    id: string;
    status: string;
    channel: string;
    type: string;
    from_user: string;
    to_user: string;
    caller_name: string;
    receiver_name: string;
}

type IncomingCallModalProps = { userInfo: User };

/**
 * Modal component that listens for incoming calls via Supabase realtime
 * and renders UI for the user to accept or decline the call.
 *
 * @param {IncomingCallModalProps} props - The userInfo for the logged-in user
 * @returns {JSX.Element | null} The modal UI, or null if no incoming call
 */
const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ userInfo }) => {
    const userId = userInfo[0]?.user_id as string | undefined;
    // Store the incoming call request, or null if none
    const [incoming, setIncoming] = useState<CallRequest | null>(null);
    const dispatch = useDispatch();

    /**
     * Effect: Subscribe to new call requests for this user.
     * Listens for INSERTs to the call_requests table addressed to this user and
     * shows the modal if status is pending.
     */
    useEffect(() => {
        if (!userId) return;
        const sub = supabase
            .channel("calls")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "call_requests",
                    filter: `to_user=eq.${userId}`,
                },
                (payload) => {
                    if (payload.new.status === "pending") {
                        setIncoming(payload.new as CallRequest);
                    }
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(sub);
        };
    }, [userId]);

    /**
     * Accepts the incoming call by updating its status and dispatching to Redux.
     * After a short delay, shows the CallUI.
     */
    const acceptCall = async () => {
        if (!incoming) return;
        await supabase
            .from("call_requests")
            .update({ status: "accepted" })
            .eq("id", incoming.id);
        setTimeout(() => {
            dispatch(
                callAction({
                    inCall: true,
                    channel: incoming.channel,
                    type: incoming.type,
                    caller: incoming.from_user,
                    callerName: incoming.caller_name,
                    receiverName: incoming.receiver_name,
                })
            );
            setIncoming(null);
        }, 300);
    };

    /**
     * Declines the incoming call by updating its status.
     */
    const rejectCall = async () => {
        if (!incoming) return;
        await supabase
            .from("call_requests")
            .update({ status: "rejected" })
            .eq("id", incoming.id);
        setIncoming(null);
    };

    // Hide modal if there is no incoming call
    if (!incoming) return null;

    /**
     * Returns the first letter of the caller's name for the avatar.
     * Falls back to 'S' if unavailable.
     */
    const getCallerInitial = () => {
        const callerName = incoming?.caller_name || "S";
        return callerName.charAt(0);
    };

    // --- RENDER ---
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.callModal}>
                <div className={styles.callerImage}>
                    <span className={styles.callerInitial}>{getCallerInitial()}</span>
                </div>
                <h2>{incoming?.caller_name}</h2>
                <p>Incoming call</p>
                <div className={styles.callButtons}>
                    <button className={styles.reject} onClick={rejectCall}>
                        <PhoneDisconnectIcon size={18} weight="fill" />
                        <span>Decline</span>
                    </button>
                    <button className={styles.accept} onClick={acceptCall}>
                        <PhoneIcon size={18} weight="fill" />
                        <span>Answer</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;