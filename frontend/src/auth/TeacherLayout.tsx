import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { TeacherShell } from "@/layouts/TeacherShell";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

// Simple auth guard — no API calls, no useEffect, no state
export function TeacherLayout() {
  const { token, user } = useAuth();
  const location = useLocation();

  // No token → go to login
  if (!token) {
    return <Navigate to="/teacher/login" replace state={{ from: location.pathname }} />;
  }

  // Token exists but user not loaded yet → show skeleton
  if (!user) return <PageSkeleton />;

  // Wrong role → go to student app
  if (user.role !== "teacher" && user.role !== "admin") {
    return <Navigate to="/app" replace />;
  }

  // All good → render the teacher shell
  return (
    <TeacherShell>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </TeacherShell>
  );
}
