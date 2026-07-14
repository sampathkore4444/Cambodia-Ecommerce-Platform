import React, { createContext, useState, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '../utils/helpers';
import { translate } from '../utils/khmer';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLangState] = useState(() => getStorageItem('language') || 'km');

  const setLanguage = useCallback((lang) => {
    setLangState(lang);
    setStorageItem('language', lang);
  }, []);

  const t = useCallback((key) => translate(key, language), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
