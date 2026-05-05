import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Activity, BarChart3, Bell, BookOpen,
  CalendarDays, ChevronLeft,
  ClipboardCheck, ClipboardList, FileText, HelpCircle,
  Library, LogOut, Menu, Moon, Radio, Settings,
  Sun, Trophy, User, Users, X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/auth/AuthContext";
import { useAppStore } from "@/state/useAppStore";
import { AnimatedBackground } from "@/components/motion/AnimatedBackground";
import { CursorGlow } from "@/components/motion/CursorGlow";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",   to: "/teacher",             icon: BarChart3, end: true },
      { label: "My Subject",  to: "/teacher/subject",     icon: BookOpen },
      { label: "Students",    to: "/teacher/students",    icon: Users },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Content Planner", to: "/teacher/content-planner", icon: CalendarDays },
      { label: "Question Bank",   to: "/teacher/question-bank",   icon: Library },
      { label: "Test Creator",    to: "/teacher/test-creator",    icon: ClipboardCheck },
    ],
  },
  {
    label: "Engage",
    items: [
      { label: "Assignments",   to: "/teacher/assignments",   icon: ClipboardList },
      { label: "Doubts",        to: "/teacher/doubts",        icon: HelpCircle },
      { label: "Announcements", to: "/teacher/announcements", icon: Bell },
      { label: "Live Classes",  to: "/teacher/live-classes",  icon: Radio },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Library",     to: "/teacher/resources",   icon: FileText },
      { label: "Leaderboard", to: "/teacher/leaderboard", icon: Trophy },
      { label: "Analytics",   to: "/teacher/analytics",   icon: Activity },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", to: "/teacher/settings", icon: Settings },
      { label: "Profile",  to: "/teacher/profile",  icon: User },
    ],
  },
];

const allItems: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

const SIDEBAR_W = 248;
const SIDEBAR_COLLAPSED_W = 68;

const SPRING = { type: "spring", stiffness: 340, damping: 30 } as const;
const SPRING_SLOW = { type: "spring", stiffness: 220, damping: 26 } as const;

const sidebarContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};
const sidebarItem = {
  hidden: { opacity: 0, x: -14 },
  show:   { opacity: 1, x: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
};

export function TeacherShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const prevPath = useRef(location.pathname);

  function handleSignOut() {
    signOut();
    window.location.replace("/");
  }

  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  const W = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_W;
  const isDark = theme === "dark";

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => { prevPath.current = location.pathname; }, [location.pathname]);

  const currentLabel =
    allItems.find((i) =>
      i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)
    )?.label ?? "Teacher Portal";

  const sidebarBg    = isDark ? "rgba(11,15,26,0.85)" : "#FFFFFF";
  const sidebarBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E8E5E0";
  const sidebarShadow = isDark
    ? "4px 0 24px rgba(0,0,0,0.4), 0 0 40px rgba(139,92,246,0.08)"
    : "2px 0 12px rgba(0,0,0,0.05)";

  const groupLabelColor = isDark ? "#6B7280" : "#6B7280";
  const iconColor       = isDark ? "#9CA3AF" : "#6B7280";
  const userNameColor   = isDark ? "#FFFFFF"  : "#111827";
  const userEmailColor  = isDark ? "#9CA3AF"  : "#6B7280";
  const avatarBg        = isDark
    ? "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
    : "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)";

  return (
    <div
      style={{
        background: isDark ? "transparent" : "rgba(251,248,243,0.85)",
        minHeight: "100vh",
        transition: "background 0.35s ease",
      }}
    >
      {/* Cursor glow */}
      <CursorGlow />
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 flex-col overflow-hidden"
        animate={{ width: W }}
        transition={SPRING_SLOW}
        style={{
          background: sidebarBg,
          borderRight: sidebarBorder,
          boxShadow: sidebarShadow,
          backdropFilter: isDark ? "blur(24px)" : "none",
          WebkitBackdropFilter: isDark ? "blur(24px)" : "none",
        }}
      >
        {/* Logo row */}
        <div
          className="flex h-16 shrink-0 items-center justify-between px-4"
          style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E8E5E0" }}
        >
          <Link to="/teacher" className="focus-ring rounded-xl">
            <Logo compact={collapsed} />
          </Link>
          <motion.button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="grid h-7 w-7 place-items-center rounded-lg transition focus-ring"
            style={{
              color: iconColor,
              background: isDark ? "rgba(255,255,255,0.05)" : "transparent",
            }}
          >
            <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={SPRING} style={{ display: "flex" }}>
              <ChevronLeft className="h-4 w-4" />
            </motion.span>
          </motion.button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-3">
          {NAV_GROUPS.map((group) => (
            <motion.div key={group.label} className="mb-1" variants={sidebarContainer} initial="hidden" animate="show">
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    key="label"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mb-1 mt-4 px-3 text-[9px] font-bold uppercase tracking-widest overflow-hidden"
                    style={{ color: groupLabelColor }}
                  >
                    {group.label}
                  </motion.div>
                )}
              </AnimatePresence>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                return (
                  <motion.div key={item.to} variants={sidebarItem}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "sidebar-link mb-0.5 relative",
                        collapsed ? "justify-center px-2" : "",
                        isActive ? "active" : "",
                      )}
                    >
                      <motion.span
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        style={{ display: "flex", position: "relative", zIndex: 1 }}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                      </motion.span>
                      {!collapsed && (
                        <span className="truncate relative z-10">{item.label}</span>
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </div>

        {/* User footer */}
        <motion.div
          className="shrink-0 border-t px-3 py-3"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E8E5E0" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...SPRING }}
        >
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: avatarBg }}>
                  {(user?.name ?? "T").charAt(0).toUpperCase()}
                </div>
                <motion.button type="button" onClick={handleSignOut} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="grid h-7 w-7 place-items-center rounded-lg transition focus-ring" style={{ color: iconColor }}>
                  <LogOut className="h-3.5 w-3.5" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: avatarBg }}>
                  {(user?.name ?? "T").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold" style={{ color: userNameColor }}>{user?.name ?? "Teacher"}</div>
                  <div className="truncate text-[10px]" style={{ color: userEmailColor }}>{user?.email ?? ""}</div>
                </div>
                <motion.button type="button" onClick={handleSignOut} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg transition focus-ring" style={{ color: iconColor }}>
                  <LogOut className="h-3.5 w-3.5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col overflow-hidden"
            initial={{ x: -256, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -256, opacity: 0 }}
            transition={SPRING}
            style={{ background: sidebarBg, borderRight: sidebarBorder, boxShadow: sidebarShadow }}
          >
            <div className="flex h-16 items-center justify-between px-4"
              style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E8E5E0" }}>
              <Logo />
              <motion.button type="button" onClick={() => setMobileOpen(false)}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="grid h-8 w-8 place-items-center rounded-lg focus-ring"
                style={{ color: iconColor, background: isDark ? "rgba(255,255,255,0.05)" : "transparent" }}>
                <X className="h-4 w-4" />
              </motion.button>
            </div>
            <motion.div className="flex-1 overflow-y-auto px-2 pb-4" variants={sidebarContainer} initial="hidden" animate="show">
              {allItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.to} variants={sidebarItem}>
                    <NavLink to={item.to} end={item.end}
                      className={({ isActive }) => cn("sidebar-link mb-0.5", isActive ? "active" : "")}>
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div style={{ marginLeft: W, minHeight: "100vh", transition: "margin-left 0.3s cubic-bezier(.16,1,.3,1)" }}>
        {/* Header */}
        <header
          className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-6"
          style={{
            background: isDark ? "rgba(11,15,26,0.80)" : "rgba(255,255,255,0.95)",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E8E5E0",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.4), 0 0 40px rgba(139,92,246,0.06)"
              : "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={() => setMobileOpen(true)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="grid h-9 w-9 place-items-center rounded-xl border transition md:hidden focus-ring"
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "#F5F2ED",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E8E5E0",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              <Menu className="h-4 w-4" />
            </motion.button>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLabel}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <h1 className="text-base font-bold" style={{ color: isDark ? "#FFFFFF" : "#111827" }}>
                  {currentLabel}
                </h1>
                <p className="text-xs" style={{ color: isDark ? "#6B7280" : "#6B7280" }}>Teacher Portal</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileHover={{ scale: 1.08, rotate: 15 }} whileTap={{ scale: 0.92 }}
              className="grid h-9 w-9 place-items-center rounded-xl border transition focus-ring"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "#F5F2ED",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E8E5E0",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex" }}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* User chip */}
            <motion.div
              className="flex items-center gap-2 rounded-xl border px-3 py-1.5"
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E8E5E0",
                boxShadow: isDark ? "0 0 20px rgba(139,92,246,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
              whileHover={{ scale: 1.02 }}
              transition={SPRING}
            >
              <div
                className="grid h-7 w-7 place-items-center rounded-lg text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}
              >
                {(user?.name ?? "T").charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium lg:block" style={{ color: isDark ? "#E5E7EB" : "#1A1D2E" }}>
                {user?.name ?? "Teacher"}
              </span>
            </motion.div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 md:p-8" style={{ position: "relative", zIndex: 1 }}>
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
