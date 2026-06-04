import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { StoreHydration } from "@/components/store-hydration";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TDC Matchmaker AI — The Date Crew",
  description: "AI-powered matchmaking operating system for professional matchmakers",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">
        <StoreHydration />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#18181b",
              border: "1px solid #e4e4e7",
              borderRadius: "10px",
              fontSize: "14px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            },
            success: { iconTheme: { primary: "#059669", secondary: "#ffffff" } },
            error: { iconTheme: { primary: "#e11d48", secondary: "#ffffff" } },
          }}
        />
      </body>
    </html>
  );
}
