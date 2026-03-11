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
        # 3. Volání modelu GPT-4.1-mini
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "Jsi 'Couplii', empatický expert na párovou komunikaci. Využíváš principy Nenásilné komunikace (NVC). Uživatel ti napíše zprávu pro partnera. Zhodnoť ji a jemně navrhni lepší formulaci podle NVC. Odpovídej česky, stručně a přátelsky.",
                },
                {
                    "role": "user",
                    "content": user_input.message,
                }
            ],
            temperature=0.7, # Změnil jsem z 1 na 0.7, aby byly rady trochu konzistentnější a ne tak "divoké"
            top_p=1,
            model=model_name
        )
        
        # Extrakce textu z odpovědi
        ai_reply = response.choices[0].message.content
        return {"reply": ai_reply}
        
    except Exception as e:
        return {"reply": f"Chyba při komunikaci s GitHub Models: {str(e)}"}

@app.get("/")
async def root():
    return {"status": "Couplii AI Backend s GPT-4.1-mini běží!"}