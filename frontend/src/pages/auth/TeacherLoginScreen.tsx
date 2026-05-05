import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";
import { AuthFrame } from "@/pages/auth/AuthFrame";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/auth/AuthContext";

export function TeacherLoginScreen() {
  const navigate  = useNavigate();
  const location  = useLocation() as any;

  const nextPath = useMemo(() => {
    const from = location?.state?.from;
    return typeof from === "string" ? from : "/teacher";
  }, [location?.state?.from]);

  const { signInTeacher } = useAuth();

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!teacherCode.trim()) {
      setError("Teacher access code is required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInTeacher({ email, password, teacherCode: teacherCode.trim() });
      navigate(nextPath, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame
      title="Teacher Login"
      subtitle="Enter your credentials and access code to continue."
    >
      <form className="space-y-4" onSubmit={handleLogin}>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-ink-700 dark:text-ink-200">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@example.com"
              type="email"
              autoComplete="email"
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-ink-700 dark:text-ink-200">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pl-9 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Teacher Access Code */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-ink-700 dark:text-ink-200">
            Teacher Access Code
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
            <Input
              value={teacherCode}
              onChange={(e) => setTeacherCode(e.target.value)}
              placeholder="Enter your access code"
              type="password"
              autoComplete="off"
              className="pl-9"
              required
            />
          </div>
          <p className="text-[11px] text-ink-400 dark:text-ink-500">
            Access code is provided by the administrator.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-100">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button type="submit" className="w-full h-11 rounded-2xl" disabled={loading}>
          {loading ? "Logging in..." : "Login as Teacher"}
        </Button>

        {/* Links */}
        <div className="flex flex-col items-center gap-1.5 text-sm font-semibold text-ink-400">
          <span>
            Not a teacher?{" "}
            <Link to="/login" className="text-byjus-300 hover:underline">
              Student login
            </Link>
          </span>
          <span>
            New teacher?{" "}
            <Link to="/teacher/signup" className="text-byjus-300 hover:underline">
              Create account
            </Link>
          </span>
        </div>
      </form>
    </AuthFrame>
  );
}
