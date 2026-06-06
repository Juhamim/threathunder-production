"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Upload,
  AlertTriangle,
  FileText,
  MessageSquare,
  GitBranch,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navGroups = [
  {
    label: "Monitor",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/logs", label: "Log Analysis", icon: Upload },
      { href: "/threats", label: "Threats", icon: AlertTriangle },
      { href: "/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/chat", label: "AI Assistant", icon: MessageSquare },
      { href: "/scanner", label: "GitHub Scanner", icon: GitBranch },
    ],
  },
];

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-[13px] text-[var(--text-muted)] tabular-nums">{time}</span>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Load collapse state from local storage on client mount
  useEffect(() => {
    const saved = localStorage.getItem("threathunter_sidebar_collapsed");
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("threathunter_sidebar_collapsed", String(next));
  };

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="w-screen h-screen overflow-hidden text-[var(--text-secondary)] bg-[#0A0C0F] relative" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      {/* ── Desktop & Tablet Sidebar (md+) ── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-[#0D1117] border-r border-[#1E2229] z-30 transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? "72px" : "260px", willChange: "width" }}
      >
        {/* Header / Logo section */}
        <div className="h-[56px] flex items-center justify-between px-4 border-b border-[#1E2229] overflow-hidden">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[rgba(0,229,195,0.1)] border border-[rgba(0,229,195,0.2)] flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-[var(--accent-mint)]" />
            </div>
            {!collapsed && (
              <span className="font-heading font-extrabold text-white text-[15px] tracking-wider truncate">
                THREAT<span className="text-[var(--accent-mint)]">HUNTER</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow py-4 space-y-6 overflow-y-auto overflow-x-hidden px-3">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              {!collapsed ? (
                <div className="px-3 text-[10px] font-mono font-bold text-[#3D4452] tracking-widest uppercase">
                  // {group.label}
                </div>
              ) : (
                <div className="h-[1px] bg-[#1E2229] my-2 mx-1" />
              )}

              <div className="space-y-[3px]">
                {group.items.map((item) => {
                  const active = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 h-[40px] px-3.5 rounded-lg text-[14px] font-medium transition-all duration-200 relative ${
                        active
                          ? "bg-[#1A1F27] text-white"
                          : "text-[#6B7280] hover:text-white hover:bg-[#13161B]"
                      }`}
                      onMouseEnter={() => collapsed && setActiveTooltip(item.label)}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      {/* Left indicator bar for active item */}
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[var(--accent-mint)] rounded-r-md" />
                      )}

                      <item.icon
                        size={18}
                        className={`flex-shrink-0 transition-colors ${
                          active ? "text-[var(--accent-mint)]" : "text-[#6B7280] group-hover:text-white"
                        }`}
                      />

                      {!collapsed && (
                        <span className="truncate transition-opacity duration-200">{item.label}</span>
                      )}

                      {/* Tooltip Overlay on Collapsed Sidebar */}
                      <AnimatePresence>
                        {collapsed && activeTooltip === item.label && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-[80px] bg-[#13161B] border border-[#1E2229] text-white font-mono text-[11px] px-2.5 py-1.5 rounded-md shadow-xl z-50 whitespace-nowrap"
                          >
                            {item.label}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer & Collapse Toggle */}
        <div className="border-t border-[#1E2229] bg-[#0D1117] p-3 space-y-2">
          {/* User profile */}
          {session?.user && (
            <div className="flex items-center gap-3 min-w-0 p-1.5 rounded-lg">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={28}
                  height={28}
                  className="rounded-full border border-[#1E2229] flex-shrink-0"
                />
              ) : (
                <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-xs font-bold bg-[#1E2229] text-[var(--accent-mint)] flex-shrink-0">
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              {!collapsed && (
                <div className="flex-grow min-w-0">
                  <div className="text-[13px] font-bold text-white truncate leading-tight">
                    {session.user.name}
                  </div>
                  <div className="text-[10px] text-[#6B7280] truncate font-mono">
                    {session.user.email}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            <button
              onClick={toggleCollapse}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#1E2229] hover:bg-[#1A1F27] hover:text-white text-[#6B7280] transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>

            {!collapsed ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#6B7280] hover:text-[var(--color-danger)] transition-colors rounded-lg border border-transparent hover:border-[#1E2229]"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#1E2229] hover:bg-[rgba(255,77,77,0.1)] hover:text-[var(--color-danger)] text-[#6B7280] transition-colors"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar (xs/sm only) ── */}
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 h-[56px] bg-[#13161B] border-t border-[#1E2229] pb-[env(safe-area-inset-bottom)] z-30 justify-around items-center"
      >
        {[
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/threats", label: "Threats", icon: AlertTriangle },
          { href: "/logs", label: "Alerts", icon: Upload },
          { href: "/reports", label: "Reports", icon: FileText },
          { href: "/chat", label: "AI", icon: MessageSquare },
        ].map((tab) => {
          const active = isActiveLink(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full py-1 text-center border-t-2 transition-all ${
                active ? "border-[var(--accent-mint)] text-[var(--accent-mint)]" : "border-transparent text-[#6B7280]"
              }`}
            >
              <tab.icon size={16} />
              {active && <span className="text-[10px] font-heading font-semibold tracking-wider">{tab.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Main Layout Wrapper ── */}
      <div
        className="fixed top-0 bottom-0 right-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          left: "var(--sidebar-width)",
          width: "calc(100vw - var(--sidebar-width))",
          height: "100vh",
        }}
      >
        {/* Topbar Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between border-b border-[#1E2229] bg-[#0D1117] relative z-20 h-[56px] px-6"
        >
          {/* Left breadcrumb info */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px] text-[#6B7280] uppercase tracking-wider">
              NODE // TH_HUNTER_XDR
            </span>
          </div>

          {/* Search panel */}
          <div className="flex items-center justify-center flex-1 max-w-[320px]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={14} />
              <input
                id="search-command-input"
                type="text"
                placeholder="Type command or query..."
                className="cyber-input pl-9 h-[34px] font-mono text-xs w-full bg-[#13161B] py-1 outline-none border border-[#1E2229] rounded-md"
              />
            </div>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-5">
            <LiveClock />
            <button
              className="relative p-1.5 text-[#6B7280] hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--accent-mint)] rounded-full animate-ping" />
            </button>
            {session?.user && (
              session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={28}
                  height={28}
                  className="rounded-full border border-[#1E2229]"
                />
              ) : (
                <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[10px] font-bold bg-[#1E2229] text-[var(--accent-mint)]">
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )
            )}
          </div>
        </header>

        {/* Page view content container */}
        <main
          className="flex-1 overflow-y-auto relative"
          style={{
            height: "calc(100vh - 56px)",
            paddingBottom: "var(--content-bottom-pad)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none radial-glow opacity-20" />
          <div className="relative z-10 h-full flex flex-col p-6 gap-4 min-h-0">
            {children}
          </div>
        </main>
      </div>

      {/* Dynamic sidebar CSS variables */}
      <style jsx global>{`
        :root {
          --sidebar-width: ${collapsed ? "72px" : "260px"};
          --header-height: 56px;
          --content-bottom-pad: 0px;
        }
        @media (max-width: 767px) {
          :root {
            --sidebar-width: 0px;
            --content-bottom-pad: 64px;
          }
        }
        .workspace-container {
          padding: 0;
          gap: 0;
        }
      `}</style>
    </div>
  );
}
