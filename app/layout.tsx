import type { Metadata } from "next";
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  title: {
    default: "Viberr Projects",
    template: "%s | Viberr",
  },
  description:
    "12 production-ready projects built by Viberr. Workflow automation, platforms, and tools — ready to go live.",
  metadataBase: new URL("https://swift-bear-260.vercel.app"),
  openGraph: {
    title: "Viberr Projects",
    description:
      "12 production-ready projects built by Viberr. Workflow automation, platforms, and tools.",
    url: "https://swift-bear-260.vercel.app",
    siteName: "Viberr",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viberr Projects",
    description:
      "12 production-ready projects built by Viberr. Workflow automation, platforms, and tools.",
  },
  robots: {
    index: true,
    follow: true,
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
        <script
          dangerouslySetInnerHTML={{
            __html: `if(new URLSearchParams(location.search).has('embed'))document.documentElement.dataset.embed='1'`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
