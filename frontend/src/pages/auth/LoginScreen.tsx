import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthFrame } from "@/pages/auth/AuthFrame";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/auth/AuthContext";
import { hasAuthRole, saveAuthRole } from "@/auth/roleStorage";

export function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { signIn } = useAuth();

  useEffect(() => {
    if (!hasAuthRole()) {
      const from = typeof location?.state?.from === "string" ? location.state.from : undefined;
      navigate("/role", { replace: true, state: from ? { from } : undefined });
      return;
    }
    saveAuthRole("student");
  }, [location?.state?.from, navigate]);

  const nextPath = useMemo(() => {
    const from = location?.state?.from;
    return typeof from === "string" ? from : "/app";
  }, [location?.state?.from]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Login to continue your NEET prep with videos, quizzes, and analytics."
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setLoading(true);
          try {
            await signIn({ email, password });
            navigate(nextPath, { replace: true });
          } catch (err: any) {
            setError(err?.message ?? "Login failed.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-ink-700 dark:text-ink-200">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-ink-700 dark:text-ink-200">Password</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-100">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full h-11 rounded-2xl" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
          <Link to="/forgot-password" className="text-byjus-300 hover:underline">
            Forgot password?
          </Link>
          <Link to="/signup" className="text-ink-200 hover:underline">
            Create account
          </Link>
        </div>

      </form>
    </AuthFrame>
  );
}
