# Couplii — AI Relationship & Communication Assistant
**Non functional due to "As of July 30, 2026, GitHub Models has been fully retired":** [https://docs.github.com/en/github-models](https://docs.github.com/en/github-models)

*[Česká verze níže / Czech version below](#česká-verze)*

**Live Demo:** [ctuthesis-dip-implementace-m-areks-projects.vercel.app](https://ctuthesis-dip-implementace-m-areks-projects.vercel.app)

## Overview

**Couplii** is a full-stack web application built with **Next.js** and **TypeScript** that serves as an empathetic AI mediator for relationship and couples communication. The frontend communicates with a dedicated **Python (FastAPI)** backend for LLM orchestration and safety filtering, while **Firebase** handles anonymous user authentication and cloud persistence of user profiles and conversation histories.

*(Developed as the practical implementation part of a Master's Thesis in Open Informatics / Human-Computer Interaction at CTU in Prague.)*

## Tech Stack

* **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4 (`@tailwindcss/typography`)
* **Backend:** Python, FastAPI, Uvicorn
* **AI & Inference:** GitHub Models API (`openai/gpt-4.1-mini`) with custom system prompting and crisis-detection guardrails
* **Database & Auth:** Firebase (Anonymous Authentication & Cloud Firestore)
* **Additional Libraries & APIs:** `react-markdown`, Web Speech API (voice dictation), Vercel & Render (deployment)

## Key Features

* **Guided Onboarding & Personalization:** Initial questionnaire and welcome flow tailoring the assistant's context to the user's profile.
* **Empathetic AI Chat & Guardrails:** Multi-turn conversational interface with Markdown rendering (`react-markdown`), animated typing indicators, and backend safety filtering that detects crisis expressions and provides immediate helpline contacts.
* **Voice Dictation:** Integrated speech-to-text input via the browser's Web Speech API.
* **Cloud Sync & State Management:** Real-time persistence of user profiles and conversation threads in Firestore via custom React hooks (`useAppState`).
* **Customizable UI & Accessibility:** Dark/light mode support and a live primary color picker persisted via CSS variables (`--primary-color`) and `localStorage`.

## Project Structure

```text
├── main.py                 # FastAPI backend & AI inference endpoints
├── requirements.txt        # Python backend dependencies
├── app/
│   ├── layout.tsx          # Root layout & metadata
│   ├── page.tsx            # Main application entry point
│   └── globals.css         # Global styles & CSS variables (--primary-color)
├── components/
│   ├── Chat.tsx            # Main chat container
│   ├── ChatInput.tsx       # Textarea + voice dictation controls
│   ├── ChatMessage.tsx     # Markdown message renderer
│   ├── LoadingMessage.tsx  # Animated AI response indicator
│   ├── Header.tsx          # Logo, dark mode & theme color picker
│   ├── Sidebar.tsx         # Conversation history & feedback modal
│   ├── Onboarding.tsx      # Initial user questionnaire
│   └── WelcomeFlow.tsx     # Guided onboarding & progress steps
├── hooks/
│   ├── useAppState.ts      # Application state & Firebase Firestore sync
│   └── useTheme.ts         # Dark mode & dynamic `--primary-color` logic
├── lib/
│   ├── api.ts              # Backend API client (NEXT_PUBLIC_BACKEND_URL)
│   ├── firebase.ts         # Firebase SDK initialization
│   ├── firebaseHelpers.ts  # Firestore CRUD operations
│   ├── storage.ts          # localStorage helpers for UI preferences
│   └── types.ts            # TypeScript interfaces (UserProfile, Message, Conversation)
└── public/
    ├── manifest.json       # PWA manifest
    └── pics/               # Static assets & icons
```

## Backend API (`main.py`)

The root `main.py` file implements a lightweight FastAPI service handling AI inference and safety checks:

* `POST /api/chat` — Accepts `{ history: [{ role, content }, ...] }`, runs a crisis-keyword safety check, injects system instructions, and queries `openai/gpt-4.1-mini` via `https://models.github.ai/inference`.
* `GET /api/github-limit` — Checks current API rate limits for the configured token.
* `GET /` — Health-check endpoint returning `{ "status": "Backend běží!" }`.

## Local Installation & Setup

### 1. Frontend (Next.js)
```bash
git clone [https://github.com/M-arek/ctuthesis-dip-implementace.git](https://github.com/M-arek/ctuthesis-dip-implementace.git)
cd ctuthesis-dip-implementace
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend (FastAPI — optional for local development)
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Environment Variables
Create a `.env.local` file in the root directory for the frontend:
```env
NEXT_PUBLIC_BACKEND_URL=[https://ctuthesis-dip-implementace.onrender.com](https://ctuthesis-dip-implementace.onrender.com)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
For the Python backend, set `GITHUB_TOKEN` in your `.env` file or hosting environment.

## License

MIT

---

## Česká verze

### Couplii — vztahový asistent

Krátké představení projektu a jeho současného stavu.

#### Přehled
Couplii je frontendová aplikace (Next.js + TypeScript) sloužící jako rozhraní pro empatického vztahového asistenta. Komunikace s AI probíhá přes samostatný Python backend (FastAPI). Frontend využívá Firebase pro anonymní přihlášení a perzistenci profilů a konverzací.

#### Použité technologie (hlavní)
* **Next.js ^16** (App Router)
* **React 19**
* **TypeScript 5**
* **Tailwind CSS v4** (`+ @tailwindcss/typography`)
* **Firebase** (auth + Firestore)
* **react-markdown** — vykreslování markdown odpovědí
* **FastAPI (Python)** — jednoduchý FastAPI backend (součást `main.py`)

Konkrétní závislosti a skripty najdeš v `package.json`.

#### Struktura (vybrané soubory)
```text
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

#### Rychlé spuštění (lokálně)
1. Nainstaluj závislosti a spusť vývojový server:
   ```bash
   npm install
   npm run dev
   ```
2. Backend (volitelně pro lokální vývoj):
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
3. Otevři aplikaci v prohlížeči: `http://localhost:3000`

#### Konfigurace prostředí
Frontend očekává tyto environment proměnné (vytvoř `.env.local`):
* `NEXT_PUBLIC_BACKEND_URL` — URL Python backendu (výchozí: `https://ctuthesis-dip-implementace.onrender.com`)
* `NEXT_PUBLIC_FIREBASE_API_KEY`
* `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
* `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
* `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
* `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
* `NEXT_PUBLIC_FIREBASE_APP_ID`

Bez správné Firebase konfigurace nebude fungovat perzistence (Firestore) a anonymní přihlášení.

#### Důležité poznámky k implementaci
* Markdown odpovědi AI se vykreslují v `components/ChatMessage.tsx` pomocí `react-markdown`.
* Primární barva je uložena jako CSS proměnná `--primary-color` a nastavuje se z hooku `hooks/useTheme.ts`.
* Volání backendu probíhá přes `lib/api.ts` a lze URL přepsat pomocí `NEXT_PUBLIC_BACKEND_URL`.
* Uživatelská data (profil, seznam konverzací) jsou ukládána do Firestore skrze `lib/firebaseHelpers.ts`.

#### Backend — `main.py`
V kořenovém adresáři projektu je `main.py` — jednoduchý FastAPI backend, který poskytuje HTTP API pro chat a řadu utilitních endpointů. Hlavní body:
* Načítání proměnných prostředí přes `dotenv`; backend očekává proměnnou `GITHUB_TOKEN` (používá se k autentizaci vůči modelům hostovaným přes GitHub).
* `POST /api/chat`: přijímá JSON ve tvaru `{ history: [{ role, content }, ...] }`, provádí jednoduchý bezpečnostní filtr (detekce krizových výrazů — v takovém případě vrátí kontakty na krizové linky), doplní systémové instrukce a přepošle požadavek na model (konfigurovaný s `base_url` na `https://models.github.ai/inference` a modelem `openai/gpt-4.1-mini`). Odpověď modelu je vrácena v poli `reply`.
* `GET /api/github-limit`: kontroluje GitHub rate limits pomocí stejného tokenu.
* `GET /`: health-check, vrací `{ "status": "Backend běží!" }`.
* Pro lokální vývoj spusť: `uvicorn main:app --reload --port 8000`.

*Poznámka:* `main.py` obsahuje také jednoduché logování chyb a základní ošetření politik modelu (vrací uživateli srozumitelnou zprávu při porušení bezpečnostních pravidel). Ujisti se, že `GITHUB_TOKEN` je bezpečně nastaven v prostředí nebo v `.env`.

#### Hlavní funkce
* Onboarding (úvodní dotazník) a personalizace chatu
* Tmavý režim (class-based `.dark` řízený z `useTheme`)
* Nastavitelná primární barva (UI color picker v hlavičce)
* Markdown v odpovědích AI (`react-markdown`)
* Hlasové zadávání zpráv (Web Speech API, pokud prohlížeč podporuje)
* Synchronizace konverzací a profilu přes Firebase Firestore
* Progress indikátory v UI (v hlavičce, v seznamu konverzací, welcome flow)

#### Troubleshooting
Pokud narazíš na chybu při instalaci související s optional native dependencies (např. z `@tailwindcss/oxide`), zkus rychlé očištění:
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

#### Kde upravit často hledané věci
* **Primární barva:** `hooks/useTheme.ts` (nastavuje CSS proměnnou `--primary-color`).
* **Markdown:** `components/ChatMessage.tsx` (`react-markdown` kontejner s `prose` třídou).
* **Backend endpoint:** `lib/api.ts`.

#### Licence
MIT
