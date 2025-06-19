"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import Topbar from "@/components/ui/topbar";
import { useUser } from "@clerk/nextjs"


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useUser()
  const userId = user?.id


  // Track screen size to determine mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // set initial

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isCollapsed ? 72 : 240;

  return (
    <div className="flex h-screen w-full ">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        isOpen={isOpen}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        setIsOpen={setIsOpen}
        userId={userId || ""}
        className="border-r border-black/20 dark:border-white/10"
      />

      {/* Main area */}
      <div
        className="flex flex-col flex-1 transition-all duration-300 px-4 min-w-0"
        style={{
          marginLeft: !isMobile ? `${sidebarWidth}px` : 0, // ✅ no margin on mobile
        }}
      >
        <Topbar isCollapsed={isCollapsed} isOpen={isOpen} setIsOpen={setIsOpen} setIsCollapsed={setIsCollapsed} />

        <main className="flex-1 overflow-y-auto pt-4">{children}</main>
      </div>
    </div>
  );
}
