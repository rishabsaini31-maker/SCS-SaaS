import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import { NotificationProvider } from "@/lib/NotificationContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WholesalePro Dashboard",
  description: "Modern Wholesale ERP Suite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body-md text-on-surface bg-[#F8FAFC]">
        <ReactQueryProvider>
          <NotificationProvider>
            <Sidebar />
            <Topbar />
            <main className="ml-[240px] mt-[64px] p-8 min-h-screen">
              {children}
            </main>
          </NotificationProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
