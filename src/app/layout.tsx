import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import ClientWalletProvider from "../context/ClientWalletProvider";
import { MaintenanceBannerWrapper } from "../components/MaintenanceBannerWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Battle Memecoin Club",
  description: "A pixel art betting game where memecoins battle for supremacy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pixelFont.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClientWalletProvider>
          <MaintenanceBannerWrapper />
          {children}
        </ClientWalletProvider>
      </body>
    </html>
  );
}
