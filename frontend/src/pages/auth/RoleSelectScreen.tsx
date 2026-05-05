import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Check, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { loadAuthRole, saveAuthRole, type AuthRole } from "@/auth/roleStorage";

// ── Role options ──────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "student" as const,
    title: "Student",
    desc: "Watch videos, attempt quizzes, and track your NEET performance.",
    icon: GraduationCap,
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(59,130,246,0.15) 100%)",
    glow: "rgba(139,92,246,0.4)",
    border: "rgba(139,92,246,0.5)",
    tag: "Most Popular",
    tagColor: "#A78BFA",
    features: ["Video Lectures", "Mock Tests", "Performance Analytics"],
  },
  {
    id: "teacher" as const,
    title: "Teacher",
    desc: "Manage content, track students, and review quiz results.",
    icon: ShieldCheck,
    gradient: "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.15) 100%)",
    glow: "rgba(59,130,246,0.4)",
    border: "rgba(59,130,246,0.5)",
    tag: "Educator",
    tagColor: "#60A5FA",
    features: ["Student Analytics", "Content Upload", "Quiz Creator"],
  },
];

// ── Stagger variants ──────────────────────────────────────────────────────────
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ── Main ──────────────────────────────────────────────────────────────────────
export function RoleSelectScreen() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [role, setRole] = useState<AuthRole>(() => loadAuthRole());
  const from = typeof location?.state?.from === "string" ? location.state.from : undefined;

  function proceed() {
    saveAuthRole(role);
    navigate(role === "teacher" ? "/teacher/login" : "/login", {
      replace: true,
      state: from ? { from } : undefined,
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* ── Logo row ── */}
      <motion.div
        className="flex items-center justify-between w-full max-w-lg mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="focus-ring rounded-2xl">
          <Logo />
        </Link>
        <motion.span
          className="text-sm font-semibold"
          style={{ color: "rgba(255,255,255,0.4)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Choose your role
        </motion.span>
      </motion.div>

      {/* ── Card ── */}
      <motion.div
        className="w-full max-w-lg rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 80px rgba(139,92,246,0.1)",
        }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-bold"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA" }}>
            <Sparkles className="h-3 w-3" /> NEET Learning Platform
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: "#FFFFFF" }}>
            Who are you?
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Select your role to get the right experience
          </p>
        </motion.div>

        {/* Role cards */}
        <motion.div
          className="grid gap-4 md:grid-cols-2 mb-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {ROLES.map((opt) => {
            const Icon = opt.icon;
            const active = role === opt.id;
            return (
              <motion.button
                key={opt.id}
                type="button"
                onClick={() => setRole(opt.id)}
                variants={item}
                whileHover={{
                  scale: 1.04,
                  rotateX: 2,
                  rotateY: active ? 0 : 2,
                  boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 30px ${opt.glow}`,
                }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  opacity: role && !active ? 0.55 : 1,
                  scale: active ? 1.02 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="relative text-left rounded-2xl p-5 overflow-hidden focus-ring"
                style={{
                  background: active ? opt.gradient : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${active ? opt.border : "rgba(255,255,255,0.1)"}`,
                  boxShadow: active ? `0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${opt.glow}` : "none",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Active glow overlay */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: opt.gradient, opacity: 0.3 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10">
                  {/* Icon + check */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <motion.div
                      className="grid h-12 w-12 place-items-center rounded-2xl"
                      style={{
                        background: active ? `${opt.glow.replace("0.4", "0.2")}` : "rgba(255,255,255,0.08)",
                        border: `1px solid ${active ? opt.border : "rgba(255,255,255,0.1)"}`,
                      }}
                      animate={{ scale: active ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Icon className="h-6 w-6" style={{ color: active ? opt.tagColor : "rgba(255,255,255,0.6)" }} />
                    </motion.div>

                    {/* Check badge */}
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="grid h-6 w-6 place-items-center rounded-full"
                          style={{ background: opt.tagColor }}
                        >
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tag */}
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: opt.tagColor }}>
                      {opt.tag}
                    </span>
                  </div>

                  {/* Title + desc */}
                  <div className="text-base font-extrabold mb-1" style={{ color: "#FFFFFF" }}>
                    {opt.title}
                  </div>
                  <div className="text-xs leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {opt.desc}
                  </div>

                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-1">
                    {opt.features.map((f) => (
                      <span key={f} className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                        style={{
                          background: active ? `${opt.glow.replace("0.4", "0.15")}` : "rgba(255,255,255,0.06)",
                          border: `1px solid ${active ? opt.border.replace("0.5", "0.25") : "rgba(255,255,255,0.08)"}`,
                          color: active ? opt.tagColor : "rgba(255,255,255,0.4)",
                        }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="grid gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {/* Continue */}
          <motion.button
            type="button"
            onClick={proceed}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(139,92,246,0.5), 0 0 48px rgba(139,92,246,0.3)" }}
            whileTap={{ scale: 0.97 }}
            className="relative w-full h-12 rounded-2xl text-sm font-bold text-white overflow-hidden focus-ring"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
              boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
            }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
            />
            <span className="relative z-10">
              Continue as {role === "student" ? "Student" : "Teacher"} →
            </span>
          </motion.button>

          {/* Secondary */}
          <AnimatePresence mode="wait">
            {role === "student" ? (
              <motion.button
                key="signup"
                type="button"
                onClick={() => { saveAuthRole("student"); navigate("/signup", { replace: true, state: from ? { from } : undefined }); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full h-11 rounded-2xl text-sm font-semibold focus-ring"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.7)",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                New here? Create student account
              </motion.button>
            ) : (
              <motion.button
                key="teacher-login"
                type="button"
                onClick={() => navigate("/teacher/login", { replace: true })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full h-11 rounded-2xl text-sm font-semibold focus-ring"
                style={{
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  color: "#60A5FA",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                Go to Teacher Login →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-5 flex items-center justify-center gap-2 text-xs"
          style={{ color: "rgba(255,255,255,0.25)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <BookOpen className="h-3 w-3" />
          <span>NEET Learning · Physics · Chemistry · Biology</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
