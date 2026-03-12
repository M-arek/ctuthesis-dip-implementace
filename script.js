// --- HTML ELEMENTY ---
const onboardingForm = document.getElementById('onboarding-form');
const onboardingScreen = document.getElementById('onboarding-screen');
const chatScreen = document.getElementById('chat-screen');
const chatForm = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const chatContainer = document.getElementById('chat-container');
const sendBtn = document.getElementById('send-btn');
const chatList = document.getElementById('chat-list');
const newChatBtn = document.getElementById('new-chat-btn');

// --- TVOJE RENDER ADRESA ---
const backendUrl = "https://ctuthesis-dip-implementace.onrender.com"; // Zkontroluj!

// --- DATA A PAMĚŤ ---
let userProfile = null; 
let conversations = []; 
let currentChatId = null;

// 1. NAČTENÍ PŘI STARTU APLIKACE
function initApp() {
    const savedProfile = localStorage.getItem('couplii_profile');
    const savedChats = localStorage.getItem('couplii_chats');

    if (savedProfile) {
        // Uživatel už tu byl, schováme dotazník
        userProfile = JSON.parse(savedProfile);
        conversations = savedChats ? JSON.parse(savedChats) : [];
        
        onboardingScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');

        if (conversations.length > 0) {
            switchChat(conversations[0].id); // Otevře poslední chat
        } else {
            createNewChat();
        }
        renderChatList();
    } else {
        // Nový uživatel, ukážeme dotazník
        onboardingScreen.classList.remove('hidden');
        chatScreen.classList.add('hidden');
    }
}

// 2. ULOŽENÍ DO PROHLÍŽEČE
function saveData() {
    localStorage.setItem('couplii_profile', JSON.stringify(userProfile));
    localStorage.setItem('couplii_chats', JSON.stringify(conversations));
    renderChatList();
}

// 3. ODESLÁNÍ DOTAZNÍKU (ONBOARDING)
onboardingForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    userProfile = {
        name: document.getElementById('user-name').value.trim(),
        status: document.getElementById('user-status').value,
        tone: document.getElementById('user-tone').value
    };

    const problem = document.getElementById('user-problem').value.trim();

    onboardingScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    // Vytvoříme první chat a rovnou do něj pošleme problém
    const chatId = Date.now().toString();
    const systemPrompt = `Ahoj, jmenuji se ${userProfile.name}. Má aktuální situace: ${userProfile.status}. Můj hlavní problém, se kterým dnes potřebuji pomoci: ${problem}. V naší konverzaci mi prosím od teď ${userProfile.tone}. Přivítej mě a navrhni mi, jak můžeme tento problém řešit.`;

    conversations = [{
        id: chatId,
        title: problem.substring(0, 20) + "...", // Název chatu podle problému
        history: [{ role: "user", content: systemPrompt }]
    }];
    
    currentChatId = chatId;
    saveData();
    renderChatHistory();

    appendMessage(`Ahoj Couplii! Jmenuji se ${userProfile.name} a trápí mě toto: ${problem}`, 'user');
    
    const loadingId = appendLoading();
    await fetchAIResponse(loadingId);
});

// 4. VYTVOŘENÍ NOVÉHO CHATU (Bez dotazníku)
newChatBtn.addEventListener('click', () => createNewChat());

function createNewChat() {
    const chatId = Date.now().toString();
    // Tajná první zpráva, která AI nastaví kontext, aniž by se ptala na detaily
    const hiddenContext = `Ahoj, jmenuji se ${userProfile.name}. Má aktuální situace: ${userProfile.status}. V naší konverzaci mi prosím od teď ${userProfile.tone}. Napiš jen velmi stručný pozdrav a zeptej se, co dnes probereme.`;
    
    const newChat = {
        id: chatId,
        title: "Nová konverzace",
        history: [
            { role: "user", content: hiddenContext },
            { role: "assistant", content: `Ahoj ${userProfile.name}! Jsem tu pro tebe. Jakou situaci nebo zprávu dnes rozebereme?` }
        ]
    };
    
    conversations.unshift(newChat); // Přidá na začátek seznamu
    switchChat(chatId);
}

// 5. PŘEPÍNÁNÍ MEZI CHATY
function switchChat(chatId) {
    currentChatId = chatId;
    saveData();
    renderChatHistory();
}

// 6. VYKRESLENÍ LEVÉHO PANELU (Seznam chatů)
function renderChatList() {
    chatList.innerHTML = '';
    conversations.forEach(chat => {
        const div = document.createElement('div');
        // Zvýraznění aktivního chatu
        const isActive = chat.id === currentChatId ? 'bg-teal-100 font-semibold' : 'hover:bg-gray-200';
        div.className = `p-3 rounded-lg cursor-pointer text-sm truncate text-gray-700 transition ${isActive}`;
        div.textContent = chat.title;
        div.onclick = () => switchChat(chat.id);
        chatList.appendChild(div);
    });
}

// 7. VYKRESLENÍ ZPRÁV AKTIVNÍHO CHATU
function renderChatHistory() {
    chatContainer.innerHTML = '';
    const chat = conversations.find(c => c.id === currentChatId);
    if (!chat) return;

    chat.history.forEach((msg, index) => {
        // Skryjeme ty naše "tajné" první kontextové zprávy, aby je uživatel neviděl
        if (index === 0 && msg.role === 'user' && msg.content.includes('jmenuji se')) return;
        appendMessage(msg.content, msg.role);
    });
}

// 8. ODESLÁNÍ BĚŽNÉ ZPRÁVY
chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const message = input.value.trim();
    if (!message || !currentChatId) return;

    const chat = conversations.find(c => c.id === currentChatId);

    appendMessage(message, 'user');
    chat.history.push({ role: "user", content: message });
    
    // Automatické přejmenování chatu (pokud se jmenoval "Nová konverzace")
    if (chat.title === "Nová konverzace") {
        chat.title = message.substring(0, 20) + "...";
    }
    
    saveData();
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    const loadingId = appendLoading();
    await fetchAIResponse(loadingId);
});

// 9. VOLÁNÍ BACKENDU
async function fetchAIResponse(loadingId) {
    const chat = conversations.find(c => c.id === currentChatId);
    
    try {
        const response = await fetch(`${backendUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: chat.history }) 
        });

        if (!response.ok) throw new Error("Chyba serveru");

        const data = await response.json();

        document.getElementById(loadingId).remove();
        appendMessage(data.reply, 'assistant'); // Změnil jsem 'ai' na 'assistant', ať se to shoduje s historií
        
        chat.history.push({ role: "assistant", content: data.reply });
        saveData();

    } catch (error) {
        document.getElementById(loadingId).remove();
        appendMessage("Jejda, spojení selhalo.", 'assistant');
        chat.history.pop(); 
        saveData();
    }
}

// --- POMOCNÉ FUNKCE (UI) ---
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
        div.innerHTML = `<div class="bg-gray-100 rounded-2xl rounded-tr-sm px-5 py-3 text-gray-800 break-words w-fit max-w-[85%]">${escapeHTML(text)}</div>`;
        div.classList.add('flex-row-reverse');
    } else {
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs">✨</div>
            <div class="text-gray-800 leading-relaxed max-w-[85%]"><p>${escapeHTML(text).replace(/\n/g, '<br>')}</p></div>
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
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// SPUSŤ APLIKACI!
initApp();