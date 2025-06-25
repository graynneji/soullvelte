import React from "react";
import styles from "./SidebarSkeleton.module.css";

interface SkeletonBlockProps {
  height?: string | number;
  width?: string | number;
  borderRadius?: string | number;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
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