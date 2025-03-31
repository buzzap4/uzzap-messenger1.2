import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

type Language = 'en' | 'fil' | 'ceb';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    storage.getItem<Language>('userLanguage').then((savedLang) => {
      if (savedLang && ['en', 'fil', 'ceb'].includes(savedLang)) {
        setLanguage(savedLang);
      }
    });
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    storage.setItem('userLanguage', newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
