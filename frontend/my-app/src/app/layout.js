import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Converge | Where Talent Meets Opportunity",
  description:
    "Connect with experienced professionals, discover real project opportunities, collaborate, and grow your skills with Converge.",
  applicationName: "Converge",
  keywords: [
    "Converge",
    "freelance collaboration",
    "junior developers",
    "mentorship",
    "real-world projects",
    "software engineering",
    "practical experience",
  ],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Converge | Where Talent Meets Opportunity",
    description:
      "Connect with experienced professionals, discover real project opportunities, collaborate, and grow your skills with Converge.",
    siteName: "Converge",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Converge | Where Talent Meets Opportunity",
    description:
      "Connect with experienced professionals, discover real project opportunities, collaborate, and grow your skills with Converge.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
