import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { BottomNav } from "@/components/shared/BottomNav";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/shared/AuthProvider";

const kanit = Kanit({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ["latin", "thai"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "อู่สะกลการช่าง รายรับ-รายจ่าย",
  description: "Track your income and expenses easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${kanit.variable} font-sans antialiased min-h-screen flex flex-col bg-[#FDFCF8] text-slate-800 pb-[68px] md:pb-0`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 py-2">
            {children}
          </main>
          <BottomNav />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
