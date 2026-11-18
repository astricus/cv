import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Set NEXT_PUBLIC_SITE_URL in production (e.g. https://romanenko.dev): canonical URL,
// OG/Twitter previews and structured data all resolve against it. On Vercel the
// production domain is picked up automatically.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
const TITLE = "Konstantin Romanenko — Software Team Lead";
const DESCRIPTION =
  "Explore my career as a solar system: 13+ years of engineering from freelance front-end to team lead at innoscripta — micro-frontends, PHP/Laravel microservices, and teams that ship. Fly between the planets to learn more.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Konstantin Romanenko",
  },
  description: DESCRIPTION,
  applicationName: "Konstantin Romanenko — Space Portfolio",
  authors: [{ name: "Konstantin Romanenko" }],
  creator: "Konstantin Romanenko",
  keywords: [
    "Konstantin Romanenko",
    "software team lead",
    "portfolio",
    "micro-frontends",
    "Module Federation",
    "React",
    "Next.js",
    "TypeScript",
    "Laravel",
    "three.js",
    "Bolzano",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Konstantin Romanenko — Space Portfolio",
    title: TITLE,
    description:
      "An interactive 3D solar system where every planet is a chapter of my career. Built with Next.js and three.js.",
    locale: "en_US",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "A 3D solar system portfolio — sun, Saturn, Earth, a comet and a space station, each labeled with a CV section",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "An interactive 3D solar system where every planet is a chapter of my career. Built with Next.js and three.js.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#030014",
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Konstantin Romanenko",
  jobTitle: "Software Team Lead",
  email: "mailto:astricus@hotmail.com",
  url: SITE_URL,
  sameAs: ["https://it.linkedin.com/in/astricus", "https://github.com/astricus"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bolzano",
    addressCountry: "IT",
  },
  worksFor: {
    "@type": "Organization",
    name: "innoscripta SE",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "St. Petersburg State University",
  },
  knowsAbout: [
    "Micro-frontend architecture",
    "Webpack Module Federation",
    "React",
    "Next.js",
    "TypeScript",
    "PHP",
    "Laravel",
    "RabbitMQ",
    "PostgreSQL",
    "GitLab CI/CD",
    "Engineering leadership",
    "Hiring and mentoring",
  ],
  knowsLanguage: ["en", "it", "ru"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.variable}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
