import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FileHeart, Heart, Star } from "lucide-react";
import { Toaster } from "@/components/ui/toaster"
import { networkInterfaces } from "os";
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


const getLocalIPAddresses = () => {
  const nets = networkInterfaces();
  const results: { [key: string]: string[] } = Object.create(null);

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  
  // Return the first found non-internal IPv4 address
  return results[Object.keys(results)[0]]?.[0] || 'No IP found';
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ipAddress = getLocalIPAddresses();
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
          <header className="p-2 px-4 md:p-4 md:px-8">
            <Link href="/">
              <h1 className="scroll-m-20 text-2xl md:text-4xl font-extrabold font-mono tracking-tight lg:text-5xl flex items-center gap-2">
                <FileHeart className="w-12 h-12" />
                {ipAddress ? `http://${ipAddress}:3000` : 'localhost-file-nexus'}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
              localhost-file-nexus: A local file sharing & text sync hub for cross-platform collaboration. From other devices:<br />
              ① Connect to the same network / wifi.<br />
              ② Go to browser and type: http://{ipAddress}:3000
              </p>
            </Link>
          </header>
          <div className="min-h-screen p-2 px-4 md:p-4 md:px-8">
            {children}
          </div>
          <footer className="mx-4 md:mx-8 mb-24 flex flex-col gap-4 border-t-2 pt-4 text-sm text-muted-foreground">
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
