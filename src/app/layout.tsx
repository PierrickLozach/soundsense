import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoundSense - AI Appliance Diagnostics",
  description: "AI-powered appliance diagnostics via sound analysis",
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
