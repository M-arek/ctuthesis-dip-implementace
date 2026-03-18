'use client';

import { UserProfile, Conversation } from './types';

export const loadUserProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const profile = localStorage.getItem('couplii_profile');
  return profile ? JSON.parse(profile) : null;
};

export const saveUserProfile = (profile: UserProfile | null): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('couplii_profile', JSON.stringify(profile));
};

export const loadConversations = (): Conversation[] => {
  if (typeof window === 'undefined') return [];
  const chats = localStorage.getItem('couplii_chats');
  return chats ? JSON.parse(chats) : [];
};

export const saveConversations = (conversations: Conversation[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('couplii_chats', JSON.stringify(conversations));
};

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
