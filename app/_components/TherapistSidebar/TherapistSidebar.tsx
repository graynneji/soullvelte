"use client";
import React, { useState } from "react";
import {
    ChatTextIcon,
    UsersIcon,
    CaretRightIcon,
    ClockIcon,
    BookmarkIcon,
    GearSixIcon,
    WalletIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    ClockUserIcon,
    LockSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import styles from "./TherapistSidebar.module.css";
import { useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import PatientList from "../PatientList/PatientList";
import { formatCurrency } from "@/app/_utils";
import { capitalizeFirstLetter } from "@/app/_utils";
import { Earnings, Patient, User } from "@/index";
import { setSelectedPatientId } from "@/app/_store/selectedPatientIdSlice";
import { usePreviousMsg } from "@/app/_hooks/usePreviousMsg";
import { clearCachedUser } from "@/app/_lib/services";
import { signOut } from "@/app/_lib/actions";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr"
import Button from "../Button/Button";

interface PatientListProps {
    name: string;
    patient_id: string;


}

export interface PatientCardProps {
    patient: PatientListProps;
    collectedMsg: any;
    isActive: boolean;
    onHandleClick: (args: { patientId: string; patientName: string }) => void;
}


// Navigation tabs data
const messNav = [
    { menuName: "Chats", MenuIcon: ChatTextIcon },
    { menuName: "Patients", MenuIcon: UsersIcon },
];

const PatientCard: React.FC<PatientCardProps> = ({
    patient,
    collectedMsg,
    onHandleClick,
    isActive,
}) => {
    const pathname = usePathname();
    return (
        <div
            className={`${styles.patientCard} ${isActive && pathname == "/provider" ? styles.activePatient : ""
                }`}
            onClick={() =>
                onHandleClick({
                    patientId: patient?.patient_id,
                    patientName: patient?.name,
                })
            }
        >
            <>
                <div className={styles.patientAvatar}>
                    <div className={styles.avatarInitial}>
                        {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div
                        className={`${styles.statusDot} ${styles.online}`}
                    // className={`${styles.statusDot} ${styles[patient.status]}`}
                    ></div>
                </div>
                <div className={styles.patientInfo}>
                    <div className={styles.patientHeader}>
                        <h4 className={styles.patientName}>
                            {capitalizeFirstLetter(patient?.name)}
                        </h4>
                        <span className={styles.messageTime}>
                            {/* {formatTime(collectedMsg?.created_at)} */}
                        </span>
                    </div>

                    <p className={styles.lastMessage}>
                        {collectedMsg?.message?.split(" ").slice(0, 6).join(" ") ||
                            <span className={styles.awaiting}><ClockIcon size={20} color="#90ee90" />
                                <span>Awaiting preview message</span>
                            </span>}
                    </p>

                    <div className={styles.messageFooter}>
                        <span className={styles.unreadBadge}>3</span>
                    </div>
                </div>
            </>
        </div>
    );
};

interface TherapistSidebarProps {
    userInfo: User;
    therapistInfo?: Earnings;
    therapistPatients?: Patient;
}

interface SelectedPatient {
    patientId: string;
    patientName: string;
}

const TherapistSidebar: React.FC<TherapistSidebarProps> = ({
    userInfo,
    therapistInfo,
    therapistPatients
}) => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectPatient, setSelectPatient] = useState<SelectedPatient>();
    const dispatch = useDispatch();
    const pathname = usePathname();
    const route = useRouter();
    const userId = userInfo[0]?.user_id;
    const conversations = usePreviousMsg(userId);
    const conversationEntries = Object.entries(conversations);
    const messageMap = new Map<string, any>(conversationEntries);
    const [isPending, startTransition] = React.useTransition();
    const handleSignout = () => {
        startTransition(async () => {
            await clearCachedUser()
            await signOut();
        });
    };


    const filteredPatients = therapistPatients?.filter(
        (patient) => patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? [];

    // Handle filter change
    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
    };

    const handleSelectPatient = (selectedPatient: SelectedPatient) => {
        setSelectPatient(selectedPatient);
        if (pathname !== "/provider") {
            route.push("/provider");
            dispatch(setSelectedPatientId(selectedPatient));
        } else {
            dispatch(setSelectedPatientId(selectedPatient));
        }
    };

    return (
        <>
            <div className={styles.patientListContainer}>
                <h3 className={styles.chatHeader}>Earnings</h3>
                <Link href="/dashboard/wallet">
                    <div
                        className={`${styles.walletShortcut} ${pathname == "#" ? styles.activeWallet : ""
                            }`}
                    >
                        <div className={styles.walletIcon}>
                            <WalletIcon size={20} weight="bold" />
                        </div>
                        <div className={styles.walletInfo}>
                            <span className={styles.walletLabel}>Your Wallet</span>
                            <span className={styles.walletBalance}>
                                {formatCurrency(therapistInfo?.[0]?.balance ?? 0)}
                            </span>
                        </div>
                        <CaretRightIcon size={16} className={styles.walletArrow} />
                        <LockSimpleIcon weight="fill" size={16} className={styles.walletArrow} />
                    </div>
                </Link>
                <h3 className={styles.chatHeader}>Messages</h3>
                {/* Modern search input */}
                <div className={styles.searchContainer}>
                    <MagnifyingGlassIcon
                        size={18}
                        weight="bold"
                        className={styles.searchIcon}
                    />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Navigation tabs with animated indicator */}
                <div className={styles.navigationTabs}>
                    {messNav.map((item, index) => (
                        <div
                            className={`${styles.navTab} ${index === activeTab ? styles.activeTab : ""
                                }`}
                            key={item.menuName}
                            onClick={() => setActiveTab(index)}
                        >
                            <item.MenuIcon
                                size={20}
                                weight={index === activeTab ? "fill" : "bold"}
                            />
                            <span>{item.menuName}</span>
                            {index === activeTab && (
                                <div className={styles.activeIndicator}></div>
                            )}
                        </div>
                    ))}
                </div>
                {/* Filter chips */}
                {activeTab === 1 ? (
                    <div className={styles.forPatient}>
                        <h4 style={{ letterSpacing: "-0.01em" }}>Patients</h4>
                    </div>
                ) : (
                    <div className={styles.filterChips}>
                        {["All", "Unread", "Recent"].map((filter) => (
                            <div
                                key={filter}
                                className={`${styles.chip} ${activeFilter === filter ? styles.activeChip : ""
                                    }`}
                                onClick={() => handleFilterChange(filter)}
                            >
                                <span>{filter}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Patient conversations with visual indicators */}
            <div className={styles.patientsList}>
                {activeTab !== 1 && (
                    <div className={styles.patientsListHeader}>
                        <h4 style={{ letterSpacing: "-0.01em" }}>
                            Recent Conversations
                        </h4>
                        <span className={styles.viewAll}>
                            View all <CaretRightIcon size={14} />
                        </span>
                    </div>
                )}

                {/* Patient cards */}
                <div className={styles.patientCardsContainer}>
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => {
                            const collectedMsg = messageMap.get(patient.patient_id) || null;
                            return activeTab === 1 ? (
                                <PatientList
                                    key={patient?.patient_id}
                                    patient={patient}
                                />
                            ) : (
                                <PatientCard
                                    key={patient?.patient_id}
                                    patient={patient}
                                    collectedMsg={collectedMsg}
                                    isActive={selectPatient?.patientId === patient?.patient_id}
                                    onHandleClick={handleSelectPatient}
                                />
                            );
                        })
                    ) : (
                        <div className={styles.noResults}>
                            <p>No conversations found</p>
                        </div>
                    )}
                </div>

                {/* Add new chat button */}
                <div className={styles.addNewChat}>
                    <div className={styles.addIcon}>
                        <PlusIcon size={20} weight="bold" />
                    </div>
                    <span>Start New Conversation</span>
                </div>
            </div>

            {/* Quick actions at the bottom */}
            <div className={styles.profileDown}>
                <div className={styles.quickActions}>
                    <Link href="#">
                        <div className={styles.actionItem}>
                            <ClockIcon size={20} weight="bold" />
                            <span>History</span>
                        </div>
                    </Link>
                    <div className={styles.actionItem} onClick={handleSignout}>
                        <SignOutIcon size={20} weight="bold" />
                        <span>Log out</span>
                    </div>
                    <Link href="#">
                        <div className={styles.actionItem}>
                            <GearSixIcon size={20} weight="bold" />
                            <span>Settings</span>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default TherapistSidebar;