"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
  ChevronDown,
} from "lucide-react";

const navGroups = [
  {
    label: "// MONITOR",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/logs", label: "Log Analysis", icon: Upload },
      { href: "/threats", label: "Threats", icon: AlertTriangle },
      { href: "/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "// TOOLS",
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
  const [tabletExpanded, setTabletExpanded] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close tablet expanded overlay on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        setTabletExpanded(false);
      }
    }
    if (tabletExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tabletExpanded]);

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="w-screen h-screen overflow-hidden text-[var(--text-secondary)] bg-[#0A0C0F] relative">
      {/* ── Desktop Sidebar (lg+) ── */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[200px] bg-[#0D1117] border-r border-[#1E2229] z-30"
      >
        {/* Logo Section */}
        <div className="h-[56px] flex items-center px-4 border-b border-[#1E2229]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-heading font-bold text-white tracking-wide text-[16px]">
              <span className="text-[#F0EDE6]">THREAT</span>
              <span className="text-[#00E5C3]">HUNTER</span>
            </span>
          </Link>
        </div>

        {/* Workspace Selector */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between px-2.5 h-[32px] border border-[#1E2229] rounded-[2px] bg-[#0A0C0F] text-[13px] font-mono text-[#C8C4BC]">
            <span>SOC_NODE_A</span>
            <ChevronDown size={11} className="text-[#6B7280]" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow py-2 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 text-[10px] font-mono font-bold text-[#3D4452] tracking-wider mb-1 uppercase">
                {group.label}
              </div>
              <div className="space-y-[2px]">
                {group.items.map((item) => {
                  const active = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 h-[36px] px-3 text-[13px] font-medium transition-all duration-120 relative ${
                        active
                          ? "bg-[#1A1F27] text-[var(--accent-mint)] border-l-[2px] border-[var(--accent-mint)]"
                          : "text-[#6B7280] hover:text-[#F0EDE6] hover:bg-[#1A1F27]"
                      }`}
                    >
                      <item.icon size={16} className={active ? "text-[var(--accent-mint)]" : "text-[#6B7280]"} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="h-[52px] border-t border-[#1E2229] bg-[#0A0C0F] flex items-center justify-between px-3">
          {session?.user && (
            <div className="flex items-center gap-2 w-full">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={28}
                  height={28}
                  className="rounded-full border border-[#1E2229]"
                />
              ) : (
                <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-xs font-bold bg-[#1E2229] text-[var(--accent-mint)]">
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              <div className="flex-grow min-w-0">
                <div className="text-[13px] font-bold text-white truncate leading-tight font-heading">
                  {session.user.name}
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1 hover:text-[var(--color-danger)] transition-colors text-[#6B7280]"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Tablet Sidebar (md Only) ── */}
      <aside
        ref={overlayRef}
        className="hidden md:flex lg:hidden flex-col fixed left-0 top-0 bottom-0 bg-[#0D1117] border-r border-[#1E2229] z-30 transition-all duration-180"
        style={{ width: tabletExpanded ? "200px" : "48px" }}
      >
        {/* Logo */}
        <div className="h-[48px] flex items-center px-3 border-b border-[#1E2229]">
          <button onClick={() => setTabletExpanded(!tabletExpanded)} className="flex items-center gap-2 outline-none">
            <Shield size={16} className="text-[var(--accent-mint)]" />
            {tabletExpanded && (
              <span className="font-heading font-bold text-white tracking-wide text-xs">TH_HUNTER</span>
            )}
          </button>
        </div>

        {/* Rail Items */}
        <nav className="flex-1 py-4 px-1 space-y-4 overflow-y-auto overflow-x-hidden">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {tabletExpanded && (
                <div className="px-3 text-[9px] font-mono text-[#3D4452] tracking-wider uppercase">
                  {group.label.replace("// ", "")}
                </div>
              )}
              {group.items.map((item) => {
                const active = isActiveLink(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 h-[36px] px-2 rounded-[2px] transition-all relative ${
                      active
                        ? "bg-[#1A1F27] text-[var(--accent-mint)]"
                        : "text-[#6B7280] hover:text-[#F0EDE6] hover:bg-[#1A1F27]"
                    }`}
                    onMouseEnter={() => !tabletExpanded && setActiveTooltip(item.label)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={() => setTabletExpanded(false)}
                  >
                    <item.icon size={16} className={active ? "text-[var(--accent-mint)]" : "text-[#6B7280]"} />
                    {tabletExpanded && <span className="text-[12px] font-medium">{item.label}</span>}

                    {/* Tooltip Label (140ms animation) */}
                    <AnimatePresence>
                      {!tabletExpanded && activeTooltip === item.label && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -5 }}
                          transition={{ duration: 0.14 }}
                          className="absolute left-[44px] bg-[#13161B] border border-[#1E2229] text-white font-mono text-[10px] px-2 py-1 z-50 whitespace-nowrap"
                        >
                          {item.label}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Log out icon footer */}
        <div className="p-2 border-t border-[#1E2229] flex justify-center bg-[#0A0C0F] h-[52px] items-center">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1.5 rounded-[2px] hover:text-[var(--color-danger)] text-[#6B7280]"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
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
        className="fixed top-0 bottom-0 right-0 flex flex-col overflow-hidden transition-all duration-180"
        style={{
          left: "var(--sidebar-width)",
          width: "calc(100vw - var(--sidebar-width))",
          height: "100vh",
        }}
      >
        {/* Topbar Command Bar */}
        <header
          className="flex-shrink-0 flex items-center justify-between border-b border-[#1E2229] bg-[#0D1117] relative z-20 h-[48px] px-5"
        >
          {/* Left breadcrumb */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px] text-[#6B7280]">
              OPERATOR_NODE // CORE_ENGINE
            </span>
          </div>

          {/* Center search input */}
          <div className="flex items-center justify-center flex-1 max-w-[280px]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={14} />
              <input
                id="search-command-input"
                type="text"
                placeholder="Search..."
                className="cyber-input pl-9 h-[32px] font-mono text-xs w-full bg-[#13161B] py-1 outline-none border border-[#1E2229]"
              />
            </div>
          </div>

          {/* Right details */}
          <div className="flex items-center gap-4">
            <LiveClock />
            <button
              className="relative p-1 text-[#6B7280] hover:text-white transition-colors"
              aria-label="View notifications"
            >
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--accent-mint)] rounded-full" />
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

        {/* Main Content Area */}
        <main
          className="flex-1 overflow-hidden relative flex flex-col p-6 gap-3"
          style={{
            height: "calc(100vh - 48px)",
            paddingBottom: "calc(24px + var(--content-bottom-pad))",
          }}
        >
          <div className="absolute inset-0 pointer-events-none radial-glow opacity-30" />
          <div className="relative z-10 flex-1 flex flex-col overflow-hidden h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Breakpoint custom paddings to prevent Layout Shifts */}
      <style jsx global>{`
        :root {
          --sidebar-width: 200px;
          --header-height: 48px;
          --content-bottom-pad: 0px;
        }
        @media (max-width: 1023px) {
          :root {
            --sidebar-width: 48px;
            --header-height: 48px;
            --content-bottom-pad: 0px;
          }
        }
        @media (max-width: 767px) {
          :root {
            --sidebar-width: 0px;
            --header-height: 48px;
            --content-bottom-pad: 56px;
          }
        }
      `}</style>
    </div>
  );
}
