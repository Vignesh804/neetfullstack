import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import { AuthFrame } from "@/pages/auth/AuthFrame";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api, type ApiUserPublic } from "@/lib/api";
import { saveAuthSnapshot } from "@/auth/authStorage";
import { getDeviceId } from "@/lib/device";

const SUBJECTS = ["Physics", "Chemistry", "Biology"] as const;
type Subject = (typeof SUBJECTS)[number];

const SUBJECT_COLORS: Record<Subject, { bg: string; border: string; text: string }> = {
  Physics:   { bg: "rgba(59,130,246,0.2)",  border: "rgba(59,130,246,0.5)",  text: "#60A5FA" },
  Chemistry: { bg: "rgba(34,197,94,0.2)",   border: "rgba(34,197,94,0.5)",   text: "#34D399" },
  Biology:   { bg: "rgba(139,92,246,0.2)",  border: "rgba(139,92,246,0.5)",  text: "#A78BFA" },
};

function toAuthUser(user: ApiUserPublic) {
  return {
    id: String(user.id ?? ""),
    name: String(user.username ?? "Teacher"),
    email: String(user.email ?? ""),
    role: "teacher" as const,
    isPaidUser: Boolean((user as any).is_paid ?? false),
    createdAt: String((user as any).created_at ?? ""),
  };
}

export function TeacherSignupScreen() {
  const navigate = useNavigate();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [subject, setSubject]   = useState<Subject>("Physics");
  const [showPwd, setShowPwd]   = useState(false);
  const [showCfm, setShowCfm]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const resp = await api.auth.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        device_id: getDeviceId(),
        role: "teacher",
      });

      saveAuthSnapshot({
        token: resp.access_token,
        accessToken: resp.access_token,
        refreshToken: resp.refresh_token,
        user: toAuthUser(resp.user),
      });

      try { globalThis.dispatchEvent(new Event("neet_auth_snapshot")); } catch { /* ignore */ }

      try {
        await api.teacher.selfAssignSubject({ subject: subject as any });
      } catch { /* silently skip */ }

      navigate("/teacher", { replace: true });
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes("already registered") || err?.status === 409) {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError(err?.message ?? "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "0.75rem",
    color: "#FFFFFF",
    fontSize: "0.875rem",
    padding: "0.625rem 0.875rem",
    width: "100%",
    outline: "none",
  };

  return (
    <AuthFrame
      title="Teacher Sign Up"
      subtitle="Create your account to manage your subject and students."
    >
      <motion.form
        className="space-y-4"
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold" style={{ color: "#D1D5DB" }}>Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#6B7280" }} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Arjun Verma"
              autoComplete="name"
              required
              style={{ ...inputStyle, paddingLeft: "2.25rem" }}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold" style={{ color: "#D1D5DB" }}>Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#6B7280" }} />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@school.com"
              type="email"
              autoComplete="email"
              required
              style={{ ...inputStyle, paddingLeft: "2.25rem" }}
            />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold" style={{ color: "#D1D5DB" }}>Your Subject</label>
          <div className="grid grid-cols-3 gap-2">
            {SUBJECTS.map((s) => {
              const active = subject === s;
              const colors = SUBJECT_COLORS[s];
              return (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition focus-ring"
                  style={{
                    background: active ? colors.bg : "rgba(255,255,255,0.05)",
                    border: `1px solid ${active ? colors.border : "rgba(255,255,255,0.1)"}`,
                    color: active ? colors.text : "rgba(255,255,255,0.5)",
                    boxShadow: active ? `0 0 16px ${colors.bg}` : "none",
                  }}
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  {s}
                </motion.button>
              );
            })}
          </div>
          <p className="text-[11px]" style={{ color: "#6B7280" }}>
            You'll be assigned to this subject. Admin can change it later.
          </p>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold" style={{ color: "#D1D5DB" }}>Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#6B7280" }} />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              required
              style={{ ...inputStyle, paddingLeft: "2.25rem", paddingRight: "2.5rem" }}
            />
            <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition"
              style={{ color: "#6B7280" }}>
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold" style={{ color: "#D1D5DB" }}>Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#6B7280" }} />
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              type={showCfm ? "text" : "password"}
              autoComplete="new-password"
              required
              style={{
                ...inputStyle,
                paddingLeft: "2.25rem",
                paddingRight: "2.5rem",
                borderColor: confirm && confirm !== password ? "rgba(248,113,113,0.5)" : inputStyle.border as string,
              }}
            />
            <button type="button" onClick={() => setShowCfm(v => !v)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition"
              style={{ color: "#6B7280" }}>
              {showCfm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirm && confirm !== password && (
            <p className="text-[11px]" style={{ color: "#F87171" }}>Passwords don't match</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-4 py-3 text-sm font-semibold"
            style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#FCA5A5" }}
          >
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(139,92,246,0.5)" }}
          whileTap={{ scale: 0.97 }}
          className="relative w-full h-12 rounded-2xl text-sm font-bold text-white overflow-hidden focus-ring disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
            boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
          }}
        >
          {/* Shimmer */}
          {!loading && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            />
          )}
          <span className="relative z-10">
            {loading ? "Creating account..." : "Create Teacher Account →"}
          </span>
        </motion.button>

        {/* Links */}
        <div className="flex flex-col items-center gap-1.5 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
          <span>
            Already have an account?{" "}
            <Link to="/teacher/login" className="hover:underline" style={{ color: "#A78BFA" }}>
              Login
            </Link>
          </span>
          <span>
            Not a teacher?{" "}
            <Link to="/signup" className="hover:underline" style={{ color: "#A78BFA" }}>
              Student sign up
            </Link>
          </span>
        </div>
      </motion.form>
    </AuthFrame>
  );
}
