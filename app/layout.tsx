import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { I18nProvider } from "@/components/i18n-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getIntlLocale, hasLocale } from "@/lib/i18n";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Sharewise",
  description: "Transparent shared expense splitting for group stays and shared projects.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const htmlLang = getIntlLocale(hasLocale(locale) ? locale : "nl");

  return (
    <html
      suppressHydrationWarning
      lang={htmlLang}
      className={`h-full antialiased ${plusJakartaSans.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <I18nProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </I18nProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
