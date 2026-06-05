"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Activity,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/logs", label: "Log Analysis", icon: Upload },
  { href: "/threats", label: "Threats", icon: AlertTriangle },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/chat", label: "AI Assistant", icon: MessageSquare },
  { href: "/scanner", label: "GitHub Scanner", icon: GitBranch },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo / Header */}
        <div className={`p-4 flex items-center border-b border-gray-900/50 justify-between flex-shrink-0`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-cyan-950/40 border border-cyan-500/20">
              <Shield size={16} className="text-cyan-400" />
            </div>
            {(!collapsed || mobile) && (
              <span className="font-bold font-heading text-sm text-white tracking-wide whitespace-nowrap">
                THREAT<span className="text-emerald-400">HUNTER</span>
              </span>
            )}
          </div>
          {mobile ? (
            <button onClick={() => setSidebarOpen(false)}>
              <X size={18} className="text-gray-400 hover:text-white" />
            </button>
          ) : (
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-6 h-6 rounded-md items-center justify-center border border-gray-900 bg-black/40 text-gray-400 hover:text-white"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Live operational indicator */}
        {(!collapsed || mobile) && (
          <div className="px-4 py-3 border-b border-gray-900/30 flex-shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
              <div className="status-dot" />
              <span>SYS_ACTIVE</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-2 py-3 flex flex-col gap-1 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item relative group font-mono text-xs ${isActive ? "active" : ""}`}
                onClick={() => mobile && setSidebarOpen(false)}
              >
                <item.icon size={16} className="flex-shrink-0" />
                {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
                
                {/* Tooltip for collapsed state */}
                {collapsed && !mobile && (
                  <div className="absolute left-16 bg-black border border-cyan-500/20 text-white font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Signout */}
      <div className="p-3 border-t border-gray-900/50 flex-shrink-0">
        {session?.user && (!collapsed || mobile) && (
          <div className="flex items-center gap-2.5 mb-3 p-1 rounded bg-black/20">
            {session.user.image ? (
              <Image src={session.user.image} alt="avatar" width={28} height={28}
                className="rounded-full border border-cyan-500/20" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-heading bg-cyan-950 text-cyan-400 border border-cyan-500/20">
                {session.user.name?.[0] ?? "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-white truncate font-heading leading-tight">
                {session.user.name}
              </div>
              <div className="text-[9px] text-gray-500 truncate font-mono leading-none mt-0.5">
                {session.user.email}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium text-red-400 hover:bg-red-500/5 transition-all w-full`}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {(!collapsed || mobile) && <span>SIGN_OUT</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden text-white" style={{ background: "transparent" }}>
      {/* Desktop Sidebar Rail */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 h-full transition-all duration-300 z-30"
        style={{
          width: collapsed ? "68px" : "240px",
          background: "rgba(10, 10, 10, 0.8)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.03)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden"
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                background: "rgba(10, 10, 10, 0.95)",
                backdropFilter: "blur(24px)",
              }}
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dashboard Body Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Command Topbar */}
        <header 
          className="flex-shrink-0 flex items-center justify-between px-6 h-14 border-b z-20"
          style={{ 
            borderColor: "rgba(255,255,255,0.03)", 
            background: "rgba(10, 10, 10, 0.6)", 
            backdropFilter: "blur(12px)" 
          }}
        >
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-1 rounded hover:bg-white/5" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} className="text-gray-400 hover:text-white" />
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
              <Activity size={14} className="text-emerald-400" />
              <span>CORE_ENGINE // OPERATIONAL</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session?.user?.image && (
              <Image src={session.user.image} alt="avatar" width={28} height={28}
                className="rounded-full border border-cyan-500/20" />
            )}
          </div>
        </header>

        {/* Page Container wrapper */}
        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
