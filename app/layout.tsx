import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://drapit.io"),
  title: "Drapit — Virtual Try-On for Fashion E-commerce",
  description:
    "Drapit helps clothing webshops increase conversions with AI-powered virtual try-on technology.",
  openGraph: {
    title: "Drapit — Virtual Try-On for Fashion E-commerce",
    description: "Drapit helps clothing webshops increase conversions with AI-powered virtual try-on technology.",
    url: "https://drapit.io",
    siteName: "Drapit",
    images: [
      {
        url: "/images/VTON%20process.png",
        width: 1200,
        height: 630,
        alt: "Drapit Virtual Try-On Preview",
      },
    ],
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drapit — Virtual Try-On for Fashion E-commerce",
    description: "Drapit helps clothing webshops increase conversions with AI-powered virtual try-on technology.",
    images: ["/images/VTON%20process.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
