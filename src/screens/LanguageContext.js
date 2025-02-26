import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        const fetchLanguage = async () => {
            const storedLanguage = await AsyncStorage.getItem('language');
            if (storedLanguage) {
                setLanguage(storedLanguage);
            }
        };
        fetchLanguage();
    }, []);

    const toggleLanguage = async () => {
        const newLang = language === 'en' ? 'hi' : 'en';
        setLanguage(newLang);
        await AsyncStorage.setItem('language', newLang);
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
