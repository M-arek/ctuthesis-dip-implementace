'use client';

import { useState, useEffect } from 'react';
import { loadTheme, saveTheme, loadColor, saveColor } from '@/lib/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColorState] = useState('#9e0000');

  useEffect(() => {
    const savedTheme = loadTheme();
    const savedColor = loadColor();

    setThemeState(savedTheme);
    setPrimaryColorState(savedColor);

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    applyColors(savedColor);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    saveTheme(newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    saveColor(color);
    applyColors(color);
  };

  const applyColors = (hex: string) => {
    document.documentElement.style.setProperty('--primary-color', hex);
    document.documentElement.style.setProperty('--secondary-color', hex + '26');
  };

  return {
    theme,
    primaryColor,
    toggleTheme,
    setPrimaryColor
  };
}
