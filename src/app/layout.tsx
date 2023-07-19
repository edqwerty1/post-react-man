import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "API Tester",
  description:
    "Blazing fast, light weight, simple, in browser, mobile friendly API client for testing endpoints.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className={inter.className + " bg-base-100  m-0 "}>{children}</body>
    </html>
  );
}
