import React from "react";
import { cn } from "@/utils/cn";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "obsidian" | "frost" | "aurora" | "ember" | "crystal" | "heavy" | "medium" | "light" | "heavyDark" | "mediumDark" | "solid";
  hoverEffect?: boolean;
  glowOnHover?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export function GlassCard({
  variant = "obsidian",
  hoverEffect = false,
  glowOnHover = false,
  padding = "lg",
  className,
  children,
  ...props
}: GlassCardProps) {
  const variantClasses: Record<string, string> = {
    obsidian: "glass-obsidian text-[#FAF7F2]",
    frost: "glass-frost text-[#FAF7F2]",
    aurora: "glass-aurora text-[#FAF7F2]",
    ember: "glass-ember text-[#FAF7F2]",
    crystal: "glass-crystal text-[#1C1917]",
    heavy: "glass-heavy text-[#FAF7F2]",
    medium: "glass-medium text-[#FAF7F2]",
    light: "glass-light text-[#FAF7F2]",
    heavyDark: "glass-heavy-dark text-[#FAF7F2]",
    mediumDark: "glass-medium-dark text-[#FAF7F2]",
    solid: "bg-[#1C1917] border border-white/[0.06] text-[#FAF7F2] premium-shadow",
  };

  const paddingClasses: Record<string, string> = {
    none: "p-0",
    sm: "p-4 md:p-5",
    md: "p-5 md:p-7",
    lg: "p-7 md:p-9",
    xl: "p-9 md:p-12",
  };

  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] transition-all duration-[400ms]",
        variantClasses[variant],
        paddingClasses[padding],
        hoverEffect && "hover-lift",
        glowOnHover && "hover-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
