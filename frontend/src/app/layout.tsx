import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rampling",
  description: "Rampling Security & Performance Scanner",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white">{children}</body>
    </html>
  );
}
