// --- PROPOJENÍ S HTML ELEMENTY ---
const onboardingForm = document.getElementById('onboarding-form');
const onboardingScreen = document.getElementById('onboarding-screen');
const chatScreen = document.getElementById('chat-screen');

const chatForm = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const chatContainer = document.getElementById('chat-container');
const sendBtn = document.getElementById('send-btn');

// --- TVOJE ADRESA NA RENDERU ---
const backendUrl = "https://ctuthesis-dip-implementace.onrender.com"; // <--- ZKONTROLUJ SI ADRESU

let chatHistory = [];

// --- LOGIKA DOTAZNÍKU (ONBOARDING) ---
onboardingForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // 1. Přečtení odpovědí od uživatele
    const name = document.getElementById('user-name').value.trim();
    const status = document.getElementById('user-status').value;
    const problem = document.getElementById('user-problem').value.trim();
    const tone = document.getElementById('user-tone').value;

    // 2. Skrytí dotazníku a zobrazení chatu
    onboardingScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    
    // 3. Vytvoření "tajného" prvního promptu pro AI
    const systemPrompt = `Ahoj, jmenuji se ${name}. Má aktuální situace: ${status}. Můj hlavní problém, se kterým dnes potřebuji pomoci: ${problem}. V naší konverzaci mi prosím od teď ${tone}. Přivítej mě jménem a navrhni mi, jak můžeme tento konkrétní problém začít řešit.`;

    // Uložíme tento skrytý prompt do paměti jako první zprávu od uživatele
    chatHistory.push({ role: "user", content: systemPrompt });

    // Uživateli v chatu pro hezký dojem ukážeme jen shrnutí jeho problému (ne ten dlouhý robotický prompt)
    appendMessage(`Ahoj Couplii! Jmenuji se ${name} a trápí mě toto: ${problem}`, 'user');

    // 4. Rovnou odešleme dotaz na AI (uživatel vidí načítání)
    const loadingId = appendLoading();
    await fetchAIResponse(loadingId);
});

// --- LOGIKA BĚŽNÉHO CHATU ---
chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    chatHistory.push({ role: "user", content: message });
    
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    const loadingId = appendLoading();
    await fetchAIResponse(loadingId);
});

// --- FUNKCE PRO KOMUNIKACI S PYTHON BACKENDEM ---
async function fetchAIResponse(loadingId) {
    try {
        const response = await fetch(`${backendUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: chatHistory }) 
        });

        if (!response.ok) throw new Error("Chyba serveru");

        const data = await response.json();

        document.getElementById(loadingId).remove();
        appendMessage(data.reply, 'ai');
        chatHistory.push({ role: "assistant", content: data.reply });

    } catch (error) {
        document.getElementById(loadingId).remove();
        appendMessage("Jejda, spojení selhalo. Zkontroluj, jestli se backend neuspokojil.", 'ai');
        chatHistory.pop(); 
    }
}

// --- POMOCNÉ FUNKCE PRO UI (Automatická velikost pole, Enter, Vykreslování) ---
input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    sendBtn.disabled = this.value.trim() === '';
});

input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (this.value.trim() !== '') chatForm.dispatchEvent(new Event('submit'));
    }
});

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = 'flex gap-4 max-w-3xl mx-auto w-full';
    
    if (sender === 'user') {
        div.innerHTML = `
            <div class="bg-gray-100 rounded-2xl rounded-tr-sm px-5 py-3 text-gray-800 break-words w-fit max-w-[85%]">
                ${escapeHTML(text)}
            </div>
        `;
        div.classList.add('flex-row-reverse');
    } else {
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs">✨</div>
            <div class="text-gray-800 leading-relaxed max-w-[85%]">
                <p>${escapeHTML(text).replace(/\n/g, '<br>')}</p>
            </div>
        `;
    }
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendLoading() {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'flex gap-4 max-w-3xl mx-auto w-full';
    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs animate-pulse">✨</div>
        <div class="flex items-center space-x-1.5 bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-sm w-fit">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
        </div>
    `;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}