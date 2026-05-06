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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
      
      <div className="bg-white dark:bg-gray-950 w-full max-w-md max-h-[90vh] md:h-[560px] rounded-3xl shadow-2xl p-6 md:p-8 relative flex flex-col overflow-hidden animate-fade-in">
        
        {/* ZMĚNA: Zmenšeno mb-6 na mb-4 a mt-2 na mt-1 pro úsporu místa */}
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Úvodní dotazník
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Vyplňte údaje pro vytvoření obsahu na míru.
          </p>
        </div>

        {/* ZMĚNA: Přidáno px-1 (místo na rámeček) a zmenšeno pb na pb-2 */}
        <div className="w-full overflow-y-auto chat-scroll px-1 flex-1 pb-2">
          {/* ZMĚNA: Mezera mezi políčky zmenšena ze space-y-5 na space-y-3 */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jak ti můžeme říkat? <span className="text-gray-400 font-normal">(volitelné)</span>
              </label>
              {/* ZMĚNA: Vnitřní okraj inputu z p-3 na p-2.5, mírně upravený focus ring */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
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
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="jsem ve vztahu">Jsem ve vztahu a chci ho zlepšit</option>
                <option value="jsem single a hledám vztah">Jsem single a mám strach ze seznamování</option>
                <option value="procházím těžkým rozchodem">Procházím rozchodem</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                S čím ti dnes Couplii pomůže? <span className="text-gray-400 font-normal">(volitelné)</span>
              </label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={2}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition"
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
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
    </div>
  );
}