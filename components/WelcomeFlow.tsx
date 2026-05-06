'use client';

import { useState } from 'react';

// --- NOVÁ KOMPONENTA: Seznam psychologů ---
const PsychologistsScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col h-full animate-fade-in">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      Naši odborníci
    </h2>
    
    <div className="space-y-6 overflow-y-auto pr-2 flex-1 chat-scroll">
      {/* Psycholog 1 */}
      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden border-2 border-primary/20">
          {/* Tady pak nahradíš src za reálnou fotku */}
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Davidd" 
            alt="David Otrhal"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">David Otrhal</h3>
          <p className="text-xs text-primary font-medium uppercase tracking-tight mb-1">Psycholog</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-500">Zaměření:</span> Vztahové poradenství
          </p>
        </div>
      </div>

      {/* Psycholog 2 */}
      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden border-2 border-primary/20">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Petr" 
            alt="Petr Holý"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Petr Holý</h3>
          <p className="text-xs text-primary font-medium uppercase tracking-tight mb-1">Psycholog</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-500">Zaměření:</span> Krizové poradenství
          </p>
        </div>
      </div>
      {/* Psycholog 3 */}
      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden border-2 border-primary/20">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jana" 
            alt="Jana Nováková"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Jana Nováková</h3>
          <p className="text-xs text-primary font-medium uppercase tracking-tight mb-1">Psycholog</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-500">Zaměření:</span> Krizové poradenství
          </p>
        </div>
      </div>
    </div>

    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
      <button
        onClick={onBack}
        className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        Zpět
      </button>
    </div>
  </div>
);

// --- KOMPONENTA 1: Úvodní obrazovka ---
const WelcomeScreen1 = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
    <div className="text-6xl animate-[bounce_5s_infinite]">❤️‍🔥</div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vítejte v aplikaci!</h1>
    <h2 className="text-5xl font-extrabold text-primary tracking-tight">Couplii</h2>
    <div className="pt-8 w-full">
      <button onClick={onNext} className="w-full py-3 px-6 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg">Pokračovat</button>
    </div>
  </div>
);

// --- KOMPONENTA 2: Co očekávat 1 ---
const WelcomeScreen2 = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col h-full animate-fade-in">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Co od aplikace očekávat?</h2>
    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 font-medium">Aplikace umí pomoci:</p>
    <ul className="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
      <li className="flex items-center gap-3"><span className="text-primary text-xl">•</span> S řešením problémů ve vztahu.</li>
      <li className="flex items-center gap-3"><span className="text-primary text-xl">•</span> S nalezením partnera.</li>
      <li className="flex items-center gap-3"><span className="text-primary text-xl">•</span> Se zlepšením psychického zdraví.</li>
    </ul>
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-8">
      <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">Toto není seznamovací aplikace, ale vztahový pomocník do kapsy, který vám poradí a pomůže vyřešit Vaše problémy.</p>
    </div>
    <div className="mt-auto"><button onClick={onNext} className="w-full py-3 px-6 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg">Rozumím</button></div>
  </div>
);

// --- KOMPONENTA 3: Co očekávat 2 ---
const WelcomeScreen3 = ({ onNext, onShowPsychologists }: { onNext: () => void, onShowPsychologists: () => void }) => (
  <div className="flex flex-col h-full animate-fade-in">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Co od aplikace očekávat?</h2>
    <div className="space-y-4 flex-1">
      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          Za aplikací stojí zkušený team psychologů zabývající se vztahovými problémy.
        </p>
        <button 
          onClick={onShowPsychologists}
          className="w-full py-2.5 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-primary font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-sm shadow-sm"
        >
          Seznam psychologů
        </button>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl flex items-start gap-4 border border-gray-100 dark:border-gray-700">
        <div className="text-2xl">🤖</div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
          Pro komunikaci na míru je využívána umělá inteligence.
        </p>
      </div>
    </div>
    <div className="mt-auto pt-4"><button onClick={onNext} className="w-full py-3 px-6 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg">Pokračovat</button></div>
  </div>
);

// --- KOMPONENTA 4: Výzva k dotazníku ---
const WelcomeScreen4 = ({ onComplete }: { onComplete: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
    <div className="text-6xl">👍</div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Pro začátek Vás poprosíme vyplnit krátký dotazník pro vytvoření obsahu na míru!</h2>
    <div className="pt-4 w-full"><button onClick={onComplete} className="w-full py-4 px-6 bg-primary text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg">Vyplnit dotazník</button></div>
  </div>
);

// --- HLAVNÍ MANAŽER ---
interface WelcomeFlowProps { onFinishWelcome: () => void; }

export default function WelcomeFlow({ onFinishWelcome }: WelcomeFlowProps) {
  const [step, setStep] = useState(1);
  const [showPsychologists, setShowPsychologists] = useState(false); // Stav pro zobrazení seznamu

  if (showPsychologists) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-950 w-full max-w-md h-[550px] rounded-3xl shadow-2xl p-8 relative overflow-hidden flex flex-col">
          <PsychologistsScreen onBack={() => setShowPsychologists(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-950 w-full max-w-md h-[550px] rounded-3xl shadow-2xl p-8 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <div className="flex-1 mt-4">
          {step === 1 && <WelcomeScreen1 onNext={() => setStep(2)} />}
          {step === 2 && <WelcomeScreen2 onNext={() => setStep(3)} />}
          {step === 3 && <WelcomeScreen3 onNext={() => setStep(4)} onShowPsychologists={() => setShowPsychologists(true)} />}
          {step === 4 && <WelcomeScreen4 onComplete={onFinishWelcome} />}
        </div>
      </div>
    </div>
  );
}