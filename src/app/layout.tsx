import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TimeTrackerProvider } from "@/contexts/TimeTrackerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TimeTracker - Track Your Work Time",
  description: "A modern time tracking application for managing your work hours and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TimeTrackerProvider>
          <div className="min-h-screen bg-gray-50">
            <main className="mx-auto">
              {children}
            </main>
          </div>
        </TimeTrackerProvider>
      </body>
    </html>
  );
}
