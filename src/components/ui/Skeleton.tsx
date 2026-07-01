import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "text";
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-[var(--radius-md)]",
        variant === "default" && "bg-white/[0.04] h-6",
        variant === "circular" && "bg-white/[0.04] rounded-full",
        variant === "text" && "bg-white/[0.04] h-4",
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-obsidian rounded-[var(--radius-xl)] p-7 space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-12 h-12 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton variant="text" className="w-1/3" />
        </div>
      </div>
      <Skeleton className="h-32 rounded-[var(--radius-md)]" />
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  );
}
