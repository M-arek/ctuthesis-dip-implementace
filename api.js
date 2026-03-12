// --- ZDE MÁŠ PŘIPRAVENÉ OBĚ ADRESY ---

// 1. PRODUKCE (Render - pro veřejnost. Pomalý start, ale funguje všem)
//const backendUrl = "https://ctuthesis-dip-implementace.onrender.com";

// 2. VÝVOJ (Tvůj lokální Codespace / Localhost - jen pro tebe. Bleskový start)
const backendUrl = "https://automatic-giggle-x5979575546p2p694-8000.app.github.dev/";

export async function fetchAIResponse(history) {
    const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history }) 
    });

    if (!response.ok) throw new Error("Chyba serveru");
    return await response.json();
}