// import Care from "@/app/_components/Care/Care-v1";
// import TherapistDash from "@/app/_components/TherapistDash/TherapistDash";
import TherapistDashboard from "@/app/_components/TherapistDashboard/TherapistDashboard";
import {
    fetchTherapistPatients,
    fetchUser,
} from "@/app/_lib/services";
import { Patient, User } from "@/index";
import { JSX } from "react";

/**
 * Therapist dashboard page.
 * Fetches user info and attached patients, then renders the dashboard.
 */
export default async function Page(): Promise<JSX.Element> {
    const [resUser, resTherapistPatients] = await Promise.all([
        fetchUser(),
        fetchTherapistPatients()
    ])
    if (resUser.error || !resUser.data) {
        throw new Error(resUser.error || "Failed to fetch user info");
    }
    if (resTherapistPatients.error || !resTherapistPatients.data) {
        throw new Error(resTherapistPatients.error || "Failed to fetch therapist patients");
    }
    const userInfo: User = resUser.data;
    const therapistPatients: Patient = resTherapistPatients.data;
    return (
        <TherapistDashboard
            userInfo={userInfo}
            therapistPatients={therapistPatients}
        />

    );
}