'use client';

interface HeaderProps {
  theme: 'light' | 'dark';
  primaryColor: string;
  onToggleTheme: () => void;
  onColorChange: (color: string) => void;
  onMenuClick: () => void;
}

export default function Header({
  theme,
  primaryColor,
  onToggleTheme,
  onColorChange,
  onMenuClick
}: HeaderProps) {
  return (
    <header className="h-16 flex items-center px-4 md:px-8 border-b border-gray-100 dark:border-gray-800 justify-between bg-white dark:bg-gray-900 z-10 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-2xl text-gray-500 dark:text-gray-400 focus:outline-none"
        >
          ☰
        </button>
        <div className="flex items-center gap-2">
          <svg
            className="w-8 h-8 text-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <h1 className="text-xl font-bold text-primary tracking-tight">Couplii</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" title="Změnit hlavní barvu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
            />
          </svg>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <button
          onClick={onToggleTheme}
          className="text-xl hover:scale-110 transition-transform focus:outline-none"
          title="Přepnout tmavý/světlý režim"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
