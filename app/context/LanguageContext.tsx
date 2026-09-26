import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    AsyncStorage.getItem('app_language').then((val) => {
      if (val === 'hi' || val === 'en') setLang(val);
    });
  }, []);

  function setLanguage(lang: Language) {
    setLang(lang);
    AsyncStorage.setItem('app_language', lang);
  }

  return (
    <LanguageContext.Provider value={{ language, t: translations[language], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
