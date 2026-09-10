import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rampling",
  description: "Rampling Security & Performance Scanner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
