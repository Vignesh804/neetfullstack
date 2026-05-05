import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Flame, GraduationCap, Loader2, PlayCircle, Sparkles, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ThumbImage } from "@/components/ui/ThumbImage";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Badge } from "@/components/ui/Badge";
import { subjects, type Video as UiVideo } from "@/data/mockData";
import { useAppStore } from "@/state/useAppStore";
import { useHydrated } from "@/state/useHydrated";
import { getYouTubeThumbnail } from "@/lib/video";
import { api, apiSubjectToKey, type ApiCoursePublic, type ApiDashboardSummary, type ApiLessonPublic } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { staggerContainer, staggerItem } from "@/lib/motion";

function pctFor(videoId: string, durationMin: number, progress: Record<string, any>) {
  const p = progress[videoId];
  const dur = (p?.durationSeconds ?? durationMin * 60) || durationMin * 60;
  if (!dur) return 0;
  return Math.round(((p?.seconds ?? 0) / dur) * 100);
}

function formatHours(totalSeconds: number) {
  const h = Math.max(0, totalSeconds) / 3600;
  if (h < 1) return `${Math.round(h * 60)}m`;
  return `${h.toFixed(h < 10 ? 1 : 0)}h`;
}

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function toUiVideo(lesson: ApiLessonPublic, course: ApiCoursePublic): UiVideo {
  const durationMin = lesson.duration ? Math.max(1, Math.round(lesson.duration / 60)) : 0;
  return {
    id: lesson.id,
    subjectId: apiSubjectToKey(course.subject),
    chapterId: course.id,
    title: lesson.title,
    description: course.description || "Lesson",
    teacher: "NEET Faculty",
    durationMin,
    url: lesson.youtube_id ? `https://www.youtube.com/watch?v=${lesson.youtube_id}` : "",
  };
}

