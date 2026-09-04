import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://branchdeck.vercel.app'),
  title: "Branchdeck | AI Feature Integration for Your Existing Codebase",
  description: "Branchdeck integrates AI search, support agents, and document processing directly into your codebase, matching your patterns and reviewed by your devs.",
  keywords: [
    "AI integration service",
    "add AI features to existing codebase",
    "AI codebase integration",
    "AI implementation for software teams",
    "custom AI agent integration",
    "AI spend monitoring",
    "AI cost governance",
    "how to add AI search to my app",
    "AI integration agency for startups",
    "AI feature development retainer",
    "AI cost tracking for engineering teams"
  ],
  alternates: {
    canonical: "https://branchdeck.vercel.app"
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Branchdeck | AI Feature Integration for Your Existing Codebase",
    description: "Branchdeck integrates AI search, support agents, and document processing directly into your codebase, matching your patterns and reviewed by your devs.",
    url: "https://branchdeck.vercel.app",
    type: "website",
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'Branchdeck Logo' }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Branchdeck | AI Feature Integration for Your Existing Codebase",
    description: "Branchdeck integrates AI search, support agents, and document processing directly into your codebase, matching your patterns and reviewed by your devs.",
    images: ['/logo.png']
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "BranchDeck",
    "operatingSystem": "Windows, macOS, Linux",
    "applicationCategory": "DeveloperApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "AI-powered codebase intelligence that transforms complex software into interactive maps, call flows, and human-readable documentation."
  };

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,slnt,wdth,wght,ROND@8..144,-10..0,25..150,400..700,0..100&family=Google+Sans+Code:ital,wght@0,300..700;1,300..700&family=Google+Symbols:opsz,wght,FILL,GRAD,ROND@40..48,300,0..1,0,50&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
