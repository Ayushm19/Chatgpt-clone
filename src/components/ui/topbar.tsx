"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Dispatch, SetStateAction } from "react";

interface TopbarProps {
  isCollapsed: boolean;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function Topbar({
  isCollapsed,
  isOpen,
  setIsOpen,
  setIsCollapsed,
}: TopbarProps) {
  return (
    <>
      <header className="h-16 px-4 border-b border-border bg-popover text-foreground flex items-center justify-between shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => {
              setIsCollapsed(false); // ✅ Make sure it's expanded
              setIsOpen(true);       // ✅ Open the sidebar
            }}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <h1 className="text-xl font-semibold tracking-tight">ChatGPT Clone</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="text-sm">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setIsOpen(false)} // ✅ Close sidebar on background click
        />
      )}
    </>
  );
}
