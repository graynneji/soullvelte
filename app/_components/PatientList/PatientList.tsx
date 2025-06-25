"use client";
import { useState } from "react";
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    CaretRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import styles from "./PatientList.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { capitalizeFirstLetter } from "../../_utils/";
import { Patient, TherapistPatient } from "@/index";

// Types
// export interface Patient {
//     id: string;
//     patient_id: string;
//     name: string;
//     appointment: string;
// }

// export interface PatientListProps {
//     patient: TherapistPatient;
//     filteredPatients?: Patient[]; 
// }

// Format date to readable string
const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
};

// Format time to readable string
const formatTime = (dateString?: string) => {
    if (!dateString) return "No time";
    const options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "numeric", hour12: true };
    return new Date(dateString).toLocaleTimeString("en-US", options);
};


// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
    let statusClass = styles.statusDefault;
    if (status === "Confirmed") {
        statusClass = styles.statusConfirmed;
    } else if (status === "Rescheduling") {
        statusClass = styles.statusRescheduling;
    } else if (status === "Canceled") {
        statusClass = styles.statusCanceled;
    }
    return (
        <span className={`${styles.statusBadge} ${statusClass}`}>{status}</span>
    );
};

const PatientList = ({ patient }: { patient: TherapistPatient }) => {
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const route = useRouter();
    const searchParams = useSearchParams();
    const patientId = searchParams.get("id");

    const handleFullProfile = (id?: string, name?: string) => {
        if (id && name) {
            route.push(`/dashboard/patient?id=${id}&name=${name}`);
        }
    };

    const notes =
        "The boy have been having some improvment from the first time we started theres a lot of improvment apparently";
    const splitNote = notes.split(" ").slice(0, 6).join(" ");

    return (
        <div className={styles.listContainer}>
            {!patient ? (
                <div className={styles.emptyMessage}>No patients found</div>
            ) : (
                <ul className={styles.patientList}>
                    <li
                        key={patient.id}
                        className={`${styles.patientItem} ${selectedPatient === patient.id ? styles.selectedPatient : ""
                            } ${patientId == patient?.patient_id ? styles.activePatient : ""
                            }`}
                        onClick={() =>
                            setSelectedPatient(
                                patient.id === selectedPatient ? null : patient.id
                            )
                        }
                    >
                        <div className={styles.patientCard}>
                            <div className={styles.patientHeader}>
                                <div className={styles.patientNameContainer}>
                                    <div className={styles.patientIcon}>
                                        <UserIcon size={16} />
                                    </div>
                                    <h3 className={styles.patientName}>
                                        {capitalizeFirstLetter(patient?.name)}
                                    </h3>
                                </div>
                                <CaretRightIcon
                                    size={16}
                                    className={`${styles.chevron} ${selectedPatient === patient.id
                                        ? styles.chevronRotated
                                        : ""
                                        }`}
                                />
                            </div>

                            <div className={styles.appointmentInfo}>
                                <div className={styles.appointmentDetail}>
                                    <div className={styles.appointmentDate}>
                                        <CalendarIcon size={14} className={styles.appointmentIcon} />
                                        <span style={{ color: "#065f46" }}>
                                            {formatDate(patient?.appointment)}
                                        </span>
                                    </div>
                                    <div className={styles.appointmentDate}>
                                        <ClockIcon size={14} className={styles.appointmentIcon} />{" "}
                                        <span style={{ color: "#065f46" }}>
                                            {formatTime(patient?.appointment)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <StatusBadge status="Confirmed" />
                                </div>
                            </div>

                            {selectedPatient === patient.id && (
                                <div className={styles.expandedDetails}>
                                    <div className={styles.detailSection}>
                                        <span className={styles.detailLabel}>Notes:</span>
                                        <p>{splitNote}...</p>
                                    </div>
                                    <button
                                        className={styles.viewProfileButton}
                                        onClick={() =>
                                            handleFullProfile(patient?.patient_id, patient?.name)
                                        }
                                    >
                                        View Full Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </li>
                </ul>
            )}
        </div>
    );
}
export default PatientList