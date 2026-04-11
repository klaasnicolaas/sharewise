"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useMessages } from "next-intl";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  getIntlLocale,
  hasLocale,
  type Locale,
  type Messages,
} from "@/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const runtimeLocale = useLocale();
  const messages = useMessages() as Messages;
  const resolvedLocale = hasLocale(runtimeLocale) ? runtimeLocale : DEFAULT_LOCALE;
  const [preferredLocale, setPreferredLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return resolvedLocale;
    }

    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (hasLocale(stored)) {
      return stored;
    }

    return window.navigator.language.toLowerCase().startsWith("en") ? "en" : DEFAULT_LOCALE;
  });
  const lastRefreshLocaleRef = useRef<Locale | null>(null);
  const locale = preferredLocale;

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = getIntlLocale(locale);

    if (locale !== resolvedLocale && lastRefreshLocaleRef.current !== locale) {
      lastRefreshLocaleRef.current = locale;
      router.refresh();
      return;
    }

    if (locale === resolvedLocale) {
      lastRefreshLocaleRef.current = null;
    }
  }, [locale, resolvedLocale, router]);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setPreferredLocale((current) => (current === nextLocale ? current : nextLocale));
    },
    [],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      copy: messages,
    }),
    [locale, messages, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider.");
  }
  return context;
}
