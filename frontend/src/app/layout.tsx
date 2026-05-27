import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RED PARK",
  description: "Gerenciamento inteligente de mensalistas",
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex justify-center bg-gray-200 dark:bg-neutral-900 text-gray-900 dark:text-gray-50`}>
        <div className="w-full max-w-md min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-950 relative shadow-2xl sm:border-x sm:border-gray-300 dark:sm:border-neutral-800">
          {children}
        </div>
      </body>
    </html>
  );
}
