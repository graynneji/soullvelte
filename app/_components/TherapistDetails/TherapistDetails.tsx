import { usePathname, useSearchParams } from "next/navigation";
import styles from "./TherapistDetails.module.css";
import React, { useTransition } from "react";
import { BrainIcon, CalendarCheckIcon, CertificateIcon, ChatsIcon, ChatTeardropTextIcon, DotsThreeOutlineIcon, LockSimpleIcon, PhoneCallIcon, SealCheckIcon, SignOutIcon, UserCircleIcon, UsersThreeIcon, VideoCameraIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Menu from "../Menu/Menu";
import Image from "next/image";
import { signOut } from "@/app/_lib/actions";
import { clearCachedUser } from "@/app/_lib/services";
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
    userInfo: User[];
}

const TherapistDetails: React.FC<RenderTherapistDetailsProps> = ({ userInfo }) => {
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const queryString = searchParams.toString();
    const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;
    const repCurrentUrl = currentUrl.replace("+", " ");
    const handleSignout = () => {
        startTransition(async () => {
            await clearCachedUser()
            await signOut();
        });
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
            url: "/session",
        },
        {
            title: "Appointment",
            Icon: CalendarCheckIcon,
            url: `/session/appointment?userID=${userInfo[0]?.user_id}&therapistId=${userInfo[0]?.therapist?.therapist_id}`,
        },
        {
            title: "CareFlow AI",
            Icon: BrainIcon,
            url: `#`,
            locked: true,
        },
        {
            title: "Community",
            Icon: UsersThreeIcon,
            url: `#`,
            locked: true,
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
                        src="/profile-picture.jpg"
                        alt="Therapist profile"
                        width={90}
                        height={90}
                        className={styles.therapistImage}
                    />
                    <div className={styles.statusIndicator}></div>
                </div>

                <div className={styles.nameVerification}>
                    <h2 className={styles.therapistName}>
                        {userInfo[0]?.therapist?.name}
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
                <p className={styles.bioText}>{userInfo[0]?.therapist?.summary}</p>
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
                            {userInfo[0]?.therapist?.license} ({userInfo[0]?.therapist?.authority})
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
                            {menu.locked && <LockSimpleIcon weight="fill" size={16} />}
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
                    <button className={styles.utilityButton} type="button">
                        <DotsThreeOutlineIcon size={20} weight="bold" />
                        More Options
                        {" "}
                        <LockSimpleIcon size={16} weight="fill" />
                    </button>

                    <button className={styles.logoutButton} onClick={handleSignout} type="button">
                        <SignOutIcon size={20} weight="bold" />
                        {isPending ? "Logging out..." : "Logout"}
                    </button>


                </div>
            </div>
        </div>
    );
};

export default TherapistDetails;