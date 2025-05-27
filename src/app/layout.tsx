
import type { Metadata } from 'next';
// Import the Geist font objects. These are not functions to be called,
// but rather objects with properties like .variable and .className.
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'پاچه Pache',
  description: 'یک برنامه ساده برای محاسبه هزینه‌های اشتراکی (دُنگ) در گروه‌های مختلف.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      {/*
        Use GeistSans.variable and GeistMono.variable to apply the font CSS variables.
        The font-sans class in globals.css will then pick up --font-geist-sans.
      */}
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
