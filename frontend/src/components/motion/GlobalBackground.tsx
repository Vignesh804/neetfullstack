import { memo, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ── Educational floating objects ──────────────────────────────────────────────
const EDU_OBJECTS = [
  { emoji: "✏️", size: 28 },
  { emoji: "📘", size: 32 },
  { emoji: "🧬", size: 30 },
  { emoji: "⚛️", size: 34 },
  { emoji: "🧪", size: 28 },
  { emoji: "📏", size: 26 },
  { emoji: "🔬", size: 30 },
  { emoji: "📐", size: 26 },
  { emoji: "💡", size: 28 },
  { emoji: "🧫", size: 30 },
  { emoji: "📊", size: 28 },
  { emoji: "🔭", size: 32 },
];

// Fixed positions — no Math.random() so no re-render jumps
const POSITIONS = [
  { left: "4%",  top: "8%"  },
  { left: "88%", top: "10%" },
  { left: "14%", top: "72%" },
  { left: "80%", top: "65%" },
  { left: "46%", top: "4%"  },
  { left: "93%", top: "40%" },
  { left: "2%",  top: "44%" },
  { left: "62%", top: "82%" },
  { left: "28%", top: "88%" },
  { left: "72%", top: "18%" },
  { left: "20%", top: "32%" },
  { left: "54%", top: "52%" },
];

// ── Mouse parallax ────────────────────────────────────────────────────────────
function useMouseParallax() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 20, damping: 30 });
  const y = useSpring(my, { stiffness: 20, damping: 30 });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth  - 0.5) * 20);
      my.set((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener("mousemove", h, { passive: true });
    return () => window.removeEventListener("mousemove", h);
  }, [mx, my]);

  return { x, y };
}

// ── Main ──────────────────────────────────────────────────────────────────────
export const GlobalBackground = memo(function GlobalBackground() {
  const { x, y } = useMouseParallax();

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        overflow: "hidden",
        pointerEvents: "none",
        background: "#080C16",
      }}
    >
      {/* ── Glow blobs (mouse-reactive) ── */}
      <motion.div style={{ position: "absolute", inset: 0, x, y }}>
        {[
          { left: "-8%",  top: "5%",   size: 500, color: "rgba(139,92,246,0.18)", delay: 0,   dur: 14 },
          { left: "65%",  top: "0%",   size: 420, color: "rgba(59,130,246,0.14)",  delay: 2,   dur: 17 },
          { left: "35%",  top: "55%",  size: 600, color: "rgba(139,92,246,0.10)",  delay: 5,   dur: 20 },
          { left: "75%",  top: "65%",  size: 350, color: "rgba(34,197,94,0.10)",   delay: 1,   dur: 16 },
          { left: "15%",  top: "75%",  size: 300, color: "rgba(236,72,153,0.10)",  delay: 3,   dur: 18 },
        ].map((b, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: b.left, top: b.top,
              width: b.size, height: b.size,
              borderRadius: "50%",
              background: b.color,
              filter: `blur(${Math.round(b.size * 0.55)}px)`,
              willChange: "transform",
            }}
            animate={{ x: [0,40,-30,20,0], y: [0,-30,25,-15,0], scale: [1,1.12,0.92,1.06,1] }}
            transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* ── Floating educational objects ── */}
      {EDU_OBJECTS.map((obj, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: POSITIONS[i].left,
            top: POSITIONS[i].top,
            fontSize: obj.size,
            filter: i % 3 === 0 ? "blur(1px)" : "none",
            willChange: "transform, opacity",
            userSelect: "none",
          }}
          animate={{
            y: [0, -22, 12, -14, 0],
            x: [0, 12, -8, 6, 0],
            rotate: [0, 7, -5, 3, 0],
            opacity: [0.12, 0.22, 0.14, 0.20, 0.12],
          }}
          transition={{
            duration: 14 + i * 1.5,
            delay: i * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop",
          }}
        >
          {obj.emoji}
        </motion.div>
      ))}

      {/* ── Rising particles ── */}
      {Array.from({ length: 10 }, (_, i) => (
        <motion.div
          key={`p${i}`}
          style={{
            position: "absolute",
            left: `${5 + i * 9}%`,
            bottom: -10,
            width: i % 3 === 0 ? 5 : 3,
            height: i % 3 === 0 ? 5 : 3,
            borderRadius: "50%",
            background: i % 3 === 0 ? "rgba(139,92,246,0.9)" : i % 3 === 1 ? "rgba(59,130,246,0.8)" : "rgba(34,197,94,0.7)",
            boxShadow: `0 0 ${(i % 3 === 0 ? 5 : 3) * 3}px ${i % 3 === 0 ? "rgba(139,92,246,0.9)" : i % 3 === 1 ? "rgba(59,130,246,0.8)" : "rgba(34,197,94,0.7)"}`,
            willChange: "transform, opacity",
          }}
          animate={{ y: [0, -400], opacity: [0, 0.9, 0.9, 0], scale: [0.5, 1, 1, 0.3] }}
          transition={{
            duration: 5 + i * 0.6,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeOut",
            repeatDelay: i * 0.4,
          }}
        />
      ))}

      {/* ── Vignette ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(11,15,26,0.5) 100%)",
      }} />
    </div>
  );
});
