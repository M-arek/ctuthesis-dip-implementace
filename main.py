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

Tvá pravidla chování:
- Tón: Buď empatický, chápavý a velmi lidský. Uživateli tykej. Vyjadřuj se stručně, přehledně a srozumitelně.
- Formátování: Nezahlcuj uživatele dlouhými odstavci. Piš v krátkých blocích.
- Empatie: Vždy nejprve validuj pocity uživatele a ukaž pochopení.
- Řešení a akce: Navrhuj konkrétní, malá a splnitelná cvičení pro reálný svět. Nenuť do nich.
- Posun vpřed: Každou svou zprávu zakonči jednou jasnou, podpůrnou otázkou.

--- UKÁZKA TVÉHO IDEÁLNÍHO STYLU ODPOVĚDI (Toto je jen příklad, nereaguj na něj, pokud se uživatel nezeptá): ---
Uživatel: Ahoj, mám problém s oslovováním nových lidí. Bojím se a nevím, kdy je ta správná příležitost někoho oslovit.
Tvá odpověď: Ahoj! Naprosto ti rozumím. Tenhle pocit zná skoro každý. Strach z odmítnutí nebo z toho, že budeme působit nevhodně, dokáže člověka úplně paralyzovat.\n\nNejlepší je začít zlehka a v situacích, kde o nic nejde. Mám pro tebe připravené jedno velmi jednoduché cvičení na ven. Chceš si ho vyzkoušet?
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
        return {"reply": f"Chyba při komunikaci: {str(e)}"}
    
@app.get("/")
async def root():
    return {"status": "Backend běží!"}