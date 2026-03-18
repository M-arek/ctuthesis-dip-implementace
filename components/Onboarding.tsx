'use client';

import { useState, FormEvent } from 'react';
import { UserProfile } from '@/lib/types';

interface OnboardingProps {
  onComplete: (profile: UserProfile, problem: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('jsem ve vztahu');
  const [problem, setProblem] = useState('');
  const [tone, setTone] = useState('tykej mi');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = { name: name.trim(), status, tone };
    onComplete(profile, problem.trim());
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 w-full h-full bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-4">
          <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-primary text-center">Vítej v Couplii</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center text-sm">
          Abychom ti mohli co nejlépe pomoci, prozraď nám o sobě pár detailů.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jak ti můžeme říkat?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="Tvé jméno"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jaká je tvá situace?
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="jsem ve vztahu">Jsem ve vztahu a chci ho zlepšit</option>
              <option value="jsem single a hledám vztah">Jsem single a mám strach ze seznamování</option>
              <option value="procházím těžkým rozchodem">Procházím rozchodem</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              S čím ti dnes Couplii pomůže?
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
              rows={2}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none transition"
              placeholder="Např.: Hádáme se kvůli úklidu..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jak si přeješ, aby s tebou AI mluvila?
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="tykej mi">Tykej mi (Přátelský tón)</option>
              <option value="vykejte mi">Vykejte mi (Profesionální tón)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] mt-4"
          >
            Začít konverzaci ✨
          </button>
        </form>
      </div>
    </div>
  );
}
