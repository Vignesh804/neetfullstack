import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type ProgressVariant = "brand" | "success" | "warning" | "danger" | "cyan";

const fillGradients: Record<ProgressVariant, string> = {
  brand:   "linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)",
  success: "linear-gradient(90deg, #22C55E 0%, #10B981 100%)",
  warning: "linear-gradient(90deg, #F59E0B 0%, #F97316 100%)",
  danger:  "linear-gradient(90deg, #EF4444 0%, #F97316 100%)",
  cyan:    "linear-gradient(90deg, #06B6D4 0%, #3B82F6 100%)",
};

const glowColors: Record<ProgressVariant, string> = {
  brand:   "rgba(139,92,246,0.5)",
  success: "rgba(34,197,94,0.5)",
  warning: "rgba(245,158,11,0.5)",
  danger:  "rgba(239,68,68,0.5)",
  cyan:    "rgba(6,182,212,0.5)",
};

export function ProgressBar({
  value,
  className,
  variant = "brand",
  showLabel = false,
  height = "sm",
}: {
  value: number;
  className?: string;
  variant?: ProgressVariant;
  showLabel?: boolean;
  height?: "xs" | "sm" | "md";
}) {
  const reducedMotion = useReducedMotion();
  const v = Math.max(0, Math.min(100, value));
  const heightClass = { xs: "h-1.5", sm: "h-2", md: "h-3" }[height];

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium" style={{ color: "#9CA3AF" }}>
          <span>Progress</span>
          <span style={{ color: "#E5E7EB", fontWeight: 700 }}>{v}%</span>
        </div>
      )}
      <div
        className={cn("w-full rounded-full overflow-hidden", heightClass)}
        style={{ background: "rgba(255,255,255,0.08)" }}
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: fillGradients[variant],
            boxShadow: v > 0 ? `0 0 8px ${glowColors[variant]}` : "none",
          }}
          initial={false}
          animate={{ width: `${v}%` }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 20, delay: 0.1 }
          }
        />
      </div>
    </div>
  );
}
