import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { API_BASE_URL } from "@/utils/api";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Altas Dental Center",
  description: "Excellence in Dental Care",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiOrigin = API_BASE_URL.replace(/\/$/, "");

  return (
    <html
      lang="en"
      className={`${cinzel.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preload"
          href="/fonts/TheSeasons-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/images/udrimage.png"
          as="image"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/images/bg.png"
          as="image"
          fetchPriority="high"
        />
        {apiOrigin.startsWith("http") ? (
          <>
            <link rel="dns-prefetch" href={apiOrigin} />
            <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col bg-white">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
