'use client';

import { useState } from 'react';

// --- KOMPONENTA 1: Úvodní obrazovka ---
const WelcomeScreen1 = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
    <div className="text-6xl animate-[bounce_5s_infinite]">❤️‍🔥</div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
      Vítejte v aplikaci!
    </h1>
    <h2 className="text-5xl font-extrabold text-primary tracking-tight">
      Couplii
    </h2>
    <div className="pt-8 w-full">
      <button
        onClick={onNext}
        className="w-full py-3 px-6 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg"
      >
        Pokračovat
      </button>
    </div>
  </div>
);

// --- KOMPONENTA 2: Co očekávat 1 ---
const WelcomeScreen2 = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col h-full animate-fade-in">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      Co od aplikace očekávat?
    </h2>
    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 font-medium">
      Aplikace umí pomoci:
    </p>
    <ul className="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
      <li className="flex items-center gap-3">
        <span className="text-primary text-xl">•</span> S řešením problémů ve vztahu.
      </li>
      <li className="flex items-center gap-3">
        <span className="text-primary text-xl">•</span> S nalezením partnera.
      </li>
      <li className="flex items-center gap-3">
        <span className="text-primary text-xl">•</span> Se zlepšením psychického zdraví.
      </li>
    </ul>
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-8">
      <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
        Toto není seznamovací aplikace, ale vztahový pomocník do kapsy, který vám poradí a pomůže vyřešit Vaše problémy.
      </p>
    </div>
    <div className="mt-auto pt-4">
      <button
        onClick={onNext}
        className="w-full py-3 px-6 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg"
      >
        Rozumím
      </button>
    </div>
  </div>
);

// --- KOMPONENTA 3: Co očekávat 2 ---
const WelcomeScreen3 = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col h-full animate-fade-in">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      Co od aplikace očekávat?
    </h2>
    
    <div className="space-y-6 flex-1">
      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl">
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          Za aplikací stojí zkušený team psychologů zabývající se vztahovými problémy.
        </p>
        <button 
          onClick={() => alert('Zde se v budoucnu otevře seznam psychologů.')}
          className="text-primary font-semibold hover:underline text-sm"
        >
          Poznejte je kliknutím na "Seznam psychologů" &rarr;
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl flex items-start gap-4">
        <div className="text-2xl">🤖</div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Pro komunikaci na míru je využívána umělá inteligence.
        </p>
      </div>
    </div>

    <div className="mt-auto pt-4">
      <button
        onClick={onNext}
        className="w-full py-3 px-6 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg"
      >
        Pokračovat
      </button>
    </div>
  </div>
);

// --- KOMPONENTA 4: Výzva k dotazníku ---
const WelcomeScreen4 = ({ onComplete }: { onComplete: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
    <div className="text-6xl">👍</div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
      Pro začátek Vás poprosíme vyplnit krátký dotazník pro vytvoření obsahu na míru!
    </h2>
    <div className="pt-4 w-full">
      <button
        onClick={onComplete}
        className="w-full py-4 px-6 bg-primary text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
      >
        Vyplnit dotazník
      </button>
    </div>
  </div>
);

// --- HLAVNÍ MANAŽER (Orchestrator) ---
interface WelcomeFlowProps {
  onFinishWelcome: () => void; // Tato funkce pošle uživatele na tvůj dotazník
}

export default function WelcomeFlow({ onFinishWelcome }: WelcomeFlowProps) {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => prev + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-950 w-full max-w-md h-[550px] rounded-3xl shadow-2xl p-8 relative overflow-hidden flex flex-col">
        
        {/* Ukazatel průběhu (Progress bar) nahoře */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Zobrazení aktuální komponenty */}
        <div className="flex-1 mt-4">
          {step === 1 && <WelcomeScreen1 onNext={nextStep} />}
          {step === 2 && <WelcomeScreen2 onNext={nextStep} />}
          {step === 3 && <WelcomeScreen3 onNext={nextStep} />}
          {step === 4 && <WelcomeScreen4 onComplete={onFinishWelcome} />}
        </div>

      </div>
    </div>
  );
}