export function HomeDashboardScreen() {
  const navigate = useNavigate();
  const hasHydrated = useHydrated();
  const videoProgress = useAppStore((s) => s.videoProgress);
  const recentVideoIds = useAppStore((s) => s.recentVideoIds);

  const continueLessonIds = useMemo(() => {
    if (!hasHydrated) return [];
    return Object.entries(videoProgress)
      .filter(([id, p]) => isUuid(id) && (p?.seconds ?? 0) >= 10)
      .sort((a, b) => (b[1]?.updatedAt ?? 0) - (a[1]?.updatedAt ?? 0))
      .map(([id]) => id)
      .slice(0, 3);
  }, [videoProgress, hasHydrated]);

  const recentLessonIds = useMemo(() => {
    if (!hasHydrated) return [];
    return recentVideoIds.filter((id) => isUuid(id)).slice(0, 3);
  }, [recentVideoIds, hasHydrated]);

  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [courses, setCourses] = useState<ApiCoursePublic[]>([]);

  const [videoByLessonId, setVideoByLessonId] = useState<Record<string, UiVideo>>({});
  const [action, setAction] = useState<{ courseId: string; type: "watch" | "quiz" } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<ApiDashboardSummary | null>(null);

  const [subjectProgressLoading, setSubjectProgressLoading] = useState(true);
  const [subjectProgress, setSubjectProgress] = useState<Record<string, number>>({});

  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    setSummaryLoading(true);
    api.dashboard.summary()
      .then((s) => setSummary(s))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    setSubjectProgressLoading(true);
    api.dashboard.subjectProgress()
      .then((rows) => {
        const next: Record<string, number> = {};
        for (const r of rows ?? []) next[apiSubjectToKey(r.subject)] = r.progress_pct ?? 0;
        setSubjectProgress(next);
      })
      .catch(() => setSubjectProgress({}))
      .finally(() => setSubjectProgressLoading(false));
  }, []);

  useEffect(() => {
    api.dashboard.courseProgress({ limit: 100, offset: 0 })
      .then((page) => {
        const next: Record<string, number> = {};
        for (const p of page.items ?? []) next[p.course_id] = p.progress_pct ?? 0;
        setCourseProgress(next);
      })
      .catch(() => setCourseProgress({}));
  }, []);

  useEffect(() => {
    setCoursesLoading(true);
    setCoursesError(null);
    api.courses.list({ limit: 12, offset: 0 })
      .then((page) => setCourses(page.items ?? []))
      .catch((err: any) => {
        setCourses([]);
        setCoursesError(err?.message ?? "Failed to load courses.");
      })
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    const ids = Array.from(new Set([...continueLessonIds, ...recentLessonIds]));
    const missing = ids.filter((id) => !videoByLessonId[id]);
    if (missing.length === 0) return;

    Promise.all(
      missing.map(async (id) => {
        try {
          const lesson = await api.lessons.get(id);
          const course = await api.courses.details(lesson.course_id);
          return { id, video: toUiVideo(lesson, course) };
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      setVideoByLessonId((prev) => {
        const next = { ...prev };
        for (const r of results) {
          if (!r) continue;
          next[r.id] = r.video;
        }
        return next;
      });
    });
  }, [continueLessonIds.join("|"), recentLessonIds.join("|")]);

  const continueVideos = useMemo(() => {
    return continueLessonIds.map((id) => videoByLessonId[id]).filter(Boolean) as UiVideo[];
  }, [continueLessonIds, videoByLessonId]);

  const recentlyViewed = useMemo(() => {
    return recentLessonIds.map((id) => videoByLessonId[id]).filter(Boolean) as UiVideo[];
  }, [recentLessonIds, videoByLessonId]);

  const recommendedCourses = useMemo(() => {
    const targetSubject =
      [...subjects]
        .map((s) => ({ id: s.id, pct: subjectProgress[s.id] ?? 0 }))
        .sort((a, b) => a.pct - b.pct)[0]?.id ?? "physics";
    const picks = courses.filter((c) => apiSubjectToKey(c.subject) === targetSubject);
    const extra = courses.filter((c) => apiSubjectToKey(c.subject) !== targetSubject);
    return [...picks, ...extra].slice(0, 3);
  }, [courses, subjectProgress]);

  const topCourses = useMemo(() => courses.slice(0, 3), [courses]);

  const runCourse = async (courseId: string, mode: "watch" | "quiz") => {
    setActionError(null);
    setAction({ courseId, type: mode });
    try {
      await api.courses.enroll(courseId).catch(() => undefined);
      if (mode === "watch") {
        const page = await api.lessons.byCourse(courseId, { limit: 50, offset: 0 });
        const lessons = [...(page.items ?? [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        const first = lessons[0];
        if (!first) throw new Error("No lessons published for this course yet.");
        navigate(`/app/videos/${first.id}`);
        return;
      }
      const quiz = await api.quizzes.byCourse(courseId);
      navigate(`/app/quizzes/${quiz.id}/attempt`);
    } catch (err: any) {
      setActionError(err?.message ?? "Action failed.");
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative overflow-hidden rounded-3xl p-7 md:p-10"
          style={{
            background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 40%, #4F46E5 100%)",
            boxShadow: "0 8px 40px rgba(109,40,217,0.4), 0 0 80px rgba(124,58,237,0.2)",
          }}>
          {/* Animated glow orbs */}
          <motion.div className="absolute -right-16 -top-16 h-64 w-64 rounded-full"
            style={{ background: "rgba(255,255,255,0.12)", filter: "blur(40px)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute -left-20 -bottom-16 h-72 w-72 rounded-full"
            style={{ background: "rgba(79,70,229,0.3)", filter: "blur(50px)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge className="border-white/30 bg-white/15 text-white mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Today's focus
              </Badge>
            </motion.div>

            <motion.div
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Master one course,<br className="hidden md:block" /> then test it.
            </motion.div>

            <motion.div
              className="mt-3 text-sm font-semibold max-w-xl"
              style={{ color: "rgba(255,255,255,0.8)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Watch a short video, take a quiz, then do a quick review. Consistency beats intensity.
            </motion.div>

            <motion.div
              className="mt-6 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/app/subjects">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-bold text-purple-700"
                  style={{ background: "#FFFFFF", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}
                >
                  Start Learning <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
              <Link to="/app/mock-tests">
                <motion.button
                  whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-bold text-white"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  Take a Mock <GraduationCap className="h-4 w-4" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── STATS CARDS ── */}
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        variants={{ animate: { transition: { staggerChildren: 0.12 } } }}
        initial="initial"
        animate="animate"
      >
        {/* Time Watched */}
        <motion.div
          variants={{ initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.03, y: -4 }}
        >
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)" }} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>Time Watched</span>
              <motion.div className="h-10 w-10 rounded-2xl grid place-items-center"
                style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.3)" }}
                whileHover={{ scale: 1.15, rotate: 10 }}>
                <Flame className="h-5 w-5" style={{ color: "#FB923C" }} />
              </motion.div>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: "#FFFFFF" }}>
              {summaryLoading ? <Skeleton className="h-9 w-20" /> : formatHours(summary?.watched_seconds ?? 0)}
            </div>
            <div className="mt-1 text-xs font-semibold" style={{ color: "#6B7280" }}>Updates when you watch lessons</div>
          </div>
        </motion.div>

        {/* Quiz Score */}
        <motion.div
          variants={{ initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -4 }}
        >
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)" }} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>Avg Quiz Score</span>
              <motion.div className="h-10 w-10 rounded-2xl grid place-items-center"
                style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}
                whileHover={{ scale: 1.15, rotate: 10 }}>
                <GraduationCap className="h-5 w-5" style={{ color: "#34D399" }} />
              </motion.div>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: "#FFFFFF" }}>
              {summaryLoading ? <Skeleton className="h-9 w-20" /> : <AnimatedNumber value={summary?.avg_score_pct ?? 0} suffix="%" />}
            </div>
            <div className="mt-1 text-xs font-semibold" style={{ color: "#6B7280" }}>Based on submitted quizzes</div>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          variants={{ initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -4 }}
        >
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />
            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>Overall Progress</span>
            </div>
            <div className="space-y-3">
              {subjectProgressLoading ? (
                <><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></>
              ) : (
                subjects.map((s, i) => {
                  const pct = subjectProgress[s.id] ?? 0;
                  const colors = ["brand", "success", "cyan"] as const;
                  return (
                    <motion.div key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span style={{ color: "#D1D5DB" }}>{s.name}</span>
                        <span style={{ color: "#A78BFA" }}>{pct}%</span>
                      </div>
                      <ProgressBar value={pct} variant={colors[i]} height="xs" />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {(coursesError || actionError) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl px-4 py-3 text-sm font-semibold"
          style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#FCA5A5" }}
        >
          {coursesError ?? actionError}
        </motion.div>
      )}

      <motion.div
        className="grid gap-4 lg:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Continue watching */}
        <div className="rounded-2xl p-5 lg:col-span-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-sm font-extrabold" style={{ color: "#FFFFFF" }}>Continue Learning</div>
              <div className="text-xs font-semibold" style={{ color: "#6B7280" }}>Pick up where you left off</div>
            </div>
            <Link to="/app/recorded-classes" className="text-xs font-bold hover:underline" style={{ color: "#A78BFA" }}>
              Open courses →
            </Link>
          </div>

          <div className="grid gap-3">
            {!hasHydrated ? (
              <><Skeleton className="h-20 w-full rounded-2xl" /><Skeleton className="h-20 w-full rounded-2xl" /></>
            ) : continueVideos.length ? (
              <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="show">
                {continueVideos.map((v) => {
                  const thumb = getYouTubeThumbnail(v.url, "mq");
                  const pct = pctFor(v.id, v.durationMin, videoProgress);
                  return (
                    <motion.div key={v.id} variants={staggerItem} whileHover={{ x: 4 }}>
                      <Link to={`/app/videos/${v.id}`} className="focus-ring rounded-2xl block">
                        <div className="flex items-center gap-3 rounded-2xl p-3 transition"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"}
                          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}>
                          <div className="h-14 w-24 shrink-0 overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                            <ThumbImage src={thumb} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-extrabold" style={{ color: "#FFFFFF" }}>{v.title}</div>
                            <div className="truncate text-xs font-semibold mt-0.5" style={{ color: "#6B7280" }}>{v.teacher} · {v.durationMin} min</div>
                            {pct > 0 && <ProgressBar value={pct} className="mt-2" height="xs" />}
                          </div>
                          <motion.div
                            className="grid h-10 w-10 place-items-center rounded-2xl text-white shrink-0"
                            style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", boxShadow: "0 0 16px rgba(139,92,246,0.4)" }}
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <PlayCircle className="h-5 w-5" />
                          </motion.div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="rounded-2xl p-5 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                <PlayCircle className="h-8 w-8 mx-auto mb-2" style={{ color: "#4B5563" }} />
                <div className="text-sm font-semibold" style={{ color: "#6B7280" }}>
                  Start a course from <span style={{ color: "#A78BFA" }}>My Courses</span> to see continue-watching here.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommended */}
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-sm font-extrabold" style={{ color: "#FFFFFF" }}>Recommended Next</div>
              <div className="text-xs font-semibold" style={{ color: "#6B7280" }}>AI-powered picks</div>
            </div>
            <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA" }}>
              <Wand2 className="h-3 w-3" /> Smart
            </div>
          </div>
          <div className="grid gap-2">
            {coursesLoading ? (
              <><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></>
            ) : (
              recommendedCourses.map((c) => {
                const busy = action?.courseId === c.id && action.type === "watch";
                return (
                  <motion.button key={c.id} type="button"
                    className="w-full text-left focus-ring rounded-xl"
                    onClick={() => runCourse(c.id, "watch")}
                    disabled={Boolean(action) && !busy}
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}>
                    <div className="flex items-center gap-3 rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                        <ThumbImage src={c.thumbnail_url} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-extrabold" style={{ color: "#FFFFFF" }}>{c.title}</div>
                        <div className="truncate text-[10px] font-semibold mt-0.5" style={{ color: "#6B7280" }}>{c.subject.toUpperCase()}</div>
                      </div>
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0"
                        style={{ background: "rgba(139,92,246,0.2)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.3)" }}>
                        {busy ? "..." : "Go"}
                      </span>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {recentlyViewed.length ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <div className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-sm font-extrabold" style={{ color: "#FFFFFF" }}>Recently Viewed</div>
                <div className="text-xs font-semibold" style={{ color: "#6B7280" }}>Quickly jump back in</div>
              </div>
              <Link to="/app/recorded-classes" className="text-xs font-bold hover:underline" style={{ color: "#A78BFA" }}>Browse →</Link>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {recentlyViewed.map((v) => {
                const thumb = getYouTubeThumbnail(v.url, "mq");
                return (
                  <Link key={v.id} to={`/app/videos/${v.id}`} className="focus-ring rounded-2xl">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="rounded-2xl overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="relative w-full pt-[56.25%]">
                        <ThumbImage src={thumb}
                          className="absolute inset-0 h-full w-full object-cover"
                          fallbackClassName="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3">
                          <div className="truncate text-xs font-extrabold text-white">{v.title}</div>
                          <div className="truncate text-[10px] text-white/60">{v.teacher}</div>
                        </div>
                      </div>
                      <div className="p-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full h-9 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
                          style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", boxShadow: "0 0 16px rgba(139,92,246,0.3)" }}>
                          <PlayCircle className="h-3.5 w-3.5" /> Open
                        </motion.button>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* ── TOP COURSES ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-extrabold" style={{ color: "#FFFFFF" }}>Top Courses</div>
              <div className="text-xs font-semibold" style={{ color: "#6B7280" }}>Quick revision + quiz</div>
            </div>
            <Link to="/app/subjects" className="text-xs font-bold hover:underline" style={{ color: "#A78BFA" }}>
              Open subjects →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {coursesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-2 w-full mb-3" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              ))
            ) : (
              topCourses.map((c, i) => {
                const watchBusy = action?.courseId === c.id && action.type === "watch";
                const quizBusy  = action?.courseId === c.id && action.type === "quiz";
                const subjectColors = [
                  { glow: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.3)", tag: "#A78BFA" },
                  { glow: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.3)",  tag: "#34D399" },
                  { glow: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.3)",  tag: "#60A5FA" },
                ][i % 3];
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.03, y: -4, boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 30px ${subjectColors.glow}` }}
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${subjectColors.border}`,
                      boxShadow: `0 0 20px ${subjectColors.glow}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold" style={{ color: "#FFFFFF" }}>{c.title}</div>
                        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: subjectColors.tag }}>
                          {c.subject}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0"
                        style={{ background: subjectColors.glow, color: subjectColors.tag, border: `1px solid ${subjectColors.border}` }}>
                        New
                      </span>
                    </div>

                    <ProgressBar value={courseProgress[c.id] ?? 0} className="mb-4"
                      variant={["brand", "success", "cyan"][i % 3] as any} height="xs" />

                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        type="button"
                        onClick={() => runCourse(c.id, "watch")}
                        disabled={Boolean(action) && !watchBusy}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className="h-9 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                        style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)", color: "#A78BFA" }}>
                        {watchBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : "▶ Watch"}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => runCourse(c.id, "quiz")}
                        disabled={Boolean(action) && !quizBusy}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className="h-9 rounded-xl text-xs font-bold disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "#FFFFFF", boxShadow: "0 0 12px rgba(139,92,246,0.3)" }}>
                        {quizBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : "✦ Quiz"}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
