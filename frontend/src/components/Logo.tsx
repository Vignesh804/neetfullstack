import { cn } from "@/lib/cn";

export function Logo({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Icon */}
      <div
        className="h-9 w-9 rounded-xl grid place-items-center relative overflow-hidden shrink-0"
        style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
          boxShadow: "0 4px 14px rgba(139,92,246,0.5), 0 0 24px rgba(139,92,246,0.3)",
        }}
      >
        {/* Nebula star pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-white/90" style={{ boxShadow: "0 0 8px rgba(255,255,255,0.8)" }} />
        </div>
        <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-white/60" />
        <div className="absolute bottom-1.5 left-1.5 h-1 w-1 rounded-full bg-white/40" />
      </div>

      {compact ? null : (
        <div className="leading-tight">
          <div className="font-black tracking-tight text-sm" style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            NEBULA NEET
          </div>
          <div className="text-[9px] font-semibold -mt-0.5 uppercase tracking-widest" style={{ color: "#64748B" }}>
            Learn · Evolve · Excel
          </div>
        </div>
      )}
    </div>
  );
}
