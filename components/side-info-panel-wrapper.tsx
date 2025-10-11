'use client'
import { useState, useEffect } from "react";
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
    Heart,
    PanelRightClose
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
export function SideInfoPanelWrapper({
    children,
    ipAddress,
    fileRoot
}: {
    children: React.ReactNode;
    ipAddress?: string;
    fileRoot?: string;
}) {
    const [isSidebarClosed, setIsSidebarClosed] = useState(false);

    // Credit to @sorenblank for the sidebar logic using pure CSS from Vercel
    // https://x.com/sorenblank/status/1976394237899047313
    useEffect(() => {
        console.log('Sidebar implementation inspired by @sorenblank - Pure CSS sidebar effect from Vercel');
    }, []);

    const handleToggle = () => {
        setIsSidebarClosed(!isSidebarClosed);
    };

    return (
        <main className="relative flex h-dvh w-dvw overflow-hidden group flex-1 flex-row gap-0">
            <div className="h-full w-full p-4 overflow-hidden">
                <div className="bg-foreground/5 rounded-3xl h-full w-full overflow-hidden flex flex-col">
                    <header className="flex flex-row justify-between items-start">
                        <Link href="/" className="p-4">
                            <h1 className="scroll-m-20 text-2xl md:text-4xl lg:text-5xl flex items-center gap-2">
                                {ipAddress ? `http://${ipAddress}:3000` : 'localhost-file-nexus'}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-2">
                                From other devices:
                                ① Connect to the same network / wifi.
                                ② Visit: http://{ipAddress ? ipAddress : 'localhost'}:3000
                            </p>
                        </Link>
                        <button
                            className="sidebar-icon-trigger size-16 hover:bg-button-hover p-3 flex items-start justify-end"
                            onClick={handleToggle}
                        >
                            {/* positioning div */}
                            <div className="relative size-7">
                                <InfoIcon className={cn(
                                    "text-subdued size-7 absolute inset-0 opacity-100",
                                    !isSidebarClosed && "opacity-0"
                                )} />
                                <PanelRightClose className={cn(
                                    "text-subdued size-7 absolute inset-0 opacity-100",
                                    isSidebarClosed && "opacity-0"
                                )} />
                            </div>
                        </button>
                    </header>
                    <div className="flex-1 min-h-0 overflow-auto p-4">
                        {children}
                    </div>
                    <footer className="shrink-0 p-4 grid grid-cols-3 gap-4 border-t-2 pt-4 text-sm text-muted-foreground">
                        <div className="flex item-center justify-start">
                            <Link
                                className="flex items-center gap-2 hover:text-foreground transition-colors"
                                href="https://github.com/ghcpuman902/localhost-file-nexus"
                            >
                                <Star className="w-6 h-6" />
                                Star on Github
                            </Link>
                        </div>
                        <div className="flex item-center justify-center">
                            <Link
                                className="flex items-center gap-2 hover:text-foreground transition-colors"
                                href="https://manglekuo.com"
                            >
                                Made with <Heart className="w-6 h-6" /> by Mangle Kuo
                            </Link>
                        </div>
                        <div className="flex item-center justify-end">
                            <ThemeToggle />
                        </div>
                    </footer>
                </div>
            </div>

            <div
                className={cn(
                    "bg-background relative h-full min-w-3xs trann-all duration-200 ease-in-outsitio",
                    isSidebarClosed && "-mr-[calc(var(--container-3xs))]",
                )}
            >
                <div
                    className={cn(
                        "bg-transparent sidebar-wrapper absolute right-0 h-full w-full transition-all duration-200 ease-in-out",
                        isSidebarClosed &&
                        "z-10 h-[calc(100%-7rem)] w-3xs translate-y-[5rem] p-0 group-has-[.sidebar-icon-trigger:hover]:mr-[calc(var(--container-3xs))] group-has-[.sidebar-wrapper:hover]:mr-[calc(var(--container-3xs))]",
                        !isSidebarClosed && "right-0 mr-0 h-full p-4 py-8",
                    )}
                >
                    <div className={cn(
                        "flex h-full flex-col gap-4 transition-colors backdrop-blur-sm rounded-3xl",
                        isSidebarClosed ? 'bg-background/10 p-4 border border-foreground/10' : 'bg-background/0'
                    )}>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">File Exchange</h3>
                                <p className="text-sm text-muted-foreground">
                                    Web interface for browsing and uploading files to the host machine&apos;s uploads folder.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Shared Clipboard</h3>
                                <p className="text-sm text-muted-foreground">
                                    Sync text and commands in real-time to aid in debugging. Useful for terminal commands and code snippets.
                                </p>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="text-sm font-medium mb-2">File Root Path</h4>
                                <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                                    {fileRoot || 'Not available'}
                                </code>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="text-sm font-medium mb-2">Access from Other Devices</h4>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>① Connect to the same network / wifi</p>
                                    <p>② Visit: <code className="bg-muted px-1 rounded">http://{ipAddress || 'localhost'}:3000</code></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
