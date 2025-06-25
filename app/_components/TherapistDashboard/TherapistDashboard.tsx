"use client";

import React, { useEffect } from "react";
// import Care from "../Care/Care";
// import MessageInput from "../MessageInput/MessageInput";
// import AppNav from "../AppNav/AppNav";
import styles from "./TherapistDashboard.module.css";
// import FooterMenu from "../FooterMenu/FooterMenu";
import { useSelector, useDispatch } from "react-redux";
// import { getTherapistPatients } from "@/app/store/getTherapistPatientsSlice";
import Image from "next/image";
import Logo from "@/public/Company Logo.svg";
import Button from "../Button/Button";
import { SelectedPatientIdState } from "@/app/_store/selectedPatientIdSlice";
import Welcome from "../Welcome/Welcome";
import Nav from "../Nav/Nav";
import { Patient, User } from "@/index";
import Chat from "../Chat/Chat";
import { RootState } from "@/app/_store/store";
import MessageInput from "../MessageInput/MessageInput";
// import Welcome from "../Welcome/Welcome";
// import { getStoredUsers } from "@/app/store/getStoredUsersSlice";

// Define types for userInfo and patientsTherapist according to your data structure
// Replace 'any' with the actual types if available
interface TherapistDashProps {
    userInfo: User; // Replace with your actual user type
    therapistPatients: Patient; // Replace with your actual patient type
}


const TherapistDashboard: React.FC<TherapistDashProps> = ({ userInfo, therapistPatients }) => {
    const selectedPatient = useSelector(
        (state: RootState) => state.selectedPatientId.selectedPatient
    );

    if (!selectedPatient || Object.keys(selectedPatient).length === 0) {
        return (
            <Welcome userInfo={userInfo} />
        );
    }

    return (
        <section className={styles.appLayout}>
            <Nav userInfo={userInfo} />
            <Chat userInfo={userInfo} />

            <div className={styles.rare}>
                <MessageInput userInfo={userInfo} />
            </div>
        </section>
    );
};

export default TherapistDashboard;