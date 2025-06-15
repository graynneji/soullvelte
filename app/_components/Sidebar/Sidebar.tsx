"use client";
import styles from "./SideBar.module.css";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/LOGO IN BLACK PNG.svg";
import {
    UserCircleIcon,
    SealCheckIcon,
    VideoCameraIcon,
    ChatTeardropTextIcon,
    SignOutIcon,
    DotsThreeOutlineIcon,
    CalendarCheckIcon,
    UsersThreeIcon,
    CheckCircle,
    CertificateIcon,
    BrainIcon,
    ChatsIcon,
    PhoneCallIcon,
} from "@phosphor-icons/react/dist/ssr";
import ProfilePicsThera from "@/public/t.jpg";
import React, { useEffect, useState, useTransition } from "react";
// import { signOut } from "@/app/_lib/actions";
import { useDispatch, useSelector } from "react-redux";
// import { sideBarToggle } from "@/app/store/sideBarSlice";
import TherapistSidebar from "../TherapistSideBar/TherapistSideBar";
import { RiSidebarFoldFill, RiSidebarUnfoldFill } from "react-icons/ri";
import SidebarSkeleton from "../SidebarSkeleton/SidebarSkeleton";
import Menu from "../Menu/Menu";
import { usePathname, useSearchParams } from "next/navigation";
// import { getUsers } from "@/app/_lib/data-services";

// Type definitions
interface Therapist {
    name: string;
    summary: string;
    license: string;
    authority: string;
    therapist_id: string;
}

interface User {
    user_id: string;
    name: string;
    therapist?: Therapist;
}

interface RenderTherapistDetailsProps {
    users: User[];
}

