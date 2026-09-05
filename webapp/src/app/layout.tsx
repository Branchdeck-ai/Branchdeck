import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://branchdeck.vercel.app'),
  title: "Branchdeck — AI Features Built Directly Into Your Codebase",
  description: "Branchdeck integrates custom AI search, support agents, and document processing directly into your existing codebase. Built matching your code patterns, reviewed via PRs, and monitored with live spend governance.",
  keywords: [
    "Branchdeck",
    "BranchDeck",
    "Branchdeck AI",
    "AI codebase integration",
    "add AI features to existing codebase",
    "AI integration service",
    "AI feature development retainer",
    "custom AI agent integration",
    "AI search integration",
    "tree-sitter AST code pattern matching",
    "AI spend governance",
    "AI token cost tracking",
    "AI implementation for software teams"
  ],
  authors: [{ name: "Branchdeck Team" }],
  creator: "Branchdeck",
  publisher: "Branchdeck",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://branchdeck.vercel.app"
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Branchdeck — AI Features Built Directly Into Your Codebase",
    description: "Branchdeck ships production-grade AI search, support agents, and document processing directly into your repository, matching your patterns and reviewed by your devs.",
    url: "https://branchdeck.vercel.app",
    siteName: "Branchdeck",
    type: "website",
    locale: "en_US",
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'Branchdeck Logo' }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Branchdeck — AI Features Built Directly Into Your Codebase",
    description: "Build & maintain production AI features directly inside your codebase with clean PRs, AST pattern matching, and live spend governance.",
    images: ['/logo.png'],
    creator: "@Branchdeck"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Branchdeck",
      "alternateName": ["BranchDeck", "Branchdeck AI"],
      "url": "https://branchdeck.vercel.app",
      "image": "https://branchdeck.vercel.app/logo.png",
      "logo": "https://branchdeck.vercel.app/logo.png",
      "operatingSystem": "Web, Windows, macOS, Linux",
      "applicationCategory": "DeveloperApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Branchdeck is an AI feature integration platform and retainer service that embeds custom AI search, support agents, and document processing directly into existing software codebases.",
      "featureList": [
        "AST Pattern-Matched AI Code Generation",
        "Custom AI Semantic Search Integration",
        "Autonomous Support & Ops Agents",
        "Document Processing Pipelines",
        "Pull Request Safety & Developer Review Flow",
        "Live Retainer Spend & Token Governance Dashboard"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Branchdeck",
      "url": "https://branchdeck.vercel.app",
      "logo": "https://branchdeck.vercel.app/logo.png",
      "sameAs": [
        "https://github.com/Branchdeck",
        "https://twitter.com/Branchdeck"
      ],
      "description": "Branchdeck provides AI codebase integration engineering and automated spend governance for software teams."
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Branchdeck",
      "alternateName": "Branchdeck AI Codebase Integration Engine",
      "url": "https://branchdeck.vercel.app"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does Branchdeck do?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Branchdeck builds, embeds, and maintains production-grade AI features—such as semantic search, support agents, and document processing—directly inside your existing codebase, delivered through clean pull requests that match your coding patterns."
          }
        },
        {
          "@type": "Question",
          "name": "How does Branchdeck integrate AI features into existing software?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Branchdeck uses a tree-sitter AST engine to analyze your actual repository architecture. It generates code that matches your existing frameworks, patterns, and conventions, which your developers review and merge."
          }
        },
        {
          "@type": "Question",
          "name": "What AI features can Branchdeck build for my product?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Branchdeck builds custom AI search engines, automated support and operations agents, and intelligent document processing pipelines, complete with live token usage and spend governance."
          }
        }
      ]
    }
  ];

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

