import { loadAuthSnapshot, saveAuthSnapshot, type UserRole } from "@/auth/authStorage";
import { getDeviceId } from "@/lib/device";

// In dev, prefer same-origin + Vite proxy to avoid CORS headaches.
const DEFAULT_BASE_URL = (import.meta as any).env?.DEV ? "/api/v1" : "http://localhost:8001/api/v1";
const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ??
  DEFAULT_BASE_URL;

const AUTH_SNAPSHOT_EVENT = "neet_auth_snapshot";

function notifyAuthSnapshotChanged() {
  try {
    globalThis.dispatchEvent(new Event(AUTH_SNAPSHOT_EVENT));
  } catch {
    // ignore
  }
}

export type ApiUserPublic = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  is_paid?: boolean;
  created_at: string;
};

export type ApiTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  user: ApiUserPublic;
};

export type ApiAccessTokenResponse = {
  access_token: string;
  token_type: "bearer";
};

export type ApiPageMeta = {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
};

export type ApiPage<T> = {
  items: T[];
  meta: ApiPageMeta;
};

export type SubjectKey = "physics" | "chemistry" | "biology";
export type ApiSubject = "Physics" | "Chemistry" | "Biology";

export const SUBJECT_KEY_TO_API: Record<SubjectKey, ApiSubject> = {
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
};

export const SUBJECT_API_TO_KEY: Record<ApiSubject, SubjectKey> = {
  Physics: "physics",
  Chemistry: "chemistry",
  Biology: "biology",
};

export function subjectKeyToApi(subject: SubjectKey | undefined): ApiSubject | undefined {
  if (!subject) return undefined;
  return SUBJECT_KEY_TO_API[subject];
}

export function apiSubjectToKey(subject: ApiSubject | string): SubjectKey {
  const s = String(subject ?? "").trim();
  if ((SUBJECT_API_TO_KEY as any)[s]) return (SUBJECT_API_TO_KEY as any)[s] as SubjectKey;
  const lower = s.toLowerCase();
  if (lower === "physics") return "physics";
  if (lower === "chemistry") return "chemistry";
  if (lower === "biology") return "biology";
  return "physics";
}

export type ApiCoursePublic = {
  id: string;
  title: string;
  description: string;
  subject: ApiSubject;
  thumbnail_url: string | null;
  created_at: string;
};

export type ApiLessonPublic = {
  id: string;
  course_id: string;
  title: string;
  youtube_id?: string | null;
  duration: number;
  order_index: number;
  created_at: string;
};

