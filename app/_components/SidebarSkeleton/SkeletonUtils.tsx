import styles from "./SidebarSkeleton.module.css";

export const SkeletonBlock = ({
  height = "20px",
  width = "100%",
  borderRadius = "4px",
}) => {
  return (
    <div
      className={styles.skeletonBlock}
      style={{ height, width, borderRadius }}
    />
  );
};
