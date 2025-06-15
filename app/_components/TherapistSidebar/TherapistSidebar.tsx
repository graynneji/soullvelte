"use client";
import React, { useEffect, useState } from "react";
import {
    MagnifyingGlassIcon,
    ChatTextIcon,
    UsersIcon,
    CalendarIcon,
    WalletIcon,
    ClockIcon,
    BookmarkIcon,
    GearSixIcon,
    CaretRightIcon,
    PlusIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import styles from "./TherapistSideBar.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRealTime } from "@/app/hooks/useRealTime";
import { useMessPrev } from "@/app/hooks/useMessPrev";
import { formatTime } from "@/app/utils";
import { getPatientRecvId } from "@/app/store/getPatientRecvIdSlice";
import { usePathname, useRouter } from "next/navigation";
import PatientList from "../PatientList/PatientList";
import { formatCurrency } from "@/app/utils";
import { capitalizeFirstLetter } from "@/app/utils";
import { getAllPatientsAttachedToTherapist } from "@/app/_lib/data-services";

// Interfaces
interface Patient {
    patient_id: string;
    name: string;
    lastMessage?: string;
    time?: string;
    unread?: number;
    status?: "online" | "offline";
}

interface Message {
    message: string;
    created_at: string;
}

interface PatientCardProps {
    patient: Patient;
    collectedMsg: Message | null;
    onHandleClick: (info: { patientId: string; patientName: string }) => void;
    isActive: boolean;
}

// Navigation tabs data
const messNav = [
    { menuName: "Chats", MenuIcon: ChatTextIcon },
    { menuName: "Patients", MenuIcon: UsersIcon },
];

// Patient card component
const PatientCard: React.FC<PatientCardProps> = ({
    patient,
    collectedMsg,
    onHandleClick,
    isActive,
}) => {
    const pathname = usePathname();
    return (
        <div
            className={`${styles.patientCard} ${isActive && pathname == "/dashboard" ? styles.activePatient : ""
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
                    <div className={`${styles.statusDot} ${styles.online}`}></div>
                </div>
                <div className={styles.patientInfo}>
                    <div className={styles.patientHeader}>
                        <h4 className={styles.patientName}>
                            {capitalizeFirstLetter(patient?.name)}
                        </h4>
                        <span className={styles.messageTime}>
                            {formatTime(collectedMsg?.created_at)}
                        </span>
                    </div>
                    <p className={styles.lastMessage}>
                        {collectedMsg?.message?.split(" ").slice(0, 6).join(" ")}
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
    users: { user_id: string }[];
    therapistInfo: any;
}

const TherapistSidebar: React.FC<TherapistSidebarProps> = ({
    users,
    therapistInfo,
}) => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectPatient, setSelectPatient] = useState<string>("");
    const dispatch = useDispatch();
    const pathname = usePathname();
    const route = useRouter();
    const userId = users[0]?.user_id;
    const conversations = useMessPrev(userId);
    const conversationEntries = Object.entries(conversations);
    const messageMap = new Map<string, Message>(conversationEntries as [string, Message][]);
    const [therapistPatients, setTherapistPatients] = useState<Patient[]>([]);

    useEffect(() => {
        async function fetchTherpistPatients() {
            const data = await getAllPatientsAttachedToTherapist();
            setTherapistPatients(data || []);
        }
        fetchTherpistPatients();
    }, []);

    const filteredPatients = therapistPatients.filter(
        (patient) =>
            patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle filter change
    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
    };

    const handleSelectPatient = ({ patientId }: { patientId: string, patientName: string }) => {
        setSelectPatient(patientId);
        if (pathname != "/dashboard") {
            route.push("/dashboard");
            dispatch(getPatientRecvId(patientId));
        } else {
            dispatch(getPatientRecvId(patientId));
        }
    };

    return (
        <>
            <div className={styles.patientListContainer}>
                <h3 className={styles.chatHeader}>Messages</h3>
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
                {activeTab == 1 ? (
                    <div className={styles.forPatient}>
                        <h4
                            style={{
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Patients
                        </h4>
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
            <div className={styles.patientsList}>
                {activeTab !== 1 && (
                    <div className={styles.patientsListHeader}>
                        <h4
                            style={{
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Recent Conversations
                        </h4>
                        <span className={styles.viewAll}>
                            View all <CaretRightIcon size={14} />
                        </span>
                    </div>
                )}
                <div className={styles.patientCardsContainer}>
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => {
                            const collectedMsg = messageMap.get(patient.patient_id) || null;
                            return activeTab == 1 ? (
                                <PatientList
                                    key={patient?.patient_id}
                                    patient={patient}
                                    isActive={patient?.patient_id == selectPatient}
                                    filteredPatients={filteredPatients}
                                />
                            ) : (
                                <PatientCard
                                    key={patient?.patient_id}
                                    patient={patient}
                                    collectedMsg={collectedMsg}
                                    isActive={patient?.patient_id == selectPatient}
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
                <div className={styles.addNewChat}>
                    <div className={styles.addIcon}>
                        <PlusIcon size={20} weight="bold" />
                    </div>
                    <span>Start New Conversation</span>
                </div>
                <h3 className={styles.chatHeader}>Earnings</h3>
                <Link href="/dashboard/wallet">
                    <div
                        className={`${styles.walletShortcut} ${pathname == "/dashboard/wallet" ? styles.activeWallet : ""
                            }`}
                    >
                        <div className={styles.walletIcon}>
                            <WalletIcon size={20} weight="bold" />
                        </div>
                        <div className={styles.walletInfo}>
                            <span className={styles.walletLabel}>Your Wallet</span>
                            <span className={styles.walletBalance}>
                                {formatCurrency(therapistInfo?.therapistData[0]?.balance)}
                            </span>
                        </div>
                        <CaretRightIcon size={16} className={styles.walletArrow} />
                    </div>
                </Link>
            </div>
            <div className={styles.profileDown}>
                <div className={styles.quickActions}>
                    <Link href="/dashboard/history">
                        <div className={styles.actionItem}>
                            <ClockIcon size={20} weight="bold" />
                            <span>History</span>
                        </div>
                    </Link>
                    <Link href="/dashboard/saved">
                        <div className={styles.actionItem}>
                            <BookmarkIcon size={20} weight="bold" />
                            <span>Saved</span>
                        </div>
                    </Link>
                    <Link href="/dashboard/settings">
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