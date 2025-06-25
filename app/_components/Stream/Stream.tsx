"use client";
import React from "react";
import CallUI from "../CallUI/CallUI";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/_store/store";
import { User } from "@/index";

interface StreamProps {
    userInfo: User;
}

/** 
 * Stream component that conditionally renders the CallUI component
 * Based on the call state from Redux.
 * Stream component renders the CallUI component if a call is active.
 */
const Stream: React.FC<StreamProps> = ({ userInfo }) => {
    // Select call state from Redux store and destructure values
    const { inCall, caller, type, channel, callerName, receiverName } = useSelector(
        (state: RootState) => state.call
    );

    // Ensure type is either "video" or "audio"
    const safeType = type === "video" || type === "audio" ? type : "audio";

    return (
        <>
            {inCall && (
                <CallUI inCall={inCall} caller={caller} type={safeType} channel={channel} callerName={callerName} receiverName={receiverName} userInfo={userInfo} />
            )}
        </>
    );
}

export default Stream;