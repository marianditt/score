import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translations, LANGUAGES, type Language, type TranslationKey } from './translations';

const STORAGE_KEY = 'score-tracker-language';

function detectLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && stored in translations) return stored;
  const browser = navigator.language.split('-')[0] as Language;
  if (browser in translations) return browser;
  return 'en';
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: key => translations['en'][key],
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const isRTL = Boolean(LANGUAGES[language].rtl);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] ?? translations['en'][key],
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(LanguageContext);
}
