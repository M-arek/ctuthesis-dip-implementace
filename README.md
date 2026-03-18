# Couplii AI Chat - Next.js

Empatický vztahový asistent postavený na Next.js a React.

## 🚀 Technologie

- **Next.js 15** - React framework s App Router
- **TypeScript** - Typová bezpečnost
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Pro správu stavu a vedlejších efektů
- **Marked** - Markdown parser pro AI odpovědi
- **FastAPI Backend** - Python backend s OpenAI API

## 📁 Struktura projektu

```
├── app/
│   ├── layout.tsx          # Root layout s metadaty
│   ├── page.tsx            # Hlavní stránka
│   └── globals.css         # Globální styly
├── components/
│   ├── Chat.tsx            # Hlavní chat komponenta
│   ├── ChatInput.tsx       # Input s hlasovým vstupem
│   ├── ChatMessage.tsx     # Zobrazení zpráv
│   ├── Header.tsx          # Hlavička s nastavením
│   ├── LoadingMessage.tsx  # Loading indikátor
│   ├── Onboarding.tsx      # Onboarding formulář
│   └── Sidebar.tsx         # Boční panel s konverzacemi
├── hooks/
│   ├── useAppState.ts      # Hook pro správu stavu aplikace
│   └── useTheme.ts         # Hook pro správu tématu
├── lib/
│   ├── api.ts              # API volání
│   ├── storage.ts          # LocalStorage utility
│   └── types.ts            # TypeScript typy
└── backup_old_app/         # Původní vanilla JS aplikace
```

## 🛠️ Instalace a spuštění

1. Naklonujte repozitář:
```bash
git clone <repository-url>
cd ctuthesis-dip-implementace
```

2. Nainstalujte závislosti:
```bash
npm install
```

3. Vytvořte `.env.local` soubor:
```bash
cp .env.example .env.local
```

4. Spusťte vývojový server:
```bash
npm run dev
```

5. Otevřete [http://localhost:3000](http://localhost:3000)

## 🏗️ Build a produkce

```bash
# Build
npm run build

# Spuštění produkční verze
npm start
```

## ✨ Funkce

- ✅ **Onboarding** - Personalizované uvítání
- ✅ **Tmavý režim** - Automatické přepínání
- ✅ **Vlastní barvy** - Změna primární barvy
- ✅ **Historie chatu** - Ukládání do LocalStorage
- ✅ **Hlasový vstup** - Web Speech API
- ✅ **Markdown** - Formátování AI odpovědí
- ✅ **Mobilní optimalizace** - Responzivní design
- ✅ **Swipe gesta** - Pro mobilní menu

## 🔧 Backend

Python backend běží na Render.com nebo lokálně:

```bash
# Instalace závislostí
pip install -r requirements.txt

# Spuštění
uvicorn main:app --reload --port 8000
```

Backend URL můžete změnit v `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 📝 Poznámky ke konverzi

Tato aplikace byla převedena z vanilla JavaScript na Next.js s následujícími změnami:

1. **Modularizace** - Rozdělení do React komponent
2. **TypeScript** - Přidání typové bezpečnosti
3. **State management** - Custom hooks místo globálního stavu
4. **Server-side rendering** - Next.js App Router
5. **Optimalizace** - Automatický code splitting a optimalizace

Původní aplikace je zachována v `backup_old_app/` složce.

## 📄 License

MIT
