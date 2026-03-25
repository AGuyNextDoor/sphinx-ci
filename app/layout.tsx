import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sphinx-ci.vercel.app";

export const metadata: Metadata = {
  title: "sphinx-ci — Code comprehension quizzes before merge",
  description:
    "The Sphinx makes you understand your own code. AI-powered quizzes generated from PR diffs — so you ship code you truly understand.",
  icons: {
    icon: "/sphinx-favicon.png",
  },
  openGraph: {
    title: "sphinx-ci — The Sphinx that makes you understand your own code",
    description:
      "Every PR is a learning moment. sphinx-ci generates a quiz from your actual diff — so you ship code you truly understand.",
    url: appUrl,
    siteName: "sphinx-ci",
    images: [
      {
        url: `${appUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: "sphinx-ci — Code comprehension quizzes before merge",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "sphinx-ci — The Sphinx that makes you understand your own code",
    description:
      "Every PR is a learning moment. AI-powered quizzes from your PR diff.",
    images: [`${appUrl}/api/og`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "sphinx-ci",
              description: "AI-powered code comprehension quizzes for Pull Requests. The Sphinx makes you understand your own code before merge.",
              url: appUrl,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: "Skillberg",
                url: "https://skillberg.app",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
          style={{ background: "#c9a84c", color: "#0f0c1a" }}
        >
          Skip to content
        </a>
        <SessionProvider>
          <div id="main-content">{children}</div>
        </SessionProvider>
      </body>
    </html>
  );
}
