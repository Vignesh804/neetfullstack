import { memo, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useAppStore } from "@/state/useAppStore";

export type BgTheme = "default" | "biology" | "physics" | "chemistry";

// ── Educational floating objects ──────────────────────────────────────────────
const EDU_OBJECTS = [
  { emoji: "✏️", size: 28, blur: false },
  { emoji: "📘", size: 32, blur: false },
  { emoji: "🧬", size: 30, blur: true  },
  { emoji: "⚛️", size: 34, blur: false },
  { emoji: "🧪", size: 28, blur: true  },
  { emoji: "📏", size: 26, blur: false },
  { emoji: "🔬", size: 30, blur: true  },
  { emoji: "📐", size: 26, blur: false },
  { emoji: "💡", size: 28, blur: false },
  { emoji: "🧫", size: 30, blur: true  },
  { emoji: "📊", size: 28, blur: false },
  { emoji: "🔭", size: 32, blur: true  },
];

// Fixed positions so they don't jump on re-render
const POSITIONS = [
  { left: "5%",  top: "8%"  },
  { left: "88%", top: "12%" },
  { left: "15%", top: "75%" },
  { left: "78%", top: "68%" },
  { left: "45%", top: "5%"  },
  { left: "92%", top: "42%" },
  { left: "3%",  top: "45%" },
  { left: "60%", top: "85%" },
  { left: "30%", top: "90%" },
  { left: "70%", top: "20%" },
  { left: "22%", top: "35%" },
  { left: "55%", top: "55%" },
];

// ── Single floating object ────────────────────────────────────────────────────
const FloatingObject = memo(function FloatingObject({
  emoji, size, blur, left, top, delay, duration,
}: {
  emoji: string; size: number; blur: boolean;
  left: string; top: string; delay: number; duration: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        left, top,
        fontSize: size,
        filter: blur ? "blur(1.5px)" : "none",
        willChange: "transform, opacity",
        zIndex: -1,
      }}
      animate={{
        y: [0, -24, 12, -16, 0],
        x: [0, 14, -10, 8, 0],
        rotate: [0, 8, -6, 4, 0],
        opacity: [0.12, 0.22, 0.15, 0.20, 0.12],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "loop",
      }}
    >
      {emoji}
    </motion.div>
  );
});

// ── Glow blob ─────────────────────────────────────────────────────────────────
const GlowBlob = memo(function GlowBlob({
  x, y, size, color, delay, duration,
}: {
  x: string; y: string; size: number;
  color: string; delay: number; duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: color,
        filter: `blur(${Math.round(size * 0.55)}px)`,
        willChange: "transform",
        zIndex: -1,
      }}
      animate={{
        x: [0, 40, -30, 20, 0],
        y: [0, -30, 25, -15, 0],
        scale: [1, 1.12, 0.92, 1.06, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "loop",
      }}
    />
  );
});

// ── Rising particle ───────────────────────────────────────────────────────────
const Particle = memo(function Particle({
  x, delay, color, size,
}: {
  x: string; delay: number; color: string; size: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, bottom: "-10px",
        width: size, height: size,
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}`,
        willChange: "transform, opacity",
        zIndex: -1,
      }}
      animate={{
        y: [0, -(300 + Math.random() * 200)],
        opacity: [0, 0.9, 0.9, 0],
        scale: [0.5, 1, 1, 0.3],
      }}
      transition={{
        duration: 5 + delay * 0.8,
        delay,
        repeat: Infinity,
        ease: "easeOut",
        repeatDelay: delay * 0.5,
      }}
    />
  );
});

// ── Mouse parallax ────────────────────────────────────────────────────────────
function useMouseParallax() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 25, damping: 30 });
  const y = useSpring(my, { stiffness: 25, damping: 30 });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth  - 0.5) * 30);
      my.set((e.clientY / window.innerHeight - 0.5) * 30);
    };
    window.addEventListener("mousemove", h, { passive: true });
    return () => window.removeEventListener("mousemove", h);
  }, [mx, my]);

  return { x, y };
}

// ── Main Component ────────────────────────────────────────────────────────────
export const AnimatedBackground = memo(function AnimatedBackground({
  theme = "default",
}: {
  theme?: BgTheme;
}) {
  const { x, y } = useMouseParallax();

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* Deep dark base */}
      <div className="absolute inset-0" style={{ background: "#0B0F1A" }} />

      {/* ── Mouse-reactive parallax layer ── */}
      <motion.div className="absolute inset-0" style={{ x, y }}>

        {/* Core glow blobs */}
        <GlowBlob x="-8%"  y="5%"   size={500} color="rgba(139,92,246,0.18)"  delay={0}   duration={14} />
        <GlowBlob x="65%"  y="0%"   size={420} color="rgba(59,130,246,0.14)"  delay={2}   duration={17} />
        <GlowBlob x="35%"  y="55%"  size={600} color="rgba(139,92,246,0.10)"  delay={5}   duration={20} />
        <GlowBlob x="75%"  y="65%"  size={350} color="rgba(34,197,94,0.10)"   delay={1}   duration={16} />
        <GlowBlob x="15%"  y="75%"  size={300} color="rgba(236,72,153,0.10)"  delay={3}   duration={18} />

        {/* Biology theme extras */}
        {theme === "biology" && (
          <>
            <GlowBlob x="5%"  y="15%" size={320} color="rgba(34,197,94,0.2)"   delay={0} duration={11} />
            <GlowBlob x="70%" y="35%" size={280} color="rgba(139,92,246,0.16)" delay={2} duration={14} />
          </>
        )}

        {/* Physics theme extras */}
        {theme === "physics" && (
          <>
            <GlowBlob x="25%" y="25%" size={450} color="rgba(59,130,246,0.18)"  delay={0} duration={12} />
            <GlowBlob x="55%" y="55%" size={350} color="rgba(139,92,246,0.14)"  delay={1} duration={15} />
          </>
        )}

        {/* Chemistry theme extras */}
        {theme === "chemistry" && (
          <>
            <GlowBlob x="18%" y="28%" size={380} color="rgba(34,197,94,0.15)"  delay={0} duration={13} />
            <GlowBlob x="60%" y="48%" size={300} color="rgba(59,130,246,0.14)" delay={2} duration={16} />
          </>
        )}
      </motion.div>

      {/* ── Floating educational objects ── */}
      {EDU_OBJECTS.map((obj, i) => (
        <FloatingObject
          key={i}
          emoji={obj.emoji}
          size={obj.size}
          blur={obj.blur}
          left={POSITIONS[i].left}
          top={POSITIONS[i].top}
          delay={i * 0.8}
          duration={14 + i * 1.5}
        />
      ))}

      {/* ── Rising particles ── */}
      {Array.from({ length: 12 }, (_, i) => (
        <Particle
          key={i}
          x={`${4 + i * 8}%`}
          size={i % 4 === 0 ? 5 : i % 3 === 0 ? 4 : 3}
          color={
            i % 3 === 0 ? "rgba(139,92,246,0.9)" :
            i % 3 === 1 ? "rgba(59,130,246,0.8)" :
                          "rgba(34,197,94,0.7)"
          }
          delay={i * 0.5}
        />
      ))}

      {/* ── Radial vignette ── */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(11,15,26,0.5) 100%)",
          zIndex: -1,
        }}
      />
    </div>
  );
});
