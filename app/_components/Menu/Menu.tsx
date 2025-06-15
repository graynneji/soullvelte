import Link from "next/link";
import React from "react";
import { GrBottomCorner } from "react-icons/gr";

interface MenuProps {
  isOpen: boolean;
  handleOpenClose: () => void;
}

const styles = {
  closeButton: {
    position: "absolute" as const,
    top: "-8px",
    right: "-8px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#ff4757",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold" as const,
  },
  container: {
    position: "absolute" as const,
    width: "150px",
    height: "auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    padding: "10px",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    bottom: "40px",
  },
  menuItem: {
    padding: "8px",
    textAlign: "center" as const,
    backgroundColor: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "background-color 0.2s ease",
    color: "#333",
  },
  deleteItem: {
    padding: "8px",
    textAlign: "center" as const,
    backgroundColor: "#ffe6e6",
    border: "1px solid #ffcccc",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "background-color 0.2s ease",
    color: "#d63384",
  },
};

const Menu: React.FC<MenuProps> = ({ isOpen, handleOpenClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.container}>
      <button
        style={styles.closeButton}
        onClick={handleOpenClose}
        onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#ff3742")}
        onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#ff4757")}
      >
        ×
      </button>
      <Link href="/therapy/change" passHref>
        <div
          style={styles.menuItem}
          onMouseEnter={(e) => ((e.target as HTMLDivElement).style.backgroundColor = "#f0f0f0")}
          onMouseLeave={(e) => ((e.target as HTMLDivElement).style.backgroundColor = "#ffffff")}
        >
          Change Therapist
        </div>
      </Link>
      <Link href="/therapy/review" passHref>
        <div
          style={styles.menuItem}
          onMouseEnter={(e) => ((e.target as HTMLDivElement).style.backgroundColor = "#f0f0f0")}
          onMouseLeave={(e) => ((e.target as HTMLDivElement).style.backgroundColor = "#ffffff")}
        >
          Give Review
        </div>
      </Link>
      <div
        style={styles.deleteItem}
        onMouseEnter={(e) => ((e.target as HTMLDivElement).style.backgroundColor = "#ffcccc")}
        onMouseLeave={(e) => ((e.target as HTMLDivElement).style.backgroundColor = "#ffe6e6")}
      >
        Delete Account
      </div>
    </div>
  );
};

export default Menu;