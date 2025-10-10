import type { Metadata } from "next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
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
      <body className="dark">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
