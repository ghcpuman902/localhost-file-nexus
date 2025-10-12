import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import { SideInfoPanelWrapper } from "@/components/side-info-panel-wrapper";
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
  return results[Object.keys(results)[0]]?.[0] || undefined;
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ipAddress = getLocalIPAddresses();
  const fileRoot = process.cwd();
  
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
          <SideInfoPanelWrapper ipAddress={ipAddress} fileRoot={fileRoot}>
            {children}
          </SideInfoPanelWrapper>
          <Toaster expand={true} richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
