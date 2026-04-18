import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, LANGUAGES, RTL_LANGUAGES, LANGUAGE_NAMES, GENDERED_LANGUAGES, femaleTranslations, type Language, type Gender } from './translations';

const LANGUAGE_STORAGE_KEY = 'score-tracker-language';
const GENDER_STORAGE_KEY = 'score-tracker-gender';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['en'];
  isRTL: boolean;
  availableLanguages: typeof LANGUAGES;
  languageNames: typeof LANGUAGE_NAMES;
  gender: Gender;
  setGender: (g: Gender) => void;
  isGendered: boolean;
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
  const [gender, setGenderState] = useState<Gender>(() => {
    return (localStorage.getItem(GENDER_STORAGE_KEY) as Gender | null) ?? 'male';
  });

  const isRTL = RTL_LANGUAGES.has(language);
  const isGendered = GENDERED_LANGUAGES.has(language);

  const baseTrans = translations[language];
  const femaleTrans = (gender === 'female' && isGendered) ? femaleTranslations[language] : undefined;
  const t = femaleTrans ? { ...baseTrans, ...femaleTrans } : baseTrans;

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }

  function setGender(g: Gender) {
    setGenderState(g);
    localStorage.setItem(GENDER_STORAGE_KEY, g);
  }

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, availableLanguages: LANGUAGES, languageNames: LANGUAGE_NAMES, gender, setGender, isGendered }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
