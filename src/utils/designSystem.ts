// ForeverVow 2.0 Design System Tokens & Constants
// NOTE: CSS variables in index.css are the source of truth for rendered colors.
// These JS tokens mirror those values for use in Framer Motion and JS logic.

export const DESIGN_TOKENS = {
  colors: {
    // Core — matches CSS vars in index.css
    obsidian: "#09090B",
    charcoal: "#121215",
    stone: "#18181B",
    warmGray: "#71717A",
    muted: "#A1A1AA",
    sand: "#E4E4E7",
    cream: "#F4F4F5",
    ivory: "#FAFAFA",
    white: "#FFFFFF",
    // Accents — matches CSS vars
    gold: "#EAB308",
    goldLight: "#FDE047",
    goldDark: "#CA8A04",
    rose: "#F43F5E",
    roseLight: "#FB7185",
    sage: "#10B981",
    sageLight: "#34D399",
    sky: "#0EA5E9",
    plum: "#A855F7",
  },
  motion: {
    micro: 0.2,
    normal: 0.4,
    slow: 0.6,
    cinematic: 0.9,
    luxury: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    smooth: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    spring: { type: "spring" as const, stiffness: 260, damping: 26 },
    springGentle: { type: "spring" as const, stiffness: 180, damping: 22 },
    fadeIn: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    scaleIn: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    slideUp: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    slideRight: { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
  glass: {
    obsidian: "glass-obsidian",
    frost: "glass-frost",
    aurora: "glass-aurora",
    ember: "glass-ember",
    crystal: "glass-crystal",
    heavy: "glass-heavy",
    medium: "glass-medium",
    light: "glass-light",
    heavyDark: "glass-heavy-dark",
    mediumDark: "glass-medium-dark",
  },
  radius: {
    sm: "12px",
    md: "18px",
    lg: "24px",
    xl: "32px",
    xxl: "40px",
    full: "9999px",
  },
  shadows: {
    sm: "0 4px 14px rgba(0, 0, 0, 0.3)",
    md: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
    lg: "0 20px 50px -12px rgba(0, 0, 0, 0.7)",
    xl: "0 25px 60px -15px rgba(0, 0, 0, 0.8)",
    goldGlow: "0 0 35px rgba(234, 179, 8, 0.35)",
    roseGlow: "0 0 35px rgba(244, 63, 94, 0.35)",
  },
  gradients: {
    aurora: "linear-gradient(135deg, rgba(234, 179, 8, 0.14) 0%, rgba(18, 18, 21, 0.88) 50%, rgba(168, 85, 247, 0.14) 100%)",
    ember: "linear-gradient(135deg, rgba(244, 63, 94, 0.14) 0%, rgba(18, 18, 21, 0.88) 50%, rgba(234, 179, 8, 0.14) 100%)",
    goldText: "linear-gradient(135deg, #FAFAFA 0%, #EAB308 50%, #CA8A04 100%)",
  },
};

export function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "published":
    case "confirmed":
    case "live":
    case "active":
      return {
        bg: "bg-[#7A9E7E]/12 text-[#A8C4AB] border border-[#7A9E7E]/20",
        dot: "bg-[#7A9E7E]",
        label: status === "confirmed" ? "Confirmed" : "Live & Active",
        glow: "shadow-[0_0_12px_-2px_rgba(122,158,126,0.3)]",
      };
    case "draft":
    case "pending":
    case "maybe":
      return {
        bg: "bg-[#D4A853]/12 text-[#E8C97A] border border-[#D4A853]/20",
        dot: "bg-[#D4A853]",
        label: status.toUpperCase(),
        glow: "shadow-[0_0_12px_-2px_rgba(212,168,83,0.3)]",
      };
    case "declined":
    case "archived":
      return {
        bg: "bg-[#C97B7B]/12 text-[#E4A5A5] border border-[#C97B7B]/20",
        dot: "bg-[#C97B7B]",
        label: status.toUpperCase(),
        glow: "shadow-[0_0_12px_-2px_rgba(201,123,123,0.3)]",
      };
    case "wedding week":
      return {
        bg: "bg-[#7B9EB8]/12 text-[#7B9EB8] border border-[#7B9EB8]/20",
        dot: "bg-[#7B9EB8]",
        label: "WEDDING WEEK",
        glow: "shadow-[0_0_12px_-2px_rgba(123,158,184,0.3)]",
      };
    case "completed":
      return {
        bg: "bg-[#9B7BA8]/12 text-[#9B7BA8] border border-[#9B7BA8]/20",
        dot: "bg-[#9B7BA8]",
        label: "COMPLETED",
        glow: "shadow-[0_0_12px_-2px_rgba(155,123,168,0.3)]",
      };
    default:
      return {
        bg: "bg-white/5 text-[#A8A29E] border border-white/10",
        dot: "bg-[#A8A29E]",
        label: status.toUpperCase(),
        glow: "",
      };
  }
}

export function formatWeddingDate(dateString: string | null): string {
  if (!dateString) return "Date To Be Announced";
  try {
    const d = new Date(dateString + "T12:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

// Stagger children animation helper
export function staggerChildren(count: number, baseDelay = 0, staggerAmount = 0.06) {
  return Array.from({ length: count }, (_, i) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: baseDelay + i * staggerAmount },
  }));
}
