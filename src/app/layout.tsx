import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import ClientWalletProvider from "../context/ClientWalletProvider";
import { MaintenanceBannerWrapper } from "../components/MaintenanceBannerWrapper";
import MobileBlocker from "@/components/MobileBlocker";
import WalletVerificationScript from "@/components/WalletVerificationScript";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://battlememecoin.club'),
  applicationName: "Battle Memecoin Club",
  authors: [{ name: 'Battle Memecoin Club Team' }],
  creator: "Battle Memecoin Club",
  publisher: "Battle Memecoin Club",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo/bmc-favicon.ico', sizes: 'any' },
      { url: '/logo/bmc-all.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo/bmc-all.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: [
      { url: '/favicon.ico' }
    ],
    apple: [
      { url: '/logo/bmc-all.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://battlememecoin.club',
    siteName: 'Battle Memecoin Club',
    title: 'Battle Memecoin Club',
    description: 'A pixel art betting game where memecoins battle for supremacy',
    images: [
      {
        url: '/logo/bmc-all.png',
        width: 1200,
        height: 630,
        alt: 'Battle Memecoin Club',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@battlememecoin',
    creator: '@battlememecoin',
    title: 'Battle Memecoin Club',
    description: 'A pixel art betting game where memecoins battle for supremacy',
    images: ['/logo/bmc-all.png'],
  },
  verification: {
    other: {
      'solana:verification': 'battlememecoin.club',
    },
  },
  other: {
    'solana:web3AuthToken': 'battle-memecoin-club',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo/bmc-all.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pixelFont.variable} antialiased`}
        suppressHydrationWarning
      >
        <WalletVerificationScript />
        <ClientWalletProvider>
          <MaintenanceBannerWrapper />
          <MobileBlocker />
          {children}
        </ClientWalletProvider>
      </body>
    </html>
  );
}
