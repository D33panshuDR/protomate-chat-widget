import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Protomate Chat widget",
  description: "Protomate Chat widget",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <title>Protomate Chat Widget</title>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
