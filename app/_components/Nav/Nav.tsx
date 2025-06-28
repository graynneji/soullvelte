"use client";
import React from "react";
import styles from "./Nav.module.css";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { PhoneIcon, VideoCameraIcon } from "@phosphor-icons/react/dist/ssr";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/app/_lib/supabase";
import { useIsTyping } from "../../_hooks/useIsTyping";
import { capitalizeFirstLetter } from "@/app/_utils";
import { SelectedPatientIdState, setSelectedPatientId } from "../../_store/selectedPatientIdSlice";
import { User } from "@/index";
import { call } from "@/app/_store/callSlice";
import Button from "../Button/Button";
import { RootState } from "@/app/_store/store";

interface NavProps {
    userInfo: User;
}

const Nav: React.FC<NavProps> = ({ userInfo }) => {
    const dispatch = useDispatch();
    const selectedPatient = useSelector(
        (state: RootState) => state.selectedPatientId.selectedPatient
    );

    const userId: string = userInfo[0]?.user_id;
    const callerName: string = userInfo[0]?.name
    const toUserId: string =
        userInfo[0]?.therapist?.therapist_id || selectedPatient?.patientId || "";

    const { isTyping } = useIsTyping(userId, toUserId);

    const receiverName = userInfo[0]?.therapist
        ? userInfo[0]?.therapist?.name
        : selectedPatient?.patientName;
    /**
     * Initiates a call request to another user, defaulting to "video" calls.
     * Inserts a new call request into Supabase and updates the Redux state.
     *
     * @param {("video" | "audio")} [type="video"] - The type of call to initiate ("video" or "audio").
     */
    const callUser = async (type: "video" | "audio" = "video") => {
        // Generate a unique channel ID for the call
        const channel = uuidv4();
        // Insert the call request into the Supabase "call_requests" table
        await supabase.from("call_requests").insert([
            {
                from_user: userId,
                to_user: toUserId,
                type,
                status: "pending",
                channel,
                caller_name: callerName,
                receiver_name: receiverName,
            },
        ]);
        // Dispatch the new call state to Redux
        dispatch(
            call({
                inCall: true,
                channel: channel ?? null,
                type,
                caller: userId ?? null,
                callerName: callerName ?? null,
                receiverName: receiverName ?? null,
            })
        );
    };
    return (
        <nav className={styles.navContainer}>
            <div className={styles.profileSection}>
                {!userInfo[0]?.therapist ? (
                    <div className={styles.patientAvatar}>
                        <div className={styles.avatarInitial}>
                            {receiverName?.charAt(0).toUpperCase()}
                        </div>
                        <div
                            className={`${styles.statusDot} `}
                        ></div>
                    </div>
                ) : (
                    <div className={styles.profileImageContainer}>
                        <Image
                            src="/profile-picture.jpg"
                            alt="Profile"
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                )}
                <div className={styles.userInfo}>
                    <h2 className={styles.userName}>
                        {userInfo[0]?.therapist ? "Therapy with" : "Patient"}{" "}
                        <span className={styles.highlightName}>
                            {capitalizeFirstLetter(receiverName || "")}
                        </span>
                    </h2>
                    <p className={styles.userRole}>
                        {!isTyping ? (
                            `Session ${userInfo[0]?.therapist ? "Provider" : "Client"
                            }`
                        ) : (
                            <span className={styles.isTyping}>
                                <i>is typing</i>
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className={styles.actionButtons}>
                <button
                    className={`${styles.callButton} ${styles.videoCall}`}
                    aria-label="Start video call"
                    title="Not available in LTE version"
                >
                    <VideoCameraIcon size={20} weight="fill" />
                </button>

                <button
                    className={`${styles.callButton} ${styles.audioCall}`}
                    aria-label="Start audio call"
                    title="Not available in LTE version"
                >
                    <PhoneIcon size={20} weight="fill" />
                </button>
            </div>
        </nav>
    );
};

export default Nav;