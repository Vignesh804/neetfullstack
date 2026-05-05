import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  BarChart3, Bell, BookOpen, Bookmark, ChevronLeft, ChevronRight,
  ClipboardList, GraduationCap, HelpCircle, Home, LogOut, Menu,
  Moon, Radio, Search, Settings, Sparkles, Sun, UploadCloud, User, Video,
} from "lucide-react";
import { appNav } from "@/navigation/appNav";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/auth/AuthContext";
import { useAppStore } from "@/state/useAppStore";
import { SearchPalette } from "@/components/search/SearchPalette";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { AnimatedBackground, type BgTheme } from "@/components/motion/AnimatedBackground";
import { CursorGlow } from "@/components/motion/CursorGlow";

type SideItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
};

function usePageTitle(pathname: string) {
  return useMemo(() => {
    const hit = appNav.find((i) => (i.to === "/app" ? pathname === "/app" : pathname.startsWith(i.to)));
    return hit?.label ?? "NEET";
  }, [pathname]);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const title = usePageTitle(location.pathname);

  function handleSignOut() {
    signOut();
    window.location.replace("/");
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(true); // default open so items are always accessible
  const [searchOpen, setSearchOpen] = useState(false);

  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed);

  const isDark = theme === "dark";
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  // ── Detect page theme for background ──────────────────────────────────────
  const bgTheme = useMemo((): BgTheme => {
    const p = location.pathname;
    if (p.includes("biology") || p.includes("notes") || p.includes("revision")) return "biology";
    if (p.includes("physics") || p.includes("performance") || p.includes("mock")) return "physics";
    if (p.includes("chemistry") || p.includes("quiz") || p.includes("adaptive")) return "chemistry";
    return "default";
  }, [location.pathname]);

  const mainNav = useMemo<SideItem[]>(() => {
    const base: SideItem[] = [
      { label: "Dashboard",      to: "/app",             icon: Home,         end: true },
      { label: "Learning Hub",   to: "/app/subjects",    icon: BookOpen },
      { label: "Analytics",      to: "/app/performance", icon: BarChart3 },
      { label: "Study Room",     to: "/app/notes",       icon: Sparkles },
    ];
    if (user?.role === "admin") base.push({ label: "Upload (Admin)", to: "/admin", icon: UploadCloud });
    return base;
  }, [user?.role]);

  const moreNav = useMemo<SideItem[]>(() => [
    { label: "Recorded Classes",  to: "/app/recorded-classes",  icon: Video },
    { label: "Live Class",        to: "/app/live-class",        icon: Radio },
    { label: "Quizzes",           to: "/app/quizzes",           icon: ClipboardList },
    { label: "Mock Tests",        to: "/app/mock-tests",        icon: GraduationCap },
    { label: "Adaptive Practice", to: "/app/adaptive-practice", icon: Sparkles },
    { label: "Revision Vault",    to: "/app/revision-vault",    icon: BookOpen },
    { label: "AI Assistant",      to: "/app/ai-assistant",      icon: Sparkles },
    { label: "Elite League",      to: "/app/leaderboard",       icon: BarChart3 },
    { label: "Rank Predictor",    to: "/app/rank-predictor",    icon: BarChart3 },
    { label: "Ask a Doubt",       to: "/app/ask-doubt",         icon: HelpCircle },
    { label: "Bookmarks",         to: "/app/bookmarks",         icon: Bookmark },
    { label: "Notifications",     to: "/app/notifications",     icon: Bell },
    { label: "Profile",           to: "/app/profile",           icon: User },
    { label: "Settings",          to: "/app/settings",          icon: Settings },
  ], []);

  const mobileNav = useMemo<SideItem[]>(() => [
    { label: "Home",        to: "/app",             icon: Home,         end: true },
    { label: "Courses",     to: "/app/subjects",    icon: BookOpen },
    { label: "Quizzes",     to: "/app/quizzes",     icon: ClipboardList },
    { label: "Performance", to: "/app/performance", icon: BarChart3 },
    { label: "Profile",     to: "/app/profile",     icon: User },
  ], []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (key === "escape") { setSearchOpen(false); setSidebarOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close ONLY mobile sidebar on route change — keep moreOpen intact for desktop
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // ── Derived theme values ────────────────────────────────────────────────────
  const pageBg          = isDark ? "transparent"                : "rgba(251,248,243,0.85)";
  const sidebarBg       = isDark ? "rgba(8,12,22,0.92)"         : "#FFFFFF";
  const sidebarBorder   = isDark ? "rgba(255,255,255,0.07)"     : "#E8E5E0";
  const sidebarShadow   = isDark
    ? "4px 0 32px rgba(0,0,0,0.7), 0 0 60px rgba(139,92,246,0.08)"
    : "0 4px 20px rgba(0,0,0,0.08)";
  const headerBg        = isDark ? "rgba(8,12,22,0.88)"         : "rgba(255,255,255,0.95)";
  const headerBorder    = isDark ? "rgba(255,255,255,0.07)"     : "#E8E5E0";
  const headerShadow    = isDark
    ? "0 4px 24px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.05)"
    : "0 2px 12px rgba(0,0,0,0.06)";
  const btnBg           = isDark ? "rgba(255,255,255,0.06)"     : "#F5F2ED";
  const btnBorder       = isDark ? "rgba(255,255,255,0.1)"      : "#E8E5E0";
  const btnColor        = isDark ? "#94A3B8"                    : "#6B7280";
  const userCardBg      = isDark ? "rgba(255,255,255,0.04)"     : "#F5F2ED";
  const userCardBorder  = isDark ? "rgba(255,255,255,0.08)"     : "#E8E5E0";
  const textPrimary     = isDark ? "#F1F5F9"                    : "#1A1D2E";
  const textSecondary   = isDark ? "#94A3B8"                    : "#6B7280";
  const mobileBg        = isDark ? "rgba(8,12,22,0.95)"         : "#FFFFFF";
  const mobileNavBg     = isDark ? "rgba(8,12,22,0.95)"         : "#FFFFFF";
  const mobileNavBorder = isDark ? "rgba(255,255,255,0.08)"     : "#E8E5E0";

  const navActive   = isDark
    ? "bg-[rgba(139,92,246,0.22)] text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.2)]"
    : "bg-gradient-to-r from-[#EDE9FE] to-[#DDD6FE] text-[#5B21B6] font-bold";
  const navInactive = isDark
    ? "text-[#64748B] hover:bg-[rgba(139,92,246,0.12)] hover:text-[#CBD5E1]"
    : "text-[#374151] hover:bg-[#F3F0FF] hover:text-[#5B21B6]";

  const linkBase = "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200";

  return (
    <div style={{ minHeight: "100vh", background: pageBg, transition: "background 0.35s ease" }}>

      {/* ── Cursor glow (dark mode) ── */}
      {isDark && <CursorGlow />}

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      <motion.aside
        className="hidden md:flex fixed left-4 top-4 bottom-4 z-50 rounded-3xl p-3 flex-col overflow-hidden"
        style={{
          background: sidebarBg,
          border: `1px solid ${sidebarBorder}`,
          boxShadow: sidebarShadow,
          backdropFilter: isDark ? "blur(24px)" : "none",
          WebkitBackdropFilter: isDark ? "blur(24px)" : "none",
        }}
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        {/* Logo + collapse */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          <Link to="/app" className="focus-ring rounded-2xl" title="Dashboard">
            <Logo compact={sidebarCollapsed} />
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-2xl border transition focus-ring"
            style={{ background: btnBg, borderColor: btnBorder, color: btnColor }}
            onClick={toggleSidebarCollapsed}
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Nav */}
        <div className="mt-4 flex-1 overflow-y-auto overflow-x-hidden min-h-0 space-y-1 pr-0.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => cn(linkBase, sidebarCollapsed ? "justify-center px-2" : "justify-start", isActive ? navActive : navInactive)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}

          {/* More toggle */}
          <button
            type="button"
            className={cn(linkBase, sidebarCollapsed ? "justify-center px-2" : "justify-start w-full", moreOpen ? navActive : navInactive)}
            onClick={() => { if (sidebarCollapsed) { setMoreOpen(true); toggleSidebarCollapsed(); return; } setMoreOpen((v) => !v); }}
          >
            <Menu className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span className="truncate flex-1 text-left">More</span>}
            {!sidebarCollapsed && (
              <motion.span className="shrink-0" animate={{ rotate: moreOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="h-4 w-4 opacity-80" />
              </motion.span>
            )}
          </button>

          <AnimatePresence initial={false}>
            {moreOpen && !sidebarCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                className="overflow-hidden space-y-1"
              >
                {moreNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to}
                      className={({ isActive }) => cn(linkBase, isActive ? navActive : navInactive)}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User card */}
        <div className="shrink-0 pt-3">
          <div
            className={cn("rounded-2xl border p-3", sidebarCollapsed ? "flex flex-col items-center gap-2" : "space-y-2")}
            style={{ background: userCardBg, borderColor: userCardBorder }}
          >
            {sidebarCollapsed ? (
              <>
                <div className="grid h-8 w-8 place-items-center rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}>
                  <User className="h-4 w-4" />
                </div>
                {[
                  { icon: Search, onClick: () => setSearchOpen(true), label: "Search" },
                  { icon: isDark ? Sun : Moon, onClick: toggleTheme, label: "Theme" },
                  { icon: LogOut, onClick: signOut, label: "Sign out" },
                ].map(({ icon: Icon, onClick, label }) => (
                  <button key={label} type="button" onClick={onClick}
                    className="grid h-8 w-8 place-items-center rounded-xl transition focus-ring"
                    style={{ border: `1px solid ${btnBorder}`, background: btnBg, color: btnColor }}>
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
                    style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}>
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="truncate text-xs font-extrabold leading-tight" style={{ color: textPrimary }}>
                      {user?.name ?? "Student"}
                    </div>
                    <div className="truncate text-[10px] font-medium leading-tight" style={{ color: textSecondary }}>
                      {user?.email ?? "student@example.com"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { icon: Search, onClick: () => setSearchOpen(true), label: "Search" },
                    { icon: isDark ? Sun : Moon, onClick: toggleTheme, label: "Theme" },
                    { icon: LogOut, onClick: signOut, label: "Sign out" },
                  ].map(({ icon: Icon, onClick, label }) => (
                    <button key={label} type="button" onClick={onClick}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-xl transition focus-ring"
                      style={{ border: `1px solid ${btnBorder}`, background: btnBg, color: btnColor }}>
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ── Mobile Sidebar ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-[320px] max-w-[88vw] rounded-r-3xl p-4 flex flex-col"
            style={{
              background: sidebarBg,
              borderRight: `1px solid ${sidebarBorder}`,
              boxShadow: sidebarShadow,
              backdropFilter: isDark ? "blur(24px)" : "none",
              WebkitBackdropFilter: isDark ? "blur(24px)" : "none",
            }}
            initial={{ x: -360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -360, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div className="flex items-center justify-between gap-2 shrink-0">
              <Link to="/app" className="focus-ring rounded-2xl" onClick={() => setSidebarOpen(false)}>
                <Logo />
              </Link>
              <button type="button"
                className="grid h-10 w-10 place-items-center rounded-2xl border transition focus-ring"
                style={{ background: btnBg, borderColor: btnBorder, color: btnColor }}
                onClick={() => setSidebarOpen(false)}>
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-1">
              {[...mainNav, ...moreNav].map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(linkBase, isActive ? navActive : navInactive)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="shrink-0 border-t pt-4 mt-4" style={{ borderColor: sidebarBorder }}>
              <div className="text-sm font-extrabold truncate" style={{ color: textPrimary }}>{user?.name ?? "Student"}</div>
              <div className="mt-1 text-xs font-semibold truncate" style={{ color: textSecondary }}>{user?.email ?? ""}</div>
              <div className="mt-4 grid gap-2">
                <Button variant="secondary" className="h-11 rounded-2xl"
                  onClick={() => { setSidebarOpen(false); setSearchOpen(true); }}>
                  <Search className="h-4 w-4" /> Search
                </Button>
                <Button variant="danger" className="h-11 rounded-2xl" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="min-h-screen flex">
        <motion.div className="hidden md:block shrink-0" initial={false}
          animate={{ width: sidebarWidth + 32 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }} />

        <div className="flex-1 min-w-0 flex flex-col">

          {/* Header */}
          <header className="sticky top-4 z-40 px-4 md:px-6">
            <div className="rounded-2xl px-4 py-3 md:px-5 md:py-4"
              style={{
                background: headerBg,
                border: `1px solid ${headerBorder}`,
                boxShadow: headerShadow,
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}>
              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile menu btn */}
                  <button type="button"
                    className="grid h-10 w-10 place-items-center rounded-2xl border transition focus-ring md:hidden"
                    style={{ background: btnBg, borderColor: btnBorder, color: btnColor }}
                    onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </button>

                  <div className="min-w-0">
                    <Breadcrumbs className="hidden md:flex" />
                    <div className="truncate text-sm font-extrabold md:text-base" style={{ color: textPrimary }}>
                      {title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search */}
                  <button type="button" onClick={() => setSearchOpen(true)}
                    className="grid h-10 w-10 place-items-center rounded-2xl border transition focus-ring"
                    style={{ background: btnBg, borderColor: btnBorder, color: btnColor }}>
                    <Search className="h-5 w-5" />
                  </button>

                  {/* Notifications */}
                  <Link to="/app/notifications"
                    className="grid h-10 w-10 place-items-center rounded-2xl border transition focus-ring"
                    style={{ background: btnBg, borderColor: btnBorder, color: btnColor }}>
                    <Bell className="h-5 w-5" />
                  </Link>

                  {/* Theme toggle */}
                  <button type="button" onClick={toggleTheme}
                    className="hidden md:grid h-10 w-10 place-items-center rounded-2xl border transition focus-ring"
                    style={{ background: btnBg, borderColor: btnBorder, color: btnColor }}>
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>

                  {/* Profile */}
                  <Link to="/app/profile"
                    className="hidden md:flex items-center gap-2 rounded-2xl px-2 py-2 lg:px-3 text-sm font-extrabold transition focus-ring"
                    style={{ border: `1px solid ${btnBorder}`, background: btnBg, color: textPrimary }}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl text-white"
                      style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}>
                      <User className="h-4 w-4" />
                    </span>
                    <span className="hidden lg:block truncate max-w-[120px]">{user?.name ?? "Student"}</span>
                  </Link>

                  {/* Sign out */}
                  <button type="button" onClick={handleSignOut}
                    className="hidden md:grid h-10 w-10 place-items-center rounded-2xl border transition focus-ring"
                    style={{ background: btnBg, borderColor: btnBorder, color: btnColor }}>
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page */}
          <main className="px-4 pb-24 pt-4 md:px-6 md:pb-0" style={{ position: "relative", zIndex: 1 }}>
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
                exit={{ opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.18 } }}
                style={{ willChange: "transform, opacity" }}
                className="mx-auto max-w-[1280px]"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ───────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="mx-auto max-w-[1280px] px-4 pb-4">
          <div className="rounded-3xl px-2 py-2"
            style={{
              background: isDark ? "rgba(11,15,26,0.85)" : mobileNavBg,
              border: `1px solid ${mobileNavBorder}`,
              boxShadow: isDark ? "0 -4px 24px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.08)" : "0 -2px 12px rgba(0,0,0,0.08)",
              backdropFilter: isDark ? "blur(24px)" : "none",
              WebkitBackdropFilter: isDark ? "blur(24px)" : "none",
            }}>
            <div className="grid grid-cols-5 gap-1">
              {mobileNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.end}
                    className={({ isActive }) => cn(
                      "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-extrabold transition focus-ring",
                      isActive
                        ? isDark ? "bg-[rgba(139,92,246,0.25)] text-white" : "bg-gradient-to-r from-[#F5F2ED] to-[#EDE9FE] text-[#6C5CE7]"
                        : isDark ? "text-[#9CA3AF] hover:bg-[rgba(139,92,246,0.1)] hover:text-white" : "text-[#6B7280] hover:bg-[#F5F2ED] hover:text-[#1A1D2E]",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
