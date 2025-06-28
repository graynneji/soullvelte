"use client";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
// import { signOut } from "@/app/_lib/actions";
import { RiSidebarFoldFill, RiSidebarUnfoldFill } from "react-icons/ri";
import SidebarSkeleton from "../SidebarSkeleton/SidebarSkeleton";
import { Earnings, Patient, User } from "@/index";
import TherapistDetails from "../TherapistDetails/TherapistDetails";
import TherapistSidebar from "../TherapistSidebar/TherapistSidebar";



interface RenderComponentProps {
    userInfo: User;
    therapistInfo?: Earnings;
    therapistPatients?: Patient;
}

const RenderComponent: React.FC<RenderComponentProps> = ({ userInfo, therapistInfo, therapistPatients }) => {
    const therapist = userInfo[0]?.therapist;

    return therapist ? (
        <TherapistDetails userInfo={userInfo} />
    ) : therapist === undefined ? (
        <SidebarSkeleton />
    ) : (
        <TherapistSidebar userInfo={userInfo} therapistInfo={therapistInfo} therapistPatients={therapistPatients} />
    );
};

interface SideBarProps {
    therapistInfo?: Earnings;
    userInfo: User;
    therapistPatients?: Patient
}

const SideBar: React.FC<SideBarProps> = ({ userInfo, therapistInfo, therapistPatients }) => {
    const [toggleSidebar, setToggleSidebar] = useState(false)


    if (toggleSidebar) {
        return (
            <div className={styles.collapsedSidebar}>
                <RiSidebarUnfoldFill
                    size={24}
                    onClick={() => setToggleSidebar(!toggleSidebar)}
                    className={styles.toggleIcon}
                />
            </div>
        );
    }

    return (
        <section className={styles.sideBarContainer}>
            <div className={styles.sideBarHeader}>
                <Link href="/" className={styles.logoLink}>
                    <Image
                        width={107}
                        height={20}
                        src="./logo.svg"
                        alt="Logo"
                        className={styles.logo}
                    />
                </Link>

                <RiSidebarFoldFill
                    size={24}
                    onClick={() => setToggleSidebar(!toggleSidebar)}
                    className={styles.toggleIcon}
                />
            </div>

            <RenderComponent userInfo={userInfo} therapistInfo={therapistInfo} therapistPatients={therapistPatients} />
        </section>
    );
};

export default SideBar;