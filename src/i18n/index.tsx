import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, femaleTranslations, LANGUAGES, RTL_LANGUAGES, LANGUAGE_NAMES, type Language } from './translations';

const LANGUAGE_STORAGE_KEY = 'score-tracker-language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['en'];
  isRTL: boolean;
  availableLanguages: typeof LANGUAGES;
  languageNames: typeof LANGUAGE_NAMES;
  getGenderedT: (gender: 'male' | 'female') => (typeof translations)['en'];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
  if (stored && (LANGUAGES as readonly string[]).includes(stored)) return stored;
  const browserLang = navigator.language.split('-')[0] as Language;
  if ((LANGUAGES as readonly string[]).includes(browserLang)) return browserLang;
  return 'en';
}

// Apply dir attribute immediately on module load to avoid a flash of wrong layout on reload.
(function applyInitialDir() {
  const lang = detectLanguage();
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
})();

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  const isRTL = RTL_LANGUAGES.has(language);
  const t = translations[language];

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }

  function getGenderedT(gender: 'male' | 'female'): (typeof translations)['en'] {
    if (gender === 'female') {
      const overrides = femaleTranslations[language];
      if (overrides) return { ...t, ...overrides };
    }
    return t;
  }

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, availableLanguages: LANGUAGES, languageNames: LANGUAGE_NAMES, getGenderedT }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
