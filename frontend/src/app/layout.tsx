import type { Metadata } from "next";
import "./globals.css";
import { inter, notoSans, publicSans } from "@/styles/fonts";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "IP-SAKTI Sahayak — Ayush Knowledge Engine",
  description:
    "Empowering Ayush Patent Intelligence & Classical Knowledge Defence. " +
    "AI-powered IPR assistant for Ayurveda — patents, trademarks, GI, biodiversity, " +
    "regulatory classification, and TKDL prior-art search.",
  keywords: [
    "Ayurveda",
    "IP",
    "TKDL",
    "Patent",
    "AYUSH",
    "Traditional Knowledge",
    "Intellectual Property",
  ],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSans.variable} ${publicSans.variable}`}>
      <body className="min-h-screen">
        {/* Gradient accent line at top */}
        <div className="header-accent" />

        {/* Header */}
        <Header />

        {/* Main Layout: Sidebar + Content */}
        <div className="flex pt-[95px]">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main
            className="flex-1 min-h-[calc(100vh-95px)] flex flex-col"
            style={{ marginLeft: "var(--sidebar-width)" }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
