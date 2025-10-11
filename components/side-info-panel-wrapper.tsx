'use client'
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Plus,
    Search,
    Clock,
    Star,
    Trash2,
    Settings,
    InfoIcon,
    FileHeart,
    Heart
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
export function SideInfoPanelWrapper({
    children,
    ipAddress
}: {
    children: React.ReactNode;
    ipAddress?: string;
}) {
    // State to manage the open/closed state of the sidebar.
    // `isSidebarClosed` is true when the sidebar is open (slid out of view) and false when closed (visible).
    const [isSidebarClosed, setIsSidebarClosed] = useState(false);

    // Toggles the sidebar state between open and closed.
    const handleToggle = () => {
        setIsSidebarClosed(!isSidebarClosed);
    };

    return (
        <main className="relative flex h-dvh w-dvw overflow-hidden group flex-1 flex-row gap-0 transition-all duration-200 ease-in-out">


            {/* --- Main Content Area --- */}
            <div className="h-full w-full p-4 transition-all duration-200 ease-in-out overflow-hidden">
                {/* IP Address Display */}

                <div className="bg-foreground/5 rounded-3xl h-full w-full overflow-scroll">
                    <header className="p-4 flex flex-row justify-between items-start">
                        <Link href="/">
                            <h1 className="scroll-m-20 text-2xl md:text-4xl font-extrabold font-mono tracking-tight lg:text-5xl flex items-center gap-2">
                                <FileHeart className="w-12 h-12" />
                                {ipAddress ? `http://${ipAddress}:3000` : 'localhost-file-nexus'}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-2">
                                From other devices:
                                ① Connect to the same network / wifi.
                                ② Visit: http://{ipAddress ? ipAddress : 'localhost'}:3000
                            </p>
                        </Link>
                        {/*
                        This div has the class `sidebar-icon-trigger`. It serves as the hover target.
                        When the user's cursor enters this div, the `group-has` condition is met,
                        which triggers the animation on the sidebar panel.
                    */}

                        {/* The actual button that toggles the sidebar's open/closed state on click. */}
                        <Button
                            className="sidebar-icon-trigger size-8 hover:bg-button-hover rounded-lg"
                            onClick={handleToggle}
                            variant="ghost"
                            size="icon"
                        >
                            <InfoIcon className="text-subdued size-8" />
                        </Button>
                    </header>
                    <div className="p-2 px-4 md:p-4 md:px-8">
                        {children}
                        <footer className="mt-6 flex flex-col gap-4 border-t-2 pt-4 text-sm text-muted-foreground">
                            <div className="flex justify-between items-center">
                                <Link
                                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                                    href="https://github.com/ghcpuman902/localhost-file-nexus"
                                >
                                    <Star className="w-6 h-6" />
                                    Star on Github
                                </Link>
                                <ThemeToggle />
                            </div>
                            <div className="flex justify-center">
                                <Link
                                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                                    href="https://manglekuo.com"
                                >
                                    Made with <Heart className="w-6 h-6" /> by Mangle Kuo
                                </Link>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>

            {/* --- Sidebar Section --- */}
            {/*
                    When `isSidebarClosed` is true, '-mr-[calc(var(--container-3xs))]' is applied to slide it off-screen to the right.
                */}
            <div
                className={cn(
                    "bg-background relative h-full min-w-3xs transition-all duration-200 ease-in-out",
                    isSidebarClosed && "-mr-[calc(var(--container-3xs))]",
                )}
            >
                {/* --- Hover-Reveal Sidebar Content --- */}
                {/*
                        This inner div is the floating panel that appears when the sidebar is "open" (`isSidebarClosed`).
                        It becomes visible and slides into view when the trigger element is hovered.
                        - `isSidebarClosed` state: Applies base styles for the floating panel (size, position, etc.).
                        - `group-has-[.sidebar-icon-trigger:hover]:mr-[calc(var(--container-3xs)+1rem)]`: This is the key.
                          If the parent `.group` has a descendant `.sidebar-icon-trigger` that is being hovered,
                          this panel will slide into view.
                        - `group-has-[.sidebar-wrapper:hover]:mr-[calc(var(--container-3xs)+1rem)]`: This allows the panel to *stay* open
                          if the user moves their cursor onto the panel itself after triggering it.
                        - `!isSidebarClosed`: Hides the panel when the sidebar is in its default closed state.
                    */}
                <div
                    className={cn(
                        "bg-transparent sidebar-wrapper absolute right-0 h-full w-full transition-all duration-200 ease-in-out",
                        isSidebarClosed &&
                        "z-10 h-[calc(100%-7rem)] w-3xs translate-y-[5rem] p-0 group-has-[.sidebar-icon-trigger:hover]:mr-[calc(var(--container-3xs))] group-has-[.sidebar-wrapper:hover]:mr-[calc(var(--container-3xs))]",
                        !isSidebarClosed && "right-0 mr-0 h-full p-4 py-8",
                    )}
                >
                    {/* Content inside the hoverable panel */}
                    <div className={cn(
                        "flex h-full flex-col gap-2 transition-colors backdrop-blur-sm rounded-3xl",
                        isSidebarClosed ? 'bg-foreground/10 p-4' : 'bg-foreground/0'
                    )}>
                        Some information about the app to be filled in here.
                    </div>
                </div>
            </div>
        </main>
    )
}
