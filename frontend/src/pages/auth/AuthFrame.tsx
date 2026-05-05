import type React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

// From uploaded code:
// - Animated gradient background (backgroundPosition loop)
// - 5 floating orb circles (x/y animate)
// - Card: y:100 → 0 (exact from uploaded Login)
// - Input: whileFocus scale:1.05

export function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -50 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen grid place-items-center px-4 py-10 relative overflow-hidden"
    >
      {/* Animated gradient bg — from uploaded Splash */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(to right, #4a0080, #000000, #001a4d)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* 5 floating orbs — from uploaded code */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 160, height: 160,
            left: `${5 + i * 20}%`,
            top: `${10 + (i % 3) * 30}%`,
            background: "radial-gradient(circle, rgba(147,51,234,0.25) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 200 - i * 40, -(200 - i * 40), 0],
            y: [0, -(200 - i * 30), 200 - i * 30, 0],
          }}
          transition={{ duration: 10 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="w-full max-w-lg relative z-10">
        {/* Logo row */}
        <motion.div
          className="flex items-center justify-between gap-3 mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Link to="/" className="focus-ring rounded-2xl">
            <Logo />
          </Link>
          <Link
            to="/role"
            className="text-sm font-bold text-white/50 hover:text-white/80 transition focus-ring rounded-xl px-2 py-1"
          >
            Switch role
          </Link>
        </motion.div>

        {/* Card — exact from uploaded Login: y:100 → 0 */}
        <motion.div
          className="rounded-2xl p-8"
          style={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="text-2xl font-extrabold text-white">{title}</div>
            <div className="mt-1 text-sm font-semibold text-white/50">{subtitle}</div>
          </motion.div>
          <div className="mt-6">{children}</div>
        </motion.div>

      </div>
    </motion.div>
  );
}
