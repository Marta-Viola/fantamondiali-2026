import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import StandardFooter from '@/components/ui/StandardFooter'
import StandardHeader from '@/components/ui/StandardHeader'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "⚽ | FantaMondiali 2026",
  description: "Sfida i tuoi amici e scala la classifica!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-emerald-50`}
    >
      <body className="bg-emerald-50 min-h-screen flex flex-col antialiased">
        <div className="flex-1 w-full pb-32">
          
          {children}
          
          <StandardFooter />
        </div>
        
      </body>
    </html>
  );
}
