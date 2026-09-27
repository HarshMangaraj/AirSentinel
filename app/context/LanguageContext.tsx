import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Language, Translations, translations } from '../i18n/translations';

type LanguageContextType = {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  t: translations.en,
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>('en');

  useEffect(() => {
    SecureStore.getItemAsync('app_language').then((val) => {
      if (val === 'hi' || val === 'en') setLang(val as Language);
    });
  }, []);

  function setLanguage(lang: Language) {
    setLang(lang);
    SecureStore.setItemAsync('app_language', lang);
  }

  return (
    <LanguageContext.Provider value={{ language, t: translations[language], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
