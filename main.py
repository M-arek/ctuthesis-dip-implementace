from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from openai import OpenAI

# 1. Načtení klíče z .env
load_dotenv()

# 2. Nastavení přesně podle tvého kódu z GitHub Models
token = os.environ.get("GITHUB_TOKEN")
endpoint = "https://models.github.ai/inference"
model_name = "openai/gpt-4.1-mini"

client = OpenAI(
    base_url=endpoint,
    api_key=token,
)

app = FastAPI()

# Povolení komunikace s frontendem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_with_couplii(user_input: ChatMessage):
    try:
        # --- 1. BEZPEČNOSTNÍ FILTR (Guardrails) ---
        text_zpravy = user_input.message.lower()
        krizova_slova = ["zabít", "sebevražda", "ublížit si", "nechci žít", "skončit to"]
        if any(slovo in text_zpravy for slovo in krizova_slova):
            return {"reply": "Zavolejte okamžitě na Linku první psychické pomoci: 116 123 nebo na Linku bezpečí: 116 111."}
        # ------------------------------------------

        # --- 2. BĚŽNÁ KOMUNIKACE S AI ---
        response = client.chat.completions.create(
            messages=[
                # HLAVNÍ PRAVIDLA (System)
                {
                    "role": "system",
                    "content": """Jsi Couplii, empatický, profesionální a přátelský vztahový pomocník do kapsy. Tvým cílem je pomáhat uživatelům s řešením partnerských problémů, překonáváním strachu ze seznamování a zlepšováním jejich komunikačních dovedností.

                    Tvá pravidla chování:
                    - Tón: Buď empatický, chápavý a velmi lidský. Uživateli tykej (pokud si na začátku nevybere vykání). Vyjadřuj se stručně, přehledně a srozumitelně.
                    - Formátování: Nezahlcuj uživatele dlouhými odstavci. Piš v krátkých, snadno čitelných blocích.
                    - Empatie: Vždy nejprve validuj pocity uživatele a ukaž pochopení (např. "Je naprosto normální, že z toho máš obavy...").
                    - Řešení a akce: Buď se zeptej na víc kontextu a nebo navrhuj konkrétní, malá a splnitelná cvičení pro reálný svět (např. bezpečné oslovení lidí s jednoduchou otázkou). Nenuť do nich, pokud uživatel nechce.
                    - Očekávání: Pamatuj, že nejsi seznamka, ale průvodce seberozvojem.
                    - Posun vpřed: Každou svou zprávu zakonči jednou jasnou, podpůrnou otázkou, aby konverzace přirozeně a bez tlaku pokračovala."""
                },
                # UKÁZKOVÁ ZPRÁVA OD UŽIVATELE (User)
                {
                    "role": "user",
                    "content": "Ahoj, mám problém s oslovováním nových lidí. Bojím se a nevím, kdy je ta správná příležitost někoho oslovit"
                },
                # UKÁZKOVÁ ODPOVĚĎ OD COUPLII (Assistant)
                {
                    "role": "assistant",
                    "content": "Ahoj! Naprosto ti rozumím. Tenhle pocit zná skoro každý. Strach z odmítnutí nebo z toho, že budeme působit nevhodně, dokáže člověka úplně paralyzovat.\n\nNejlepší je začít zlehka a v situacích, kde o nic nejde. Co kdybychom zkusili trénovat po malých krůčcích? Mám pro tebe připravené jedno velmi jednoduché cvičení na ven. Chceš si ho vyzkoušet?"
                },
                # REÁLNÁ ZPRÁVA Z TVÉHO WEBU (User)
                {
                    "role": "user",
                    "content": user_input.message
                }
            ],
            # TVOJE VYLADĚNÉ PARAMETRY
            model=model_name,
            max_tokens=300, # V OpenAI knihovně se to píše jako max_tokens
            temperature=0.69,
            frequency_penalty=1.0,
            presence_penalty=1.0
        )
        
        # Extrakce textu z odpovědi
        ai_reply = response.choices[0].message.content
        return {"reply": ai_reply}
        
    except Exception as e:
        return {"reply": f"Chyba při komunikaci s GitHub Models: {str(e)}"}
    

@app.get("/")
async def root():
    return {"status": "Couplii AI Backend s GPT-4.1-mini běží!"}