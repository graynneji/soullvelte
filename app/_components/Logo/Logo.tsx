import LogoHead from "@/public/logo.svg";
import styles from "./Logo.module.css"
function Logo() {
    return (
        <section className={styles.container}>
            <LogoHead width={100} height={20} />
        </section>
    )
}

export default Logo