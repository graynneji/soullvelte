import PatientDashboard from "@/app/_components/PatientDashboard/PatientDashboard";
import { fetchUser } from "@/app/_lib/services";
import { User } from "@/index";
import { JSX, Suspense } from "react";

/**
 * Patient dashboard page.
 * Fetches user info and renders the dashboard.
 */
export default async function Page(): Promise<JSX.Element> {
  const res = await fetchUser();
  if (res.error || !res.data) {
    throw new Error(res.error);
  }

  const userInfo: User = res.data;

  return (
    <PatientDashboard userInfo={userInfo} />
  );
}