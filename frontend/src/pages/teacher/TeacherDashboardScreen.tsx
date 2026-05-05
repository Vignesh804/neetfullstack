import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Award, BarChart3,
  BookOpen, CheckCircle2, Clock, TrendingUp, Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { staggerContainer, staggerItem, staggerItemFast, staggerItemScale } from "@/lib/motion";
import { api, type ApiStudentSummaryForTeacher, type ApiTeacherDashboard } from "@/lib/api";

function fmtSec(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function fmtDate(iso: string | null) {
  if (!iso) return "Never";
  try { return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" }); }
  catch { return "—"; }
}
function accColor(p: number) {
  return p >= 75 ? "#34D399" : p >= 50 ? "#FCD34D" : "#F87171";
}
function accBg(p: number) {
  return p >= 75 ? "rgba(5,150,105,0.15)" : p >= 50 ? "rgba(217,119,6,0.15)" : "rgba(220,38,38,0.15)";
}
function accVariant(p: number): "success" | "warning" | "danger" {
  return p >= 75 ? "success" : p >= 50 ? "warning" : "danger";
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, icon: Icon, accent, loading, suffix = "" }: {
  label: string; value: number; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string; loading?: boolean; suffix?: string;
}) {
  return (
    <motion.div
      variants={staggerItemScale}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 20 } }}
    >
      <div className="kpi-card">
        {/* Accent top bar */}
        <div className="absolute left-0 top-0 h-1 w-full rounded-t-2xl" style={{ background: accent }} />
        <div className="flex items-start justify-between gap-3 pt-1">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-slate-800">
              {loading
                ? <Skeleton className="h-9 w-20" />
                : <AnimatedNumber value={value} suffix={suffix} />}
            </div>
            {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
          </div>
          <motion.div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ background: `${accent}18` }}
            whileHover={{ scale: 1.15, rotate: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <span style={{ color: accent, display: "flex" }}>
              <Icon className="h-5 w-5" />
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Score Chart ───────────────────────────────────────────────────────────────

function ScoreChart({ students }: { students: ApiStudentSummaryForTeacher[] }) {
  const buckets = [
    { label: "0–25%",   color: "#EF4444", count: students.filter((s) => s.accuracy_pct <= 25).length },
    { label: "26–50%",  color: "#F59E0B", count: students.filter((s) => s.accuracy_pct > 25 && s.accuracy_pct <= 50).length },
    { label: "51–75%",  color: "#3B82F6", count: students.filter((s) => s.accuracy_pct > 50 && s.accuracy_pct <= 75).length },
    { label: "76–100%", color: "#10B981", count: students.filter((s) => s.accuracy_pct > 75).length },
  ];
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="flex items-end gap-4 h-28 px-2">
      {buckets.map((b, i) => (
        <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-xs font-bold" style={{ color: b.color }}>{b.count}</span>
          <div className="w-full flex items-end" style={{ height: 72 }}>
            <motion.div className="w-full rounded-t-xl"
              style={{ background: b.color, opacity: 0.85 }}
              initial={{ height: 0 }}
              animate={{ height: `${(b.count / max) * 100}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }} />
          </div>
          <span className="text-[9px] font-medium text-slate-400 text-center">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Student Row ───────────────────────────────────────────────────────────────

function StudentRow({ student, rank }: { student: ApiStudentSummaryForTeacher; rank?: number }) {
  return (
    <motion.div variants={staggerItemFast}
      className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 transition hover:border-brand-200 dark:hover:border-purple-500/40 hover:bg-brand-50 dark:hover:bg-purple-500/10">
      {rank !== undefined && (
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold"
          style={{
            background: rank === 1 ? "#7C3AED" : rank === 2 ? "rgba(255,255,255,0.1)" : rank === 3 ? "#6D28D9" : "rgba(255,255,255,0.06)",
            color: rank <= 3 ? "#FFFFFF" : "#D1D5DB",
          }}>
          {rank}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-800">{student.username}</span>
          {student.is_weak && (
            <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-500">
              Weak
            </span>
          )}
        </div>
        <div className="text-[10px] text-slate-400 truncate">{student.email}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-bold" style={{ color: accColor(student.accuracy_pct) }}>
          {student.accuracy_pct.toFixed(0)}%
        </div>
        <div className="text-[10px] text-slate-400">{student.quiz_attempts} quizzes</div>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Tab = "overview" | "students" | "weak" | "activity";

export function TeacherDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiTeacherDashboard | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [noSubject, setNoSubject] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.teacher.dashboard()
      .then(setData)
      .catch((err: any) => {
        // 404 means no subject assigned — redirect to subject page
        if (err?.status === 404 || err?.message?.toLowerCase().includes("subject")) {
          setNoSubject(true);
        } else {
          setError(err?.message ?? "Failed to load");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // No subject assigned → redirect to My Subject page
  if (noSubject) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <BookOpen className="h-12 w-12" style={{ color: "#A78BFA" }} />
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: "#FFFFFF" }}>No subject assigned yet</div>
          <div className="mt-1 text-sm" style={{ color: "#9CA3AF" }}>Please assign your subject to get started.</div>
        </div>
        <a href="/teacher/subject"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", boxShadow: "0 4px 14px rgba(139,92,246,0.4)" }}>
          Go to My Subject →
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <div className="text-center">
          <div className="font-bold text-slate-800">{error ?? "No data available"}</div>
          <div className="mt-1 text-sm text-slate-500">Make sure a subject is assigned to your account.</div>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview",  label: "Overview" },
    { id: "students",  label: "All Students", count: data.total_students },
    { id: "weak",      label: "Needs Help",   count: data.weak_students.length },
    { id: "activity",  label: "Activity",     count: data.recent_quiz_activity.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Dashboard</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="badge-purple">{data.subject}</span>
            <span className="text-sm text-slate-400">Your assigned subject</span>
          </div>
        </div>
        <motion.div
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right shadow-card"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="text-xs text-slate-400">Class average</div>
          <div className="text-2xl font-black" style={{ color: accColor(data.avg_class_score_pct) }}>
            {data.avg_class_score_pct.toFixed(0)}%
          </div>
        </motion.div>
      </motion.div>

      {/* KPI cards */}
      <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
        initial="hidden" animate="show">
        <KPICard label="Total Students" value={data.total_students} sub={`In ${data.subject}`}
          icon={Users} accent="#6C5CE7" />
        <KPICard label="Avg Class Score" value={Math.round(data.avg_class_score_pct)} suffix="%"
          sub="Across all quizzes" icon={TrendingUp}
          accent={accColor(data.avg_class_score_pct)} />
        <KPICard label="Top Performers" value={data.top_students.length} sub="Score ≥ 75%"
          icon={Award} accent="#F59E0B" />
        <KPICard label="Need Attention" value={data.weak_students.length} sub="Score < 40%"
          icon={AlertTriangle} accent={data.weak_students.length > 0 ? "#EF4444" : "#10B981"} />
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-0">
        {tabs.map((t) => (
          <motion.button
            key={t.id} type="button" onClick={() => setTab(t.id)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id ? "text-brand-600" : "text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
            {t.count !== undefined && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                tab === t.id ? "bg-brand-100 text-brand-600" : "bg-slate-100 text-slate-500"
              }`}>{t.count}</span>
            )}
            {tab === t.id && (
              <motion.div layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-500"
                transition={{ type: "spring", stiffness: 380, damping: 30 }} />
            )}
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}>

          {tab === "overview" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <motion.div
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-card backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 24 }}
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(108,92,231,0.1)" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Score Distribution</div>
                    <div className="text-xs text-slate-400 mt-0.5">Students across accuracy ranges</div>
                  </div>
                  <BarChart3 className="h-5 w-5 text-brand-400" />
                </div>
                <ScoreChart students={data.all_students} />
              </motion.div>

              <motion.div
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-card backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(108,92,231,0.1)" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-bold text-slate-800">Top Performers</div>
                  <Award className="h-5 w-5 text-amber-400" />
                </div>
                {data.top_students.length === 0 ? (
                  <div className="flex h-28 items-center justify-center text-sm text-slate-400">No quiz data yet</div>
                ) : (
                  <motion.div className="space-y-2" variants={staggerContainer} initial="hidden" animate="show">
                    {data.top_students.map((s, i) => <StudentRow key={String(s.user_id)} student={s} rank={i + 1} />)}
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-card backdrop-blur-sm lg:col-span-2"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 24 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-bold text-slate-800">Student Accuracy Breakdown</div>
                  <Activity className="h-5 w-5 text-brand-400" />
                </div>
                {data.all_students.length === 0 ? (
                  <div className="text-sm text-slate-400">No performance data yet.</div>
                ) : (
                  <div className="space-y-3">
                    {data.all_students.slice(0, 10).map((s) => (
                      <div key={String(s.user_id)} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600 truncate max-w-[200px]">{s.username}</span>
                          <span style={{ color: accColor(s.accuracy_pct) }} className="font-bold">{s.accuracy_pct.toFixed(0)}%</span>
                        </div>
                        <ProgressBar value={s.accuracy_pct} variant={accVariant(s.accuracy_pct)} height="xs" />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {tab === "students" && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-card backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="font-bold text-slate-800">All Students — {data.subject}</div>
                <span className="badge-purple">{data.total_students}</span>
              </div>
              {data.all_students.length === 0 ? (
                <div className="flex h-28 items-center justify-center text-sm text-slate-400">No students yet.</div>
              ) : (
                <motion.div className="space-y-2" variants={staggerContainer} initial="hidden" animate="show">
                  {data.all_students.map((s) => (
                    <motion.div key={String(s.user_id)} variants={staggerItemFast}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-200 hover:bg-brand-50">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">{s.username}</span>
                            {s.is_weak && <span className="badge-danger">Needs Help</span>}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">{s.email}</div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{s.completed_lessons} lessons</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-blue-400" />{fmtSec(s.watched_seconds)}</span>
                            <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-brand-400" />{s.quiz_attempts} quizzes</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xl font-black" style={{ color: accColor(s.accuracy_pct) }}>{s.accuracy_pct.toFixed(0)}%</div>
                          <div className="text-[10px] text-slate-400">accuracy</div>
                        </div>
                      </div>
                      <ProgressBar value={s.progress_pct} className="mt-3" height="xs" />
                      <div className="mt-1 text-[10px] text-slate-400">{s.progress_pct.toFixed(0)}% progress · Last active {fmtDate(s.last_active)}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {tab === "weak" && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-card backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-800">Students Needing Help</div>
                  <div className="text-xs text-slate-400 mt-0.5">Accuracy below 40%</div>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              {data.weak_students.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="text-sm font-medium text-emerald-700">All students are performing above 40%!</div>
                </div>
              ) : (
                <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="show">
                  {data.weak_students.map((s) => (
                    <motion.div key={String(s.user_id)} variants={staggerItemFast}
                      className="rounded-xl border border-red-100 bg-red-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800">{s.username}</div>
                          <div className="text-xs text-slate-400">{s.email}</div>
                          <div className="mt-1 text-xs text-slate-400">{s.quiz_attempts} attempts · {s.completed_lessons} lessons</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xl font-black text-red-500">{s.accuracy_pct.toFixed(0)}%</div>
                          <div className="text-[10px] text-red-400">accuracy</div>
                        </div>
                      </div>
                      <ProgressBar value={s.accuracy_pct} variant="danger" className="mt-3" height="xs" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {tab === "activity" && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-card backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="font-bold text-slate-800">Recent Quiz Activity</div>
                <Activity className="h-5 w-5 text-brand-400" />
              </div>
              {data.recent_quiz_activity.length === 0 ? (
                <div className="flex h-28 items-center justify-center text-sm text-slate-400">No quiz submissions yet.</div>
              ) : (
                <motion.div className="space-y-2" variants={staggerContainer} initial="hidden" animate="show">
                  {data.recent_quiz_activity.map((a, i) => (
                    <motion.div key={i} variants={staggerItemFast}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 transition hover:border-brand-200 dark:hover:border-purple-500/40 hover:bg-brand-50 dark:hover:bg-purple-500/10">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{a.student_name}</div>
                        <div className="text-xs text-slate-400 truncate">{a.quiz_title}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ color: accColor(a.accuracy_pct) }}>{a.score}/{a.total_questions}</div>
                          <div className="text-[10px] text-slate-400">{fmtDate(a.submitted_at)}</div>
                        </div>
                        <span className="rounded-lg px-2 py-0.5 text-xs font-bold"
                          style={{ background: accBg(a.accuracy_pct), color: accColor(a.accuracy_pct) }}>
                          {a.accuracy_pct.toFixed(0)}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
