"use client";

import React from "react";
import styles from "./PatientDashboard.module.css";
import { User } from "@/index";
import Chat from "../Chat/Chat";
import Nav from "../Nav/Nav";
import MessageInput from "../MessageInput/MessageInput";

/**
 * Props for PatientDashboard component.
 */
interface PatientDashboardProps {
    userInfo: User;
}

/**
 * PatientDashboard component displays the therapy session layout for patients.
 * @param userInfo - Array of user information for the current patient.
 */
const PatientDashboard: React.FC<PatientDashboardProps> = ({ userInfo }) => {
    return (
        <section className={styles.appLayout}>
            <Nav userInfo={userInfo} />
            <Chat userInfo={userInfo} />
            {/* Render patient dashboard content using userInfo */}
            <div className={styles.rare}>
                <MessageInput userInfo={userInfo} />
            </div>
        </section>
    );
};

export default PatientDashboard;