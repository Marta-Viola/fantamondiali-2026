import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css";

import NextTopLoader from 'nextjs-toploader'
import StandardFooter from '@/components/ui/StandardFooter'

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
        {/* loading bar */}
        <NextTopLoader 
          color="#10b981"
          height={4}
          showSpinner={false}
          shadow="0 0 10px #10b981,0 0 5px #10b981"
        />

        <div className="flex-1 w-full pb-32">
          {children}
          <StandardFooter />
        </div>
        
      </body>
    </html>
  );
}
