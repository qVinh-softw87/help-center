import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type LanguageCode = 'vi' | 'en';

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (viText: string, enText: string) => string;
};

const LANGUAGE_STORAGE_KEY = 'help_center_language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<LanguageCode>('vi');

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(
      LANGUAGE_STORAGE_KEY,
    ) as LanguageCode | null;

    if (storedLanguage === 'vi' || storedLanguage === 'en') {
      setLanguageState(storedLanguage);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        setLanguageState(nextLanguage);
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      },
      t: (viText, enText) => (language === 'en' ? enText : viText),
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
