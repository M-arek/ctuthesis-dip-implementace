'use client';

export const loadTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('couplii_theme') as 'light' | 'dark') || 'light';
};

export const saveTheme = (theme: 'light' | 'dark'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('couplii_theme', theme);
};

export const loadColor = (): string => {
  if (typeof window === 'undefined') return '#9e0000';
  return localStorage.getItem('couplii_color') || '#9e0000';
};

export const saveColor = (color: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('couplii_color', color);
};