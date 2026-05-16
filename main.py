import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

token = os.environ.get("GITHUB_TOKEN")
endpoint = "https://models.github.ai/inference"
model_name = "openai/gpt-4.1-mini"

client = OpenAI(
    base_url=endpoint,
    api_key=token,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. NOVÁ STRUKTURA - Přijímáme celou historii konverzace
class RoleMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    history: List[RoleMessage]

@app.post("/api/chat")
async def chat_with_couplii(request: ChatRequest):
    try:
        # --- BEZPEČNOSTNÍ FILTR (Kontrolujeme jen tu úplně poslední zprávu) ---
        posledni_zprava = request.history[-1].content.lower()
        krizova_slova = ["zabít", "sebevražda", "ublížit si", "nechci žít", "skončit to"]
        if any(slovo in posledni_zprava for slovo in krizova_slova):
            return {"reply": "Zavolejte okamžitě na Linku první psychické pomoci: 116 123 nebo na Linku bezpečí: 116 111."}
        # ----------------------------------------------------------------------

        # --- SESTAVENÍ ZPRÁV PRO AI ---
        systemove_zpravy = [
            {
                "role": "system",
                "content": """Jsi Couplii, empatický, profesionální a přátelský vztahový pomocník do kapsy. Tvým cílem je pomáhat uživatelům s řešením partnerských problémů, překonáváním strachu ze seznamování a zlepšováním jejich komunikačních dovedností.

Tvá pravidla chování a instrukce:
1. Tón a empatie: Buď empatický, chápavý a velmi lidský. Uživateli tykej. Vždy nejprve validuj pocity uživatele.
2. Oslovení: Uživatele oslov jeho jménem (v 5. pádu) POUZE ve tvé úplně první zprávě chatu. V dalších zprávách už jeho jméno nikdy neopakuj.
3. Mantinely tématu: Jsi odborník výhradně na mezilidské vztahy. Pokud začne uživatel mluvit o nesouvisejících věcech (např. auta, programování, vaření), zdvořile ho odmítni a nasměruj konverzaci zpět ke vztahům.
4. Formátování: Umíš používat Markdown, ale používej ho pouze pro zvýraznění jako tučné písmo či odrážky. Nezahlcuj uživatele dlouhými odstavci, piš v krátkých blocích.
5. Gamifikace (Progress tag): Na úplný začátek své odpovědi vždy napiš skrytý tag s odhadem, na kolik procent je TENTO KONKRÉTNÍ problém vyřešen (např. [PROGRESS: 10]). 100 % znamená pouze to, že jsme pro tento jeden konkrétní problém našli řešení nebo akční krok (nehledáme celoživotní dokonalost vztahu). Až za tímto tagem pokračuj textem.
6. Zahájení chatu: Pokud ti přijde první zpráva, kde se uživatel představuje, stručně ho přivítej, navrhni první krok k řešení problému (nebo se zeptej, co dnes proberete). 
7. Posun vpřed: Každou svou zprávu zakonči jednou jasnou, podpůrnou otázkou.
8. Dlouhodobá paměť (Memory tag): Pokud ti uživatel sdělí NOVÝ, ZÁSADNÍ fakt o svém životě (jméno partnera, délka vztahu, počet dětí, zásadní trauma, profese), přidej na začátek odpovědi (vedle Progress tagu) skrytý tag [MEMORY: fakt]. Příklad: [MEMORY: Partner se jmenuje Tomáš]. Dělej to POUZE tehdy, když se dozvíš něco nového a zásadního, neopakuj to v každé zprávě.

--- UKÁZKA TVÉHO IDEÁLNÍHO STYLU ODPOVĚDI (Toto je jen příklad, nereaguj na něj): ---
[PROGRESS: 15] [MEMORY: Uživatel má strach z odmítnutí] Ahoj Marku! Naprosto ti rozumím. Tenhle pocit zná skoro každý. Strach z odmítnutí nebo z toho, že budeme působit nevhodně, dokáže člověka úplně paralyzovat.\n\nNejlepší je začít zlehka a v situacích, kde o nic nejde. Mám pro tebe připravené jedno velmi jednoduché cvičení na ven. Chceš si ho vyzkoušet?
----------------------------------------------------------------------------------------------------------"""
            }
        ]
        # B) Připojíme reálnou historii, kterou poslal uživatelův prohlížeč
        historie_pro_ai = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        # C) Všechno to spojíme dohromady
        vsechny_zpravy = systemove_zpravy + historie_pro_ai

        response = client.chat.completions.create(
            messages=vsechny_zpravy,
            model=model_name,
            max_tokens=300,
            temperature=0.69,
            frequency_penalty=1.0,
            presence_penalty=1.0
        )
        
        return {"reply": response.choices[0].message.content}
        

    except Exception as e:
        error_msg = str(e)
        
        # --- DEBUG PRINT DO LOGŮ ---
        print("\n" + "="*50)
        print("!!! CHYBA PŘI VOLÁNÍ GITHUB/OPENAI API !!!")
        print(error_msg)
        print("="*50 + "\n")

        # Pokud chyba obsahuje zmínku o bezpečnostních filtrech GitHubu
        if "content management policy" in error_msg or "ResponsibleAIPolicyViolation" in error_msg:
            return {"reply": "Omlouvám se, ale tato zpráva narazila na naše bezpečnostní filtry (detekce násilí, sebepoškozování apod.). Pokud se nacházíte v krizové situaci a potřebujete pomoc, zavolejte prosím okamžitě na Linku první psychické pomoci: 116 123 nebo na Linku bezpečí: 116 111."}
        
        # Pro jakékoliv jiné technické chyby (např. výpadek internetu)
        return {"reply": f"Jejda, chyba při komunikaci s AI: {error_msg}"}

@app.get("/")
async def root():
    return {"status": "Backend běží!"}
