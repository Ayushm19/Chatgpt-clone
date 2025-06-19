"use client"

import { useState } from "react"
import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"


type SidebarProps = {
  isCollapsed: boolean
  onToggle: () => void
  className?: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  userId: string
}

export function Sidebar({ isCollapsed, onToggle, className, isOpen, setIsOpen }: SidebarProps) {
  
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [showModelDropdown, setShowModelDropdown] = useState(false)

  const pathname = usePathname()
  const router = useRouter()

  const handleClick = (chatId: string) => {
  window.location.href = `/?chatId=${chatId}`;
  }
  

  const handleNewChat = () => {
  const newChatId = uuidv4();
  window.location.href = `/?chatId=${newChatId}`; // ✅ Full reload
  }

  
  const { user, isLoaded } = useUser()
  const userId = isLoaded ? user?.id : null


  // 👇 Automatically close sidebar on route change (especially useful for mobile)
  useEffect(() => {
  if (typeof window === "undefined") return;

  const handleResize = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      onToggle?.();
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  // Call on mount
  handleResize();

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    setIsOpen(false);
  }
  }, [pathname]);

  const [chatList, setChatList] = useState<{ _id: string; latestMessage: string }[]>([])
  const [loadingChats, setLoadingChats] = useState(true)

 useEffect(() => {
  if (!isLoaded) return;

  if (!userId) {
    setChatList([])
    setLoadingChats(false) // ✅ Stop loading when no user
    return;
  }

  const fetchChats = async () => {
    setLoadingChats(true) // ✅ Start loading
    try {
      const res = await fetch("/api/chats")
      const data = await res.json()
      if (res.ok && data.success) {
        setChatList(data.chats)
      }
    } catch (err) {
      console.error("Failed to load chats:", err)
    } finally {
      setLoadingChats(false) // ✅ Stop loading
    }
  }

  fetchChats()
  }, [isLoaded, userId])



  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chatList.filter((chat) =>
  chat.latestMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )



  return (
    <>
      
      {/* Sidebar */}
      <aside
  className={cn(
  "fixed top-0 left-0 z-30 h-full bg-background shadow-sm flex flex-col justify-between p-4 transition-all duration-300 ease-in-out border-r border-neutral-800 dark:border-white/10",
  isCollapsed ? "w-[72px]" : "w-[240px]",                           // Always visible on desktop
  isOpen ? "translate-x-0" : "-translate-x-full",        // Mobile toggle
  className
  )}
>


        {/* Top area */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4 w-full">
            {/* Fixed ChatGPT Logo */}
            {/* Fixed ChatGPT Logo */}
<div className="h-8 w-8 flex items-center justify-center shrink-0">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
    imageRendering="optimizeQuality"
    fillRule="evenodd"
    clipRule="evenodd"
    viewBox="0 0 512 509.639"
    className="w-full h-full"
  >
    <path
      fill="#fff"
      d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.613-115.613 115.613H115.612C52.026 509.64 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"
    />
    <path
      fillRule="nonzero"
      d="M412.037 221.764a90.834 90.834 0 004.648-28.67 90.79 90.79 0 00-12.443-45.87c-16.37-28.496-46.738-46.089-79.605-46.089-6.466 0-12.943.683-19.264 2.04a90.765 90.765 0 00-67.881-30.515h-.576c-.059.002-.149.002-.216.002-39.807 0-75.108 25.686-87.346 63.554-25.626 5.239-47.748 21.31-60.682 44.03a91.873 91.873 0 00-12.407 46.077 91.833 91.833 0 0023.694 61.553 90.802 90.802 0 00-4.649 28.67 90.804 90.804 0 0012.442 45.87c16.369 28.504 46.74 46.087 79.61 46.087a91.81 91.81 0 0019.253-2.04 90.783 90.783 0 0067.887 30.516h.576l.234-.001c39.829 0 75.119-25.686 87.357-63.588 25.626-5.242 47.748-21.312 60.682-44.033a91.718 91.718 0 0012.383-46.035 91.83 91.83 0 00-23.693-61.553l-.004-.005zM275.102 413.161h-.094a68.146 68.146 0 01-43.611-15.8 56.936 56.936 0 002.155-1.221l72.54-41.901a11.799 11.799 0 005.962-10.251V241.651l30.661 17.704c.326.163.55.479.596.84v84.693c-.042 37.653-30.554 68.198-68.21 68.273h.001zm-146.689-62.649a68.128 68.128 0 01-9.152-34.085c0-3.904.341-7.817 1.005-11.663.539.323 1.48.897 2.155 1.285l72.54 41.901a11.832 11.832 0 0011.918-.002l88.563-51.137v35.408a1.1 1.1 0 01-.438.94l-73.33 42.339a68.43 68.43 0 01-34.11 9.12 68.359 68.359 0 01-59.15-34.11l-.001.004zm-19.083-158.36a68.044 68.044 0 0135.538-29.934c0 .625-.036 1.731-.036 2.5v83.801l-.001.07a11.79 11.79 0 005.954 10.242l88.564 51.13-30.661 17.704a1.096 1.096 0 01-1.034.093l-73.337-42.375a68.36 68.36 0 01-34.095-59.143 68.412 68.412 0 019.112-34.085l-.004-.003zm251.907 58.621l-88.563-51.137 30.661-17.697a1.097 1.097 0 011.034-.094l73.337 42.339c21.109 12.195 34.132 34.746 34.132 59.132 0 28.604-17.849 54.199-44.686 64.078v-86.308c.004-.032.004-.065.004-.096 0-4.219-2.261-8.119-5.919-10.217zm30.518-45.93c-.539-.331-1.48-.898-2.155-1.286l-72.54-41.901a11.842 11.842 0 00-5.958-1.611c-2.092 0-4.15.558-5.957 1.611l-88.564 51.137v-35.408l-.001-.061a1.1 1.1 0 01.44-.88l73.33-42.303a68.301 68.301 0 0134.108-9.129c37.704 0 68.281 30.577 68.281 68.281a68.69 68.69 0 01-.984 11.545v.005zm-191.843 63.109l-30.668-17.704a1.09 1.09 0 01-.596-.84v-84.692c.016-37.685 30.593-68.236 68.281-68.236a68.332 68.332 0 0143.689 15.804 63.09 63.09 0 00-2.155 1.222l-72.54 41.9a11.794 11.794 0 00-5.961 10.248v.068l-.05 102.23zm16.655-35.91l39.445-22.782 39.444 22.767v45.55l-39.444 22.767-39.445-22.767v-45.535z"
    />
  </svg>
</div>


            {/* Collapse toggle */}
            <button
              onClick={onToggle}
              className="hidden md:inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft
                className={cn("w-5 h-5 transition-transform", {
                  "rotate-180": isCollapsed,
                })}
              />
            </button>

            {/* Close on mobile */}
            <button
            onClick={() => setIsOpen(false)}
            className="block md:hidden text-xl"
             >
            ✕
            </button>
            
          </div>

          {/* Buttons and search */}
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-4 mb-4 text-foreground">
              {/* New Chat Icon */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-0"
                onClick={(handleNewChat)}
                >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-foreground"
                  stroke="currentColor"
                  style={{ color: 'inherit' }}
                >
                  <path
                    d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C18.6099 1.78002 20.1799 1.78002 21.1499 2.75002C22.1199 3.72002 22.1199 5.29005 21.1499 6.26005L21.2799 6.40005Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              {/* Search Chat Icon */}
              <Button variant="ghost" size="icon" className="p-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-foreground"
                  stroke="currentColor"
                  style={{ color: 'inherit' }}
                >
                  <path
                    d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>
          ) : (
            <>
              {/* Full New Chat Button */}
              <Button variant="outline" className="w-full flex items-center gap-2 mb-4" onClick={(handleNewChat)}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-foreground"
                  stroke="currentColor"
                  style={{ color: 'inherit' }}
                >
                  <path
                    d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C18.6099 1.78002 20.1799 1.78002 21.1499 2.75002C22.1199 3.72002 22.1199 5.29005 21.1499 6.26005L21.2799 6.40005Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                New Chat
              </Button>

              {/* Full Search Bar */}
              <div className="w-full flex items-center gap-2 mb-4 px-3 py-2 border rounded-md bg-muted">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-foreground"
                  stroke="currentColor"
                  style={{ color: 'inherit' }}
                >
                  <path
                    d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search chats"
                  className="bg-transparent focus:outline-none text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Chats list */}
          {/* Chats list */}
  <ScrollArea className="h-[calc(100vh-260px)] pr-2">
   <div className="space-y-2">
    {loadingChats ? (
      <div className="text-muted-foreground text-sm px-3">Loading chats ...</div>
    ) : (
      filteredChats.map((chat, idx) => (
        <Button
          key={chat._id}
          variant="ghost"
          onClick={() => handleClick(chat._id)}
          className={cn(
            "w-full justify-start px-3 py-2 rounded-md hover:bg-accent",
            isCollapsed && "justify-center"
          )}
        >
          {!isCollapsed &&
            `Chat ${idx + 1}: ${chat.latestMessage?.slice(0, 25) || "No message yet"}...`}
        </Button>
         ))
         )}
    </div>
  </ScrollArea>

          
        </div>

        {/* Footer button */}
        {!isCollapsed && (
          <div className="relative w-full">
        <Button
        variant="default"
        className="w-full flex items-center justify-between gap-2 mt-4"
        onClick={() => setShowModelDropdown((prev) => !prev)}
        >
        <span>Model: {selectedModel}</span>
        <ChevronRight className="w-4 h-4" />
        </Button>

        {showModelDropdown && (
        <div className="absolute bottom-12 w-full z-50 bg-background border border-neutral-700 dark:border-white/10 rounded-md shadow-lg p-1">
        {["gpt-4", "gpt-4o", "gpt-3.5", "o4-mini"].map((model) => (
        <button
          key={model}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md ${
            selectedModel === model ? "bg-muted font-medium" : ""
          }`}
          onClick={() => {
            setSelectedModel(model)
            setShowModelDropdown(false)
          }}
        >
          {model}
        </button>
      ))}
    </div>
  )}
</div>

        )}
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
