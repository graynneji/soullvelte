import SideBar from "@/app/_components/Sidebar/Sidebar";
import styles from "./layout.module.css";
import { fetchUser } from "@/app/_lib/services";
import { User } from "@/index";
import UserProvider from "@/app/_provider/UserProvider";
import IncomingCallModal from "@/app/_components/IncomingCallModal/IncomingCallModal";
import Stream from "@/app/_components/Stream/Stream";


export default async function sessionLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const res = await fetchUser();
    if (res.error || !res.data) {
        throw new Error(res.error)
    }

    const userInfo: User = res.data;
    return (
        <UserProvider>
            <div className={styles.appLayout}>
                <SideBar userInfo={userInfo} />
                <main className={styles.children}>
                    {children}
                </main>
                {/* <Cookies /> */}
            </div>
            <IncomingCallModal userInfo={userInfo} />
            <Stream userInfo={userInfo} />
            {/* <PricingModal />
           */}
        </UserProvider>
    );
}