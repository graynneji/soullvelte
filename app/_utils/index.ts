// Avatar
export function avatar(name: string): string {
  const parts = name.trim().split(" ");
  const firstInitial = parts[0]?.charAt(0)?.toUpperCase() || "";
  const lastInitial = parts[1]?.charAt(0)?.toUpperCase() || "";
  const initials = firstInitial + lastInitial;
  return initials;
}

// Capitalize first letters
export function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format time
export const formatTime = (timestamp?: string | number | Date): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Format date and time for notes
export function formatNoteDate(timestamp?: string | number | Date): string {
  if (!timestamp) return "No date";

  try {
    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
}

// Community date time
export function formatCommunityTimeAgo(date: string | number | Date): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

// Format the number with commas and decimal places
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Generate color for note
export function getRandomColor(): string {
  const colors = [
    "#FF5733",
    "#33FF57",
    "#5733FF",
    "#FFD700",
    "#00CED1",
    "#FF1493",
    "#8A2BE2",
    "#20B2AA",
    "#FF6347",
    "#FF4500",
    "#ADFF2F",
    "#7B68EE",
    "#DC143C",
    "#00FA9A",
    "#4682B4",
    "#DA70D6",
    "#FF8C00",
    "#B22222",
    "#00FF7F",
    "#6A5ACD",
    "#32CD32",
    "#8B008B",
    "#9932CC",
    "#9400D3",
    "#556B2F",
    "#FFB6C1",
    "#87CEEB",
    "#5F9EA0",
    "#D2691E",
    "#B0C4DE",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// License Key
export const LICENSE_KEY = process.env.LICENSE_KEY as string;
