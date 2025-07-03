import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { auth } from "@/auth";
import SignInButton from "./components/SignInButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rainbow comp",
  description: "Player management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased p-4`}
        style={{
          background:
            "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 20%, #fee2e2 40%, #fef3c7 60%, #d1fae5 80%, #dbeafe 100%)",
          minHeight: "100vh",
        }}
      >
        {session ? (
          <>
            <Navbar />
            {children}
          </>
        ) : (
          <SignInButton />
        )}
      </body>
    </html>
  );
}