const RenderTherapistDetails: React.FC<RenderTherapistDetailsProps> = ({ users }) => {
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const queryString = searchParams.toString();
    const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;
    const repCurrentUrl = currentUrl.replace("+", " ");
    const handleSignout = () => {
        // startTransition(() => signOut());
    };
    const handleOpenClose = () => {
        setIsOpen((prev) => !prev);
    };

    const therapist = {
        isVerified: true,
        profileImage: "/maya.jpg",
        communication: ["Video", "Phone", "Chat"],
        specialties: ["Anxiety", "Depression", "PTSD"],
    };

    const menus = [
        {
            title: "Session",
            Icon: ChatsIcon,
            url: "/therapy",
        },
        {
            title: "Appointment",
            Icon: CalendarCheckIcon,
            url: `/therapy/appointment?userID=${users[0]?.user_id}&therapistId=${users[0]?.therapist?.therapist_id}`,
        },
        {
            title: "CareFlow AI",
            Icon: BrainIcon,
            url: `/therapy/careflow-ai/${users[0]?.user_id}`,
        },
        {
            title: "Community",
            Icon: UsersThreeIcon,
            url: `/therapy/community?userID=${users[0]?.user_id}&author=${users[0]?.name}`,
        },
    ];

    const getIcon = (method: string) => {
        switch (method) {
            case "Video":
                return (
                    <VideoCameraIcon size={24} weight="fill" className={styles.commIcon} />
                );
            case "Phone":
                return (
                    <PhoneCallIcon size={24} weight="fill" className={styles.commIcon} />
                );
            case "Chat":
                return (
                    <ChatTeardropTextIcon
                        size={24}
                        weight="fill"
                        className={styles.commIcon}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.therapistProfileContainer}>
            {/* Profile header with visual enhancements */}
            <div className={styles.profileHeader}>
                <div className={styles.profileImageContainer}>
                    <Image
                        src={ProfilePicsThera}
                        alt="Therapist profile"
                        width={90}
                        height={90}
                        className={styles.therapistImage}
                    />
                    <div className={styles.statusIndicator}></div>
                </div>

                <div className={styles.nameVerification}>
                    <h2 className={styles.therapistName}>
                        {users[0]?.therapist?.name}
                        <SealCheckIcon
                            size={22}
                            color="#1D9BF0"
                            weight="fill"
                            className={styles.verifiedBadge}
                        />
                    </h2>
                    <div className={styles.credentialBar}>
                        <div className={styles.badge}>
                            <CertificateIcon size={16} weight="fill" color="#4e7560" />
                            <span className={styles.badgeText}>Mental Specialist</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio with card styling */}
            <div className={styles.bioCard}>
                <p className={styles.bioText}>{users[0]?.therapist?.summary}</p>
            </div>

            {/* Information sections with card styling and icons */}
            <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                    <div className={styles.infoIconContainer}>
                        <SealCheckIcon size={20} weight="fill" className={styles.infoIcon} />
                    </div>
                    <div className={styles.infoContent}>
                        <span className={styles.infoLabel}>License</span>
                        <p className={styles.infoValue}>
                            {users[0]?.therapist?.license} ({users[0]?.therapist?.authority})
                        </p>
                    </div>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoIconContainer}>
                        <UserCircleIcon size={20} weight="fill" className={styles.infoIcon} />
                    </div>
                    <div className={styles.infoContent}>
                        <span className={styles.infoLabel}>Specialties</span>
                        <div className={styles.specialtyTags}>
                            {therapist.specialties.map((specialty) => (
                                <span key={specialty} className={styles.specialtyTag}>
                                    {specialty}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons with enhanced styling */}
            <div className={styles.actionButtonsContainer}>
                {menus.map((menu) => (
                    <Link key={menu?.title} href={menu.url}>
                        <button
                            className={`${styles.actionButton} ${repCurrentUrl == menu?.url
                                ? styles.primaryButton
                                : styles.secondaryButton
                                }`}
                            type="button"
                        >
                            <menu.Icon size={24} />
                            {menu?.title}
                        </button>
                    </Link>
                ))}

                {/* Communication methods with modern styling */}
                <div className={styles.communicationSection}>
                    <h3 className={styles.sectionTitle}>Communication Methods</h3>
                    <div className={styles.commMethods}>
                        {therapist.communication.map((method) => (
                            <div key={method} className={styles.commMethod}>
                                {getIcon(method)}
                                <span>{method}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.utilityActions}>
                    <button className={styles.utilityButton} onClick={handleOpenClose} type="button">
                        <DotsThreeOutlineIcon size={20} weight="bold" />
                        More Options
                    </button>

                    <button className={styles.logoutButton} onClick={handleSignout} type="button">
                        <SignOutIcon size={20} weight="bold" />
                        {isPending ? "Logging out..." : "Logout"}
                    </button>

                    {isOpen && (
                        <Menu isOpen={isOpen} handleOpenClose={handleOpenClose} />
                    )}
                </div>
            </div>
        </div>
    );
};

// If you want to add types, do so for props
function MapPin(props: { size?: number; color?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.size || 24}
            height={props.size || 24}
            fill={props.color || "currentColor"}
            {...props}
        >
            <path d="M12 1.5c-4.14 0-7.5 3.358-7.5 7.5 0 1.421.403 2.822 1.166 4.03.309.493.677 1.039 1.08 1.582l.653.915C8.51 17.158 11.217 21 12 21c.783 0 3.49-3.842 4.601-5.473l.652-.914c.404-.545.772-1.09 1.08-1.583.764-1.208 1.167-2.609 1.167-4.03 0-4.142-3.36-7.5-7.5-7.5Zm0 17.33c-.207-.006-2.603-2.995-3.877-5.045-.459-.74-.759-1.22-1.006-1.615A6.01 6.01 0 0 1 6 9c0-3.309 2.691-6 6-6s6 2.691 6 6a6.01 6.01 0 0 1-1.117 3.67c-.247.395-.547.875-1.007 1.615-1.273 2.05-3.67 5.039-3.876 5.045Z" />
            <path d="M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 4.5A1.5 1.5 0 1 1 12 7.5a1.5 1.5 0 0 1 0 3Z" />
        </svg>
    );
}

interface RenderComponentProps {
    users: User[];
    therapistInfo: unknown;
}

const RenderComponent: React.FC<RenderComponentProps> = ({ users, therapistInfo }) => {
    const therapist = users[0]?.therapist;

    return therapist ? (
        <RenderTherapistDetails users={users} />
    ) : therapist === undefined ? (
        <SidebarSkeleton />
    ) : (
        <TherapistSidebar users={users} therapistInfo={therapistInfo} />
    );
};

interface SideBarProps {
    therapistInfo: unknown;
}

const SideBar: React.FC<SideBarProps> = ({ therapistInfo }) => {
    const dispatch = useDispatch();
    const sidebar = useSelector((state: any) => state.sideBar.sidebar);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        async function fetchUsers() {
            // const userInfo = await getUsers();
            // setUsers(userInfo || []);
        }
        fetchUsers();
    }, []);

    const handleSidebarToggle = () => {
        // dispatch(sideBarToggle());
    };

    if (sidebar) {
        return (
            <div className={styles.collapsedSidebar}>
                <RiSidebarUnfoldFill
                    size={24}
                    onClick={handleSidebarToggle}
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
                        width={100}
                        height={0}
                        src={Logo}
                        alt="Logo"
                        className={styles.logo}
                        style={{ height: "auto" }}
                    />
                </Link>

                <RiSidebarFoldFill
                    size={24}
                    onClick={handleSidebarToggle}
                    className={styles.toggleIcon}
                />
            </div>

            <RenderComponent users={users} therapistInfo={therapistInfo} />
        </section>
    );
};

export default SideBar;