# Couplii — vztahový asistent

Krátké představení projektu a jeho současného stavu.

## Přehled

Couplii je frontendová aplikace (Next.js + TypeScript) sloužící jako rozhraní pro empatického vztahového asistenta. Komunikace s AI probíhá přes samostatný Python backend (FastAPI). Frontend využívá Firebase pro anonymní přihlášení a perzistenci profilů a konverzací.

## Použité technologie (hlavní)

- Next.js ^16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4 (+ @tailwindcss/typography)
- Firebase (auth + Firestore)
- react-markdown — vykreslování markdown odpovědí
 - FastAPI (Python) — jednoduchý FastAPI backend (součást `main.py`)

Konkrétní závislosti a skripty najdeš v [package.json](package.json).

## Struktura (vybrané soubory)

```
main.py                 # FastAPI backend (API endpoints v `main.py`)
app/
	├─ layout.tsx
	├─ page.tsx
	└─ globals.css          # globální styly + CSS proměnné (--primary-color)
components/
	├─ Chat.tsx             # Hlavní chat UI
	├─ ChatInput.tsx        # Textarea + hlasové diktování
	├─ ChatMessage.tsx      # Vykreslení zpráv (react-markdown)
	├─ LoadingMessage.tsx   # Indikátor načítání odpovědí AI (animované tečky, bere primární barvu)
	├─ Header.tsx           # Logo, ovládání tématu a barvy
	├─ Sidebar.tsx          # Seznam konverzací + feedback
	├─ Onboarding.tsx       # Úvodní dotazník
	└─ WelcomeFlow.tsx      # Úvodní průvodce / progress
hooks/
	├─ useAppState.ts       # Správa stavu aplikace + Firebase sync
	└─ useTheme.ts          # Téma + nastavení `--primary-color`
lib/
	├─ api.ts               # Volání na backend (NEXT_PUBLIC_BACKEND_URL)
	├─ firebase.ts          # Inicializace Firebase (env proměnné)
	├─ firebaseHelpers.ts   # CRUD pro profily a konverzace (Firestore)
	├─ storage.ts           # localStorage pro barvu a režim
	└─ types.ts             # Typy (UserProfile, Message, Conversation)
public/
	├─ manifest.json
	└─ pics/
```

## Rychlé spuštění (lokálně)

1. Nainstaluj závislosti a spusť vývojový server:

```bash
npm install
npm run dev
```

3. Backend (volitelně pro lokální vývoj):

```bash
# backend je oddělený FastAPI servis; v jeho repozitáři spusť např.:
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

4. Otevři aplikaci v prohlížeči: http://localhost:3000

## Konfigurace prostředí

Frontend očekává tyto environment proměnné (vytvoř `.env.local`):

- `NEXT_PUBLIC_BACKEND_URL` — URL Python backendu (výchozí: https://ctuthesis-dip-implementace.onrender.com)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Bez správné Firebase konfigurace nebude fungovat perzistence (Firestore) a anonymní přihlášení.

## Důležité poznámky k implementaci

- Markdown odpovědi AI se vykreslují v [components/ChatMessage.tsx](components/ChatMessage.tsx#L80-L110) pomocí `react-markdown`.
- Primární barva je uložena jako CSS proměnná `--primary-color` a nastavuje se z hooku [hooks/useTheme.ts](hooks/useTheme.ts#L1-L80).
- Volání backendu probíhá přes [lib/api.ts](lib/api.ts#L1-L40) a lze URL přepsat pomocí `NEXT_PUBLIC_BACKEND_URL`.
- Uživatelská data (profil, seznam konverzací) jsou ukládána do Firestore skrze [lib/firebaseHelpers.ts](lib/firebaseHelpers.ts#L1-L200).
 
## Backend — main.py

V kořenovém adresáři projektu je `main.py` — jednoduchý FastAPI backend, který poskytuje HTTP API pro chat a řadu utilitních endpointů. Hlavní body:

- Načítání proměnných prostředí přes `dotenv`; backend očekává proměnnou `GITHUB_TOKEN` (používá se k autentizaci vůči modelům hostovaným přes GitHub).
- `POST /api/chat`: přijímá JSON ve tvaru `{ history: [{ role, content }, ...] }`, provádí jednoduchý bezpečnostní filtr (detekce krizových výrazů — v takovém případě vrátí kontakty na krizové linky), doplní systémové instrukce a přepošle požadavek na model (konfigurovaný s `base_url` na `https://models.github.ai/inference` a modelem `openai/gpt-4.1-mini`). Odpověď modelu je vrácena v poli `reply`.
- `GET /api/github-limit`: kontroluje GitHub rate limits pomocí stejného tokenu.
- `GET /`: health-check, vrací `{ "status": "Backend běží!" }`.
- Pro lokální vývoj spusť: `uvicorn main:app --reload --port 8000`.

Poznámka: `main.py` obsahuje také jednoduché logování chyb a základní ošetření politik modelu (vrací uživateli srozumitelnou zprávu při porušení bezpečnostních pravidel). Ujisti se, že `GITHUB_TOKEN` je bezpečně nastaven v prostředí nebo v `.env`.

## Hlavní funkce

- Onboarding (úvodní dotazník) a personalizace chatu
- Tmavý režim (class-based `.dark` řízený z `useTheme`)
- Nastavitelná primární barva (UI color picker v hlavičce)
- Markdown v odpovědích AI (react-markdown)
- Hlasové zadávání zpráv (Web Speech API, pokud prohlížeč podporuje)
- Synchronizace konverzací a profilu přes Firebase Firestore
- Progress indikátory v UI (v hlavičce, v seznamu konverzací, welcome flow)

## Troubleshooting

- Pokud narazíš na chybu při instalaci související s optional native dependencies (např. z `@tailwindcss/oxide`), zkus rychlé očištění:

```bash
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

- Pro stabilnější závislosti v týmu zvaž `pnpm` nebo `yarn`.

## Kde upravit často hledané věci

- Primární barva: [hooks/useTheme.ts](hooks/useTheme.ts#L1-L80) (nastavuje CSS proměnnou `--primary-color`).
- Markdown: [components/ChatMessage.tsx](components/ChatMessage.tsx#L80-L110) (react-markdown kontejner s `prose` třídou).
- Backend endpoint: [lib/api.ts](lib/api.ts#L1-L30).

## Licence

MIT
