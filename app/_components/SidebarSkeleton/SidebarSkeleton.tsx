import styles from "./SidebarSkeleton.module.css";

const SidebarSkeleton = () => {
  return (
    <div className={styles.sidebar}>
      {/* Header skeleton */}
      <div className={styles.header}>
        <div className={`${styles.logo} ${styles.skeleton}`}></div>
      </div>

      {/* User profile skeleton */}
      <div className={styles.profile}>
        <div className={`${styles.avatar} ${styles.skeleton}`}></div>
        <div className={styles.profileInfo}>
          <div className={`${styles.name} ${styles.skeleton}`}></div>
          <div className={`${styles.email} ${styles.skeleton}`}></div>
        </div>
      </div>

      {/* Navigation menu skeleton */}
      <nav className={styles.navigation}>
        <div className={styles.menuSection}>
          <div className={`${styles.sectionTitle} ${styles.skeleton}`}></div>
          {[...Array(4)].map((_, index) => (
            <div key={index} className={styles.menuItem}>
              <div className={`${styles.icon} ${styles.skeleton}`}></div>
              <div className={`${styles.menuText} ${styles.skeleton}`}></div>
            </div>
          ))}
        </div>

        <div className={styles.menuSection}>
          <div className={`${styles.sectionTitle} ${styles.skeleton}`}></div>
          {[...Array(3)].map((_, index) => (
            <div key={index} className={styles.menuItem}>
              <div className={`${styles.icon} ${styles.skeleton}`}></div>
              <div className={`${styles.menuText} ${styles.skeleton}`}></div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer skeleton */}
      <div className={styles.footer}>
        <div className={styles.menuItem}>
          <div className={`${styles.icon} ${styles.skeleton}`}></div>
          <div className={`${styles.menuText} ${styles.skeleton}`}></div>
        </div>
        <div className={styles.menuItem}>
          <div className={`${styles.icon} ${styles.skeleton}`}></div>
          <div className={`${styles.menuText} ${styles.skeleton}`}></div>
        </div>
      </div>
    </div>
  );
};

export default SidebarSkeleton;
