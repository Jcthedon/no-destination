import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { AuthProvider } from "@/components/AuthProvider";
import AuthSync from "@/components/AuthSync";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "No Destination — Travel built around who you are",
  description:
    "Take the 2-minute personality quiz and discover the countries that match who you are — not just what's available.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-full flex flex-col`}>
        <AuthProvider>
          <AuthSync />
          <Nav />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
