import React, { JSX, ReactNode } from "react";
// import SideBar from "@/app/_components/SideBar/SideBar";
// import UserProvider from "@/app/_provider/UserProvider";
import styles from "./layout.module.css";
import SideBar from "@/app/_components/Sidebar/Sidebar";
import { Earnings, Patient, User } from "@/index";
import { fetchTherapistInfo, fetchTherapistPatients, fetchUser } from "@/app/_lib/services";
import UserProvider from "@/app/_provider/UserProvider";
import IncomingCallModal from "@/app/_components/IncomingCallModal/IncomingCallModal";
import Stream from "@/app/_components/Stream/Stream";
// import IncomingCallModal from "../_components/IncomingCallModal.js/IncomingCallModal";
// import Stream from "../_components/Stream/Stream";

// Optionally, define types for data if available
// Example:
// import type { Patient, Therapist } from "@/types";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function ProviderLayout({ children }: DashboardLayoutProps): Promise<JSX.Element> {
  const [resUser, resTherapistPatients, resTherapistInfo] = await Promise.all([
    fetchUser(),
    fetchTherapistPatients(),
    fetchTherapistInfo()
  ]);

  if (resUser.error || !resUser.data) {
    throw new Error(resUser.error || "Failed to fetch user info");
  }
  if (resTherapistPatients.error || !resTherapistPatients.data) {
    throw new Error(resTherapistPatients.error || "Failed to fetch therapist patients");
  }
  if (resTherapistInfo.error || !resTherapistInfo.data) {
    throw new Error(resTherapistInfo.error || "Failed to fetch therapist info");
  }

  const userInfo: User = resUser.data;
  const therapistPatients: Patient = resTherapistPatients.data;
  const therapistInfo: Earnings = resTherapistInfo.data;

  return (
    <UserProvider>
      <div className={styles.appLayout}>
        <SideBar
          therapistPatients={therapistPatients}
          therapistInfo={therapistInfo}
          userInfo={userInfo}
        />
        <main style={{ flexGrow: 1 }}>
          {children}
        </main>
        <IncomingCallModal userInfo={userInfo} />
        <Stream userInfo={userInfo} />
      </div>
    </UserProvider>
  );
}