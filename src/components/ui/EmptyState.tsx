import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("text-center py-16 px-6", className)}
    >
      {icon && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-[22px] glass-obsidian mx-auto mb-6 flex items-center justify-center text-[#D4A853]"
        >
          {icon}
        </motion.div>
      )}
      <h3 className="display text-[24px] text-[#FAF7F2] mb-2">{title}</h3>
      {description && (
        <p className="text-[14px] text-[#78716C] max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
