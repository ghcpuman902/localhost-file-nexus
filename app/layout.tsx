import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FileHeart, Heart, Star } from "lucide-react";
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Localhost File Nexus",
  description: "Lightweight local network file sharing & real-time text synchronization hub. Securely exchange files and sync clipboard content between devices on your LAN.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="m-8 mb-0">
            <Link href="/">
              <h1 className="scroll-m-20 text-4xl font-extrabold font-mono tracking-tight lg:text-5xl flex items-center gap-2">
                <FileHeart className="w-12 h-12" />
                localhost-file-nexus
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                A local file sharing & text sync hub for cross-platform collaboration
              </p>
            </Link>
          </header>
          {children}
          <footer className="mx-8 mb-24 flex flex-col gap-4 border-t-2 pt-4 text-sm text-muted-foreground">
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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
