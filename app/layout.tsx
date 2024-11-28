import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DCC Ref",
  description: "Lookup DCC Tables Fast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center bg-gray-900 p-4">
        <Link href="/" className="text-4xl font-bold mt-8 mb-8">DCC Search App</Link>
        {children}
      </body>
    </html>
  );
}
