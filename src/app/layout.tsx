import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#030305",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "OnyxBox | الصندوق الأسود",
  description: "أرسل رسائل سرية ومجهولة الهوية بأمان تام.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
  themeColor: "#030305",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  openGraph: {
    title: "OnyxBox",
    description: "Send anonymous messages to idris.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground selection:bg-primary/30 selection:text-primary`}
      >
        {children}
        <footer className="w-full py-8 text-center pointer-events-none z-50">
          <p className="text-[10px] text-gray-600 font-mono opacity-50 uppercase tracking-[0.2em]">
            POWERED BY <span className="text-primary font-bold">idrisium</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
