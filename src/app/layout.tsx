import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import LivingBackground from "@/components/common/LivingBackground";

export const metadata: Metadata = {
  title: "ThreatHunter AI — AI-Powered Security Operations Center",
  description:
    "Analyze security logs, detect threats, and generate professional incident reports with AI. Built for modern security teams and cybersecurity professionals.",
  keywords: [
    "security",
    "SOC",
    "threat detection",
    "incident response",
    "cybersecurity",
    "AI",
    "log analysis",
  ],
  openGraph: {
    title: "ThreatHunter AI",
    description: "AI-Powered Threat Detection for Modern Security Teams",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <LivingBackground />
          <div className="scan-line" />
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(10, 20, 40, 0.95)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                color: "#e2e8f0",
                fontFamily: "Inter, sans-serif",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