export type ApiProgressPublic = {
  id: string;
  user_id: string;
  lesson_id: string;
  watched_seconds: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiQuizQuestionPublic = {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string | null;
};

export type ApiQuizPublic = {
  id: string;
  course_id: string;
  title: string;
  created_at: string;
  questions: ApiQuizQuestionPublic[];
};

export type ApiQuizResultPublic = {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  created_at: string;
};

export type ApiQuizSubmitResponse = {
  result: ApiQuizResultPublic;
  accuracy_pct: number;
};

export type ApiDashboardSummary = {
  enrolled_courses: number;
  watched_seconds: number;
  completed_lessons: number;
  quiz_attempts: number;
  avg_score_pct: number;
};

export type ApiSubjectProgress = {
  subject: ApiSubject;
  progress_pct: number;
  watched_seconds: number;
  completed_lessons: number;
  total_lessons: number;
  total_duration: number;
};

export type ApiCourseProgress = {
  course_id: string;
  progress_pct: number;
  watched_seconds: number;
  completed_lessons: number;
  total_lessons: number;
  total_duration: number;
};

export type ApiStudentProgressAdmin = {
  id: string;
  username: string;
  email: string;
  created_at: string;
  watched_seconds: number;
  completed_lessons: number;
  quiz_attempts: number;
  avg_score_pct: number;
  last_active_at?: string | null;
};

// ── Teacher / Role-based types ────────────────────────────────────────────────

export type ApiStudentSummaryForTeacher = {
  user_id: string;
  username: string;
  email: string;
  accuracy_pct: number;
  quiz_attempts: number;
  completed_lessons: number;
  progress_pct: number;
  watched_seconds: number;
  is_weak: boolean;
  last_active: string | null;
};

export type ApiRecentQuizActivity = {
  student_name: string;
  student_email: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  accuracy_pct: number;
  submitted_at: string;
};

export type ApiTeacherDashboard = {
  subject: ApiSubject;
  total_students: number;
  avg_class_score_pct: number;
  top_students: ApiStudentSummaryForTeacher[];
  weak_students: ApiStudentSummaryForTeacher[];
  all_students: ApiStudentSummaryForTeacher[];
  recent_quiz_activity: ApiRecentQuizActivity[];
};

export type ApiStudentPerformance = {
  id: string;
  user_id: string;
  subject: ApiSubject;
  total_score: number;
  total_questions: number;
  quiz_attempts: number;
  accuracy_pct: number;
  completed_lessons: number;
  total_lessons: number;
  watched_seconds: number;
  progress_pct: number;
  time_spent_seconds: number;
  updated_at: string;
};

export type ApiTeacherSubject = {
  id: string;
  user_id: string;
  subject: ApiSubject;
  created_at: string;
};

export type UploadFileType = "pdf" | "video";
export type ApiUploadPublic = {
  id: string;
  title: string;
  file_url: string;
  file_type: UploadFileType;
  subject: ApiSubject;
  uploaded_by: string;
  course_id: string | null;
  created_at: string;
};

export type ApiDemoClassType = "recorded" | "live";
export type ApiDemoClassPublic = {
  id: string;
  type: ApiDemoClassType;
  subject: ApiSubject;
  title: string;
  instructor: string;
  duration_min: number;
  starts_at?: string | null;
  ends_at?: string | null;
};

export type ApiDemoVideoSource = {
  provider: "youtube";
  youtube_id: string;
};

export type ApiDemoAccessResponse = {
  access: boolean;
  reason?: "ok" | "upgrade_required" | "not_found" | null;
  video?: ApiDemoVideoSource | null;
};

export type ApiDemoClassProgressPublic = {
  id: string;
  user_id: string;
  class_id: string;
  watched_seconds: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiPremiumStatus = {
  is_paid: boolean;
  device_id?: string | null;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(args: { status: number; message: string; code?: string }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.code = args.code;
  }
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const fullPath = `${API_BASE_URL}${p}`;
  const url =
    fullPath.startsWith("http://") || fullPath.startsWith("https://")
      ? new URL(fullPath)
      : new URL(fullPath, globalThis.location?.origin ?? "http://localhost:5173");
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      if (k === "limit") {
        const n = Number(v);
        if (Number.isFinite(n) && n > 100) {
          url.searchParams.set(k, "100");
          continue;
        }
      }
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function readErrorPayload(resp: Response): Promise<{ message: string; code?: string }> {
  try {
    const data = (await resp.json()) as any;
    const detail = typeof data?.detail === "string" ? data.detail : "Request failed";
    const code = typeof data?.code === "string" ? data.code : undefined;
    return { message: detail, code };
  } catch {
    const text = (await resp.text().catch(() => "")) || "";
    return { message: text || resp.statusText || "Request failed" };
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const resp = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken, device_id: getDeviceId() }),
  });
  if (!resp.ok) {
    throw new ApiError({ status: resp.status, ...(await readErrorPayload(resp)) });
  }
  const data = (await resp.json()) as ApiAccessTokenResponse;
  if (!data?.access_token) throw new ApiError({ status: 500, message: "Invalid refresh response" });
  return data.access_token;
}

type ApiRequestOptions = {
  method?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  headers?: HeadersInit;
  body?: any;
  auth?: boolean;
  retry?: boolean;
  signal?: AbortSignal;
};

async function requestJson<T>(path: string, opts: ApiRequestOptions = {}): Promise<T> {
  const method = (opts.method ?? (opts.body != null ? "POST" : "GET")).toUpperCase();
  const snapshot = loadAuthSnapshot();

  const headers = new Headers(opts.headers);
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (opts.auth !== false) {
    const token = snapshot.accessToken ?? snapshot.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  if (!isForm && opts.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const resp = await fetch(buildUrl(path, opts.query), {
    method,
    headers,
    body: opts.body == null ? undefined : isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
    signal: opts.signal,
  });

  if (resp.status === 401 && opts.retry !== false && snapshot.refreshToken) {
    try {
      const nextAccess = await refreshAccessToken(snapshot.refreshToken);
      const nextSnapshot = { ...snapshot, accessToken: nextAccess, token: nextAccess };
      saveAuthSnapshot(nextSnapshot);
      notifyAuthSnapshotChanged();
      return await requestJson<T>(path, { ...opts, retry: false });
    } catch {
      // Refresh failed — fall through, clear auth below
    }
  }

  if (!resp.ok) {
    // Only clear auth if:
    // 1. It's a 401
    // 2. We are NOT in retry:false mode (which means the caller owns session management)
    // 3. We had auth to begin with
    if (resp.status === 401 && opts.retry !== false && opts.auth !== false) {
      const hadAuth = Boolean(snapshot.token || snapshot.accessToken || snapshot.refreshToken || snapshot.user);
      if (hadAuth) {
        saveAuthSnapshot({ token: null, accessToken: null, refreshToken: null, user: null });
        notifyAuthSnapshotChanged();
      }
    }
    throw new ApiError({ status: resp.status, ...(await readErrorPayload(resp)) });
  }

  if (resp.status === 204) return undefined as any;
  return (await resp.json()) as T;
}

export const api = {
  auth: {
    register: (args: { name: string; email: string; password: string; device_id?: string; role?: UserRole }) =>
      requestJson<ApiTokenResponse>("/auth/register", { method: "POST", body: args, auth: false }),
    login: (args: { email: string; password: string; role?: UserRole; device_id?: string; teacher_code?: string }) =>
      requestJson<ApiTokenResponse>("/auth/login", { method: "POST", body: args, auth: false }),
    // retry:false → don't auto-clear auth on 401; AuthContext handles session expiry itself
    me: () => requestJson<ApiUserPublic>("/auth/me", { retry: false }),
  },
  courses: {
    list: (args: { subject?: SubjectKey; q?: string; limit?: number; offset?: number } = {}) =>
      requestJson<ApiPage<ApiCoursePublic>>("/courses", {
        query: { ...args, subject: subjectKeyToApi(args.subject) },
      }),
    enrolled: (args: { limit?: number; offset?: number } = {}) =>
      requestJson<ApiPage<ApiCoursePublic>>("/courses/enrolled", { query: args }),
    details: (courseId: string) => requestJson<ApiCoursePublic>(`/courses/${courseId}`),
    enroll: (courseId: string) => requestJson(`/courses/${courseId}/enroll`, { method: "POST" }),
    create: (args: { title: string; description?: string; subject: SubjectKey; thumbnail_url?: string | null }) =>
      requestJson<ApiCoursePublic>("/courses", {
        method: "POST",
        body: { ...args, subject: subjectKeyToApi(args.subject) },
      }),
  },
  lessons: {
    byCourse: (courseId: string, args: { limit?: number; offset?: number } = {}) =>
      requestJson<ApiPage<ApiLessonPublic>>(`/courses/${courseId}/lessons`, { query: args }),
    get: (lessonId: string) => requestJson<ApiLessonPublic>(`/lessons/${lessonId}`),
    play: (lessonId: string) => requestJson<ApiDemoAccessResponse>(`/lessons/${lessonId}/play`),
    progress: {
      get: (lessonId: string) => requestJson<ApiProgressPublic>(`/lessons/${lessonId}/progress`),
      update: (lessonId: string, args: { watched_seconds: number; completed: boolean }) =>
        requestJson<ApiProgressPublic>(`/lessons/${lessonId}/progress`, { method: "PUT", body: args }),
    },
    create: (courseId: string, args: { title: string; video_url: string; duration?: number; order_index?: number }) =>
      requestJson<ApiLessonPublic>(`/courses/${courseId}/lessons`, { method: "POST", body: args }),
  },
  quizzes: {
    byCourse: (courseId: string) => requestJson<ApiQuizPublic>(`/quizzes/course/${courseId}`),
    get: (quizId: string) => requestJson<ApiQuizPublic>(`/quizzes/${quizId}`),
    submit: (quizId: string, answers: Record<string, number>) =>
      requestJson<ApiQuizSubmitResponse>(`/quizzes/${quizId}/submit`, { method: "POST", body: { answers } }),
    results: (quizId: string, args: { limit?: number; offset?: number } = {}) =>
      requestJson<ApiPage<ApiQuizResultPublic>>(`/quizzes/${quizId}/results`, { query: args }),
  },
  uploads: {
    list: (args: { subject?: SubjectKey; file_type?: UploadFileType; limit?: number; offset?: number } = {}) =>
      requestJson<ApiPage<ApiUploadPublic>>("/uploads", {
        query: { ...args, subject: subjectKeyToApi(args.subject) },
        auth: false,
      }),
    upload: (form: FormData) => requestJson<ApiUploadPublic>("/uploads", { method: "POST", body: form }),
  },
  dashboard: {
    summary: () => requestJson<ApiDashboardSummary>("/dashboard/summary"),
    subjectProgress: () => requestJson<ApiSubjectProgress[]>("/dashboard/subject-progress"),
    courseProgress: (args: { limit?: number; offset?: number } = {}) =>
      requestJson<ApiPage<ApiCourseProgress>>("/dashboard/course-progress", { query: args }),
    completedCourses: (args: { limit?: number; offset?: number } = {}) =>
      requestJson<ApiPage<ApiCoursePublic>>("/dashboard/completed-courses", { query: args }),
    quizPerformance: (args: { limit?: number; offset?: number } = {}) =>
      requestJson<ApiPage<ApiQuizResultPublic>>("/dashboard/quiz-performance", { query: args }),
  },
  admin: {
    students: (args: { limit?: number; offset?: number } = {}) =>
      requestJson<ApiPage<ApiStudentProgressAdmin>>("/admin/students", { query: args }),
  },
  search: {
    courses: (args: { q: string; subject?: SubjectKey; limit?: number; offset?: number }) =>
      requestJson<ApiPage<ApiCoursePublic>>("/search/courses", {
        query: { ...args, subject: subjectKeyToApi(args.subject) },
        auth: false,
      }),
  },
  demo: {
    classes: () => requestJson<ApiDemoClassPublic[]>("/demo/classes", { auth: false }),
    checkAccess: (args: { class_id: string }) => requestJson<ApiDemoAccessResponse>("/check-access", { query: args }),
    progress: {
      get: (classId: string) => requestJson<ApiDemoClassProgressPublic>(`/demo/classes/${classId}/progress`),
      update: (classId: string, args: { watched_seconds: number; completed: boolean }) =>
        requestJson<ApiDemoClassProgressPublic>(`/demo/classes/${classId}/progress`, { method: "PUT", body: args }),
    },
  },
  premium: {
    status: () => requestJson<ApiPremiumStatus>("/premium/status"),
    demoToggle: (args: { is_paid: boolean }) =>
      requestJson<ApiPremiumStatus>("/premium/demo-toggle", { method: "POST", body: args }),
  },
  teacher: {
    dashboard: () => requestJson<ApiTeacherDashboard>("/teacher/dashboard"),
    mySubject: () => requestJson<ApiTeacherSubject>("/teacher/subject"),
    selfAssignSubject: (args: { subject: ApiSubject }) =>
      requestJson<ApiTeacherSubject>("/teacher/subject/self-assign", { method: "POST", body: args }),
    studentPerformance: () => requestJson<ApiStudentPerformance[]>("/teacher/student/performance"),
    uploadResource: (form: FormData) =>
      requestJson<ApiUploadPublic>("/uploads", { method: "POST", body: form }),
    listResources: (args: { subject?: ApiSubject; file_type?: UploadFileType; limit?: number; offset?: number } = {}) =>
      requestJson<ApiPage<ApiUploadPublic>>("/uploads", { query: args }),
  },
  adminTeacher: {
    assignSubject: (args: { user_id: string; subject: ApiSubject }) =>
      requestJson<ApiTeacherSubject>("/admin/teacher/assign-subject", { method: "POST", body: args }),
  },
};
