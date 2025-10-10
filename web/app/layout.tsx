import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lua Obfuscator",
  description: "Protect your Lua code with advanced obfuscation techniques",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="dark">{children}</body>
    </html>
  );
}
