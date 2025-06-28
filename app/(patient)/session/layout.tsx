import SideBar from "@/app/_components/Sidebar/Sidebar";
import styles from "./layout.module.css";
import { fetchUser } from "@/app/_lib/services";
import { User } from "@/index";
import UserProvider from "@/app/_provider/UserProvider";


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
            </div>
        </UserProvider>
    );
}