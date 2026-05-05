import { Suspense, lazy, memo } from "react";
import { Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthProvider } from "@/auth/AuthContext";
import { ProtectedLayout } from "@/auth/ProtectedLayout";
import { AdminLayout } from "@/auth/AdminLayout";
import { TeacherLayout } from "@/auth/TeacherLayout";
import { Spinner } from "@/components/ui/Spinner";

// ── Lazy loader helper ────────────────────────────────────────────────────────
function namedLazy<T extends Record<string, any>, K extends keyof T>(
  loader: () => Promise<T>,
  key: K,
) {
  return lazy(async () => {
    const mod = await loader();
    return { default: mod[key] as any };
  });
}

// ── All pages (unchanged) ─────────────────────────────────────────────────────
const NotFoundScreen        = namedLazy(() => import("./pages/NotFoundScreen"),                    "NotFoundScreen");
const SplashScreen          = namedLazy(() => import("./pages/SplashScreen"),                      "SplashScreen");
const RoleSelectScreen      = namedLazy(() => import("./pages/auth/RoleSelectScreen"),             "RoleSelectScreen");
const LoginScreen           = namedLazy(() => import("./pages/auth/LoginScreen"),                  "LoginScreen");
const AdminLoginScreen      = namedLazy(() => import("./pages/auth/AdminLoginScreen"),             "AdminLoginScreen");
const TeacherLoginScreen    = namedLazy(() => import("./pages/auth/TeacherLoginScreen"),           "TeacherLoginScreen");
const TeacherSignupScreen   = namedLazy(() => import("./pages/auth/TeacherSignupScreen"),          "TeacherSignupScreen");
const SignupScreen          = namedLazy(() => import("./pages/auth/SignupScreen"),                  "SignupScreen");
const ForgotPasswordScreen  = namedLazy(() => import("./pages/auth/ForgotPasswordScreen"),        "ForgotPasswordScreen");
const OTPVerificationScreen = namedLazy(() => import("./pages/auth/OTPVerificationScreen"),       "OTPVerificationScreen");
const HomeDashboardScreen   = namedLazy(() => import("./pages/app/HomeDashboardScreen"),           "HomeDashboardScreen");
const SubjectsScreen        = namedLazy(() => import("./pages/app/SubjectsScreen"),                "SubjectsScreen");
const ChaptersScreen        = namedLazy(() => import("./pages/app/ChaptersScreen"),                "ChaptersScreen");
const VideoPlayerScreen     = namedLazy(() => import("./pages/app/VideoPlayerScreen"),             "VideoPlayerScreen");
const LiveClassScreen       = namedLazy(() => import("./pages/app/LiveClassScreen"),               "LiveClassScreen");
const RecordedClassesScreen = namedLazy(() => import("./pages/app/RecordedClassesScreen"),        "RecordedClassesScreen");
const NotesScreen           = namedLazy(() => import("./pages/app/NotesScreen"),                   "NotesScreen");
const BookmarksScreen       = namedLazy(() => import("./pages/app/BookmarksScreen"),               "BookmarksScreen");
const QuizScreen            = namedLazy(() => import("./pages/app/QuizScreen"),                    "QuizScreen");
const QuizAttemptScreen     = namedLazy(() => import("./pages/app/QuizAttemptScreen"),             "QuizAttemptScreen");
const QuizResultScreen      = namedLazy(() => import("./pages/app/QuizResultScreen"),              "QuizResultScreen");
const MockTestScreen        = namedLazy(() => import("./pages/app/MockTestScreen"),                "MockTestScreen");
const TestAttemptScreen     = namedLazy(() => import("./pages/app/TestAttemptScreen"),             "TestAttemptScreen");
const TestResultScreen      = namedLazy(() => import("./pages/app/TestResultScreen"),              "TestResultScreen");
const PerformanceDashboardScreen = namedLazy(() => import("./pages/app/PerformanceDashboardScreen"), "PerformanceDashboardScreen");
const SubjectPerformanceScreen   = namedLazy(() => import("./pages/app/SubjectPerformanceScreen"),   "SubjectPerformanceScreen");
const DoubtSolvingScreen    = namedLazy(() => import("./pages/app/DoubtSolvingScreen"),            "DoubtSolvingScreen");
const NotificationsScreen   = namedLazy(() => import("./pages/app/NotificationsScreen"),           "NotificationsScreen");
const ProfileScreen         = namedLazy(() => import("./pages/app/ProfileScreen"),                 "ProfileScreen");
const SettingsScreen        = namedLazy(() => import("./pages/app/SettingsScreen"),                "SettingsScreen");
const AdminDashboardScreen  = namedLazy(() => import("./pages/admin/AdminDashboardScreen"),        "AdminDashboardScreen");
const TeacherDashboardScreen     = namedLazy(() => import("./pages/teacher/TeacherDashboardScreen"),     "TeacherDashboardScreen");
const TeacherMySubjectScreen     = namedLazy(() => import("./pages/teacher/TeacherMySubjectScreen"),     "TeacherMySubjectScreen");
const TeacherStudentsScreen      = namedLazy(() => import("./pages/teacher/TeacherStudentsScreen"),      "TeacherStudentsScreen");
const AssignmentBuilderScreen    = namedLazy(() => import("./pages/teacher/AssignmentBuilderScreen"),    "AssignmentBuilderScreen");
const DoubtManagementScreen      = namedLazy(() => import("./pages/teacher/DoubtManagementScreen"),      "DoubtManagementScreen");
const LiveClassSchedulerScreen   = namedLazy(() => import("./pages/teacher/LiveClassSchedulerScreen"),   "LiveClassSchedulerScreen");
const ContentPlannerScreen       = namedLazy(() => import("./pages/teacher/ContentPlannerScreen"),       "ContentPlannerScreen");
const QuestionBankScreen         = namedLazy(() => import("./pages/teacher/QuestionBankScreen"),         "QuestionBankScreen");
const TestCreatorScreen          = namedLazy(() => import("./pages/teacher/TestCreatorScreen"),          "TestCreatorScreen");
const StudentDeepProfileScreen   = namedLazy(() => import("./pages/teacher/StudentDeepProfileScreen"),   "StudentDeepProfileScreen");
const AnnouncementsScreen        = namedLazy(() => import("./pages/teacher/AnnouncementsScreen"),        "AnnouncementsScreen");
const LeaderboardControlScreen   = namedLazy(() => import("./pages/teacher/LeaderboardControlScreen"),   "LeaderboardControlScreen");
const ResourceLibraryScreen      = namedLazy(() => import("./pages/teacher/ResourceLibraryScreen"),      "ResourceLibraryScreen");
const TeacherSettingsScreen      = namedLazy(() => import("./pages/teacher/TeacherSettingsScreen"),      "TeacherSettingsScreen");
const AdaptivePracticeScreen     = namedLazy(() => import("./pages/app/AdaptivePracticeScreen"),         "AdaptivePracticeScreen");
const LeaderboardScreen          = namedLazy(() => import("./pages/app/LeaderboardScreen"),              "LeaderboardScreen");
const RevisionVaultScreen        = namedLazy(() => import("./pages/app/RevisionVaultScreen"),            "RevisionVaultScreen");
const AIAssistantScreen          = namedLazy(() => import("./pages/app/AIAssistantScreen"),              "AIAssistantScreen");
const RankPredictorScreen        = namedLazy(() => import("./pages/app/RankPredictorScreen"),            "RankPredictorScreen");
const AskDoubtScreen             = namedLazy(() => import("./pages/app/AskDoubtScreen"),                 "AskDoubtScreen");

// ── Page transition variants ──────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.99 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, y: -10, scale: 0.99,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

// ── Animated page wrapper ─────────────────────────────────────────────────────
export function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

// ── Animated full-page loader ─────────────────────────────────────────────────
const FullPageLoader = memo(function FullPageLoader() {
  return (
    <motion.div
      className="min-h-screen grid place-items-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Pulsing background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-5">
        {/* Spinning ring */}
        <div className="relative h-16 w-16">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: "2px solid rgba(139,92,246,0.2)" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid transparent",
              borderTopColor: "#8B5CF6",
              borderRightColor: "#3B82F6",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Center dot */}
          <motion.div
            className="absolute inset-0 m-auto h-3 w-3 rounded-full"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #3B82F6)" }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Staggered dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#8B5CF6" }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>

        <motion.p
          className="text-sm font-semibold"
          style={{ color: "rgba(139,92,246,0.8)" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
});

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<FullPageLoader />}>
        <Routes>

            {/* ── Public ── */}
            <Route path="/"                  element={<SplashScreen />} />
            <Route path="/role"              element={<RoleSelectScreen />} />
            <Route path="/login"             element={<LoginScreen />} />
            <Route path="/admin/login"       element={<AdminLoginScreen />} />
            <Route path="/teacher/login"     element={<TeacherLoginScreen />} />
            <Route path="/teacher/signup"    element={<TeacherSignupScreen />} />
            <Route path="/signup"            element={<SignupScreen />} />
            <Route path="/forgot-password"   element={<ForgotPasswordScreen />} />
            <Route path="/otp"               element={<OTPVerificationScreen />} />

            {/* ── Student App ── */}
            <Route path="/app" element={<ProtectedLayout />}>
              <Route index                                    element={<HomeDashboardScreen />} />
              <Route path="subjects"                          element={<SubjectsScreen />} />
              <Route path="subjects/:subjectId/chapters"      element={<ChaptersScreen />} />
              <Route path="videos/:videoId"                   element={<VideoPlayerScreen />} />
              <Route path="live-class"                        element={<LiveClassScreen />} />
              <Route path="recorded-classes"                  element={<RecordedClassesScreen />} />
              <Route path="notes"                             element={<NotesScreen />} />
              <Route path="bookmarks"                         element={<BookmarksScreen />} />
              <Route path="quizzes"                           element={<QuizScreen />} />
              <Route path="quizzes/:quizId/attempt"           element={<QuizAttemptScreen />} />
              <Route path="quizzes/:quizId/result"            element={<QuizResultScreen />} />
              <Route path="mock-tests"                        element={<MockTestScreen />} />
              <Route path="mock-tests/:testId/attempt"        element={<TestAttemptScreen />} />
              <Route path="mock-tests/:testId/result"         element={<TestResultScreen />} />
              <Route path="performance"                       element={<PerformanceDashboardScreen />} />
              <Route path="performance/subjects"              element={<SubjectPerformanceScreen />} />
              <Route path="doubts"                            element={<DoubtSolvingScreen />} />
              <Route path="ask-doubt"                         element={<AskDoubtScreen />} />
              <Route path="adaptive-practice"                 element={<AdaptivePracticeScreen />} />
              <Route path="leaderboard"                       element={<LeaderboardScreen />} />
              <Route path="revision-vault"                    element={<RevisionVaultScreen />} />
              <Route path="ai-assistant"                      element={<AIAssistantScreen />} />
              <Route path="rank-predictor"                    element={<RankPredictorScreen />} />
              <Route path="notifications"                     element={<NotificationsScreen />} />
              <Route path="profile"                           element={<ProfileScreen />} />
              <Route path="settings"                          element={<SettingsScreen />} />
            </Route>

            {/* ── Admin ── */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardScreen />} />
            </Route>

            {/* ── Teacher ── */}
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index                                    element={<TeacherDashboardScreen />} />
              <Route path="subject"                           element={<TeacherMySubjectScreen />} />
              <Route path="students"                          element={<TeacherStudentsScreen />} />
              <Route path="students/:studentId"               element={<StudentDeepProfileScreen />} />
              <Route path="analytics"                         element={<TeacherDashboardScreen />} />
              <Route path="assignments"                       element={<AssignmentBuilderScreen />} />
              <Route path="doubts"                            element={<DoubtManagementScreen />} />
              <Route path="live-classes"                      element={<LiveClassSchedulerScreen />} />
              <Route path="content-planner"                   element={<ContentPlannerScreen />} />
              <Route path="question-bank"                     element={<QuestionBankScreen />} />
              <Route path="test-creator"                      element={<TestCreatorScreen />} />
              <Route path="announcements"                     element={<AnnouncementsScreen />} />
              <Route path="leaderboard"                       element={<LeaderboardControlScreen />} />
              <Route path="resources"                         element={<ResourceLibraryScreen />} />
              <Route path="settings"                          element={<TeacherSettingsScreen />} />
              <Route path="profile"                           element={<ProfileScreen />} />
            </Route>

            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
      </Suspense>
    </AuthProvider>
  );
}
