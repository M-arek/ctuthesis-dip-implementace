import { state, loadData, saveData } from './storage.js';
import { fetchAIResponse } from './api.js';
import { initTheme, renderChatList, appendMessage, appendLoading, initMobileMenu } from './ui.js';

// --- HTML ELEMENTY ---
const onboardingForm = document.getElementById('onboarding-form');
const onboardingScreen = document.getElementById('onboarding-screen');
const chatScreen = document.getElementById('chat-screen');
const chatForm = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const chatContainer = document.getElementById('chat-container');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn'); // <--- PŘIDEJ TENTO ŘÁDEK
const chatList = document.getElementById('chat-list');
const newChatBtn = document.getElementById('new-chat-btn');
let mobileMenuControls;

// --- START APLIKACE ---
function initApp() {
    initTheme();
    mobileMenuControls = initMobileMenu(); // <--- PŘIDÁNO
    loadData();

    if (state.userProfile) {
        onboardingScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
        if (state.conversations.length > 0) switchChat(state.conversations[0].id);
        else createNewChat();
        updateSidebar();
        
        // PŘIDÁNO: Přepočítání okénka hned jak se chat ukáže
        setTimeout(autoResizeInput, 50);
    } else {
        onboardingScreen.classList.remove('hidden');
        chatScreen.classList.add('hidden');
    }
}

function updateSidebar() {
    renderChatList(state.conversations, state.currentChatId, chatList, switchChat);
}

function updateProgressBar(percent) {
    const bar = document.getElementById('chat-progress-bar');
    if (bar) {
        bar.style.width = `${percent}%`;
        // Volitelně: Pokud je to 100%, můžeme lištu obarvit na zeleno
        if (percent >= 100) {
            bar.classList.remove('bg-primary');
            bar.classList.add('bg-green-500');
        } else {
            bar.classList.add('bg-primary');
            bar.classList.remove('bg-green-500');
        }
    }
}

// --- PŘEPÍNÁNÍ A TVORBA CHATU ---
function switchChat(chatId) {
    state.currentChatId = chatId;
    saveData();
    updateSidebar();
    
    chatContainer.innerHTML = '';
    const chat = state.conversations.find(c => c.id === chatId);
    if (!chat) return;

    chat.history.forEach((msg, index) => {
        if (index === 0 && msg.role === 'user' && msg.content.includes('jmenuji se')) return;
        appendMessage(msg.content, msg.role, chatContainer);
    });
    
    // Pokud jsme na mobilu, zavřeme menu po vybrání chatu
    if (mobileMenuControls) mobileMenuControls.closeSidebar();
    // (na konci funkce switchChat)
    updateProgressBar(chat.progress || 0);
}

newChatBtn.addEventListener('click', async () => {
    const chatId = Date.now().toString();
    const hiddenContext = `Ahoj, jmenuji se ${state.userProfile.name}. Má aktuální situace: ${state.userProfile.status}. V naší konverzaci mi prosím od teď ${state.userProfile.tone}. Napiš mi stručný a přátelský pozdrav (použij mé jméno v 5. pádu) a zeptej se, co dnes probereme. Umíš používat Markdown, ale používej ho pouze pro zvýraznění. Na úplný začátek své odpovědi vždy napiš skrytý tag s odhadem, na kolik procent je tento problém vyřešen (např. [PROGRESS: 10]). Až za ním pokračuj textem.`;
    
    state.conversations.unshift({ id: chatId, title: "Nová konverzace", history: [{ role: "user", content: hiddenContext }] });
    switchChat(chatId);
    await handleBotResponse();
});

// --- ODESÍLÁNÍ ZPRÁV ---
onboardingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    state.userProfile = {
        name: document.getElementById('user-name').value.trim(),
        status: document.getElementById('user-status').value,
        tone: document.getElementById('user-tone').value
    };
    const problem = document.getElementById('user-problem').value.trim();

    onboardingScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    // PŘIDÁNO: Přepočítání okénka hned po odeslání dotazníku
    setTimeout(autoResizeInput, 50);

    const chatId = Date.now().toString();
    const systemPrompt = `Ahoj, jmenuji se ${state.userProfile.name}. Má aktuální situace: ${state.userProfile.status}. Můj hlavní problém: ${problem}. V naší konverzaci mi prosím od teď ${state.userProfile.tone}. Přivítej mě a navrhni mi, jak můžeme tento problém řešit. Umíš používat Markdown, ale používej ho pouze pro zvýraznění. Na úplný začátek své odpovědi vždy napiš skrytý tag s odhadem, na kolik procent je tento problém vyřešen (např. [PROGRESS: 10]). Až za ním pokračuj textem.`;

    state.conversations = [{ id: chatId, title: problem.substring(0, 20) + "...", history: [{ role: "user", content: systemPrompt }] }];
    switchChat(chatId);
    appendMessage(`Ahoj Couplii! Jmenuji se ${state.userProfile.name} a trápí mě toto: ${problem}`, 'user', chatContainer);
    await handleBotResponse();
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message || !state.currentChatId) return;

    const chat = state.conversations.find(c => c.id === state.currentChatId);
    appendMessage(message, 'user', chatContainer);
    chat.history.push({ role: "user", content: message });
    
    if (chat.title === "Nová konverzace") chat.title = message.substring(0, 20) + "...";
    
    saveData();
    updateSidebar();
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    await handleBotResponse();
});

async function handleBotResponse() {
    const chat = state.conversations.find(c => c.id === state.currentChatId);
    const loadingId = appendLoading(chatContainer);
    
    try {
        const data = await fetchAIResponse(chat.history);
        document.getElementById(loadingId).remove();
        
        let replyText = data.reply;
        let currentProgress = chat.progress || 0;

        // REGEX FINTA: Hledáme tag [PROGRESS: 45] na začátku zprávy
        const progressMatch = replyText.match(/^\[PROGRESS:\s*(\d+)\]/i);
        if (progressMatch) {
            currentProgress = parseInt(progressMatch[1], 10);
            // Ustřihneme tag ze zprávy, aby ho uživatel nikdy neviděl
            replyText = replyText.replace(/^\[PROGRESS:\s*\d+\]\s*/i, '').trim();
        }

        // Uložíme nový progres do paměti chatu a zaktualizujeme UI
        chat.progress = currentProgress;
        updateProgressBar(currentProgress);
        
        appendMessage(replyText, 'assistant', chatContainer);
        chat.history.push({ role: "assistant", content: replyText });
        
        saveData();
        updateSidebar(); // Zaktualizuje i mini-lišty v levém menu
    } catch (error) {
        document.getElementById(loadingId).remove();
        appendMessage("Jejda, spojení selhalo.", 'assistant', chatContainer);
        chat.history.pop();
        saveData();
    }
}

// --- UI EVENTY (Enter a zvětšování pole) ---
function autoResizeInput() {
    // FINTA: Nastavíme výšku na 1px.
    // Díky CSS 'min-h-[64px]', které jsme právě přidali do HTML, to na obrazovce neproblikne a nesmrskne se,
    // ale prohlížeč na pozadí správně spočítá, kolik text reálně zabírá místa.
    input.style.height = '1px';
    input.style.height = input.scrollHeight + 'px';
    sendBtn.disabled = input.value.trim() === '';
}

// Spustí se při každém napsání písmene
input.addEventListener('input', autoResizeInput);

// Počkáme zlomek vteřiny, než prohlížeč vykreslí stránku, a rovnou zkontrolujeme velikost

input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (this.value.trim() !== '') chatForm.dispatchEvent(new Event('submit'));
    }
});

// --- HLASOVÉ DIKTOVÁNÍ (Web Speech API) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'cs-CZ'; // Chceme, ať to rozumí česky
    recognition.continuous = false; 
    recognition.interimResults = true; // Chceme vidět text živě během mluvení
    
    let isRecording = false;
    let originalText = ''; // Paměť pro text, který už v okně byl napsaný

    recognition.onstart = () => {
        isRecording = true;
        // Uložíme si to, co už v poli případně je, abychom to nepřemazali
        originalText = input.value + (input.value.trim() !== '' ? ' ' : '');
        
        // Změníme ikonku mikrofonu na červenou a blikající
        if (micBtn) {
            micBtn.classList.remove('text-gray-400');
            micBtn.classList.add('text-red-500', 'animate-pulse');
        }
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        
        // Vypíšeme text uživateli pod ruce
        input.value = originalText + transcript;
        
        // Zvětšíme textové pole a aktivujeme odesílací šipku
        input.style.height = 'auto';
        input.style.height = (input.scrollHeight) + 'px';
        sendBtn.disabled = input.value.trim() === '';
    };

    recognition.onend = () => {
        isRecording = false;
        // Vrátíme mikrofon do normální barvy
        if (micBtn) {
            micBtn.classList.remove('text-red-500', 'animate-pulse');
            micBtn.classList.add('text-gray-400');
        }
    };

    recognition.onerror = (event) => {
        console.error("Chyba diktování: ", event.error);
        isRecording = false;
        if (micBtn) {
            micBtn.classList.remove('text-red-500', 'animate-pulse');
            micBtn.classList.add('text-gray-400');
        }
    };

    // Co se stane po kliknutí na mikrofon
    micBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // FINTA PRO MOBILY: Zabrání tomu, aby prohlížeč dotyk vyhodnotil jako kliknutí někam jinam

        if (isRecording) {
            // Natvrdo přepíšeme stav, abychom zabránili zacyklení
            isRecording = false;
            
            // Okamžitá vizuální odezva
            micBtn.classList.remove('text-red-500', 'animate-pulse');
            micBtn.classList.add('text-gray-400');
            micBtn.blur(); // Odebereme focus po kliknutí
            
            try {
                recognition.stop(); // Slušné ukončení (zpracuje poslední slova)
            } catch (err) {
                console.warn("Chyba při zastavování mikrofonu:", err);
            }
        } else {
            try {
                recognition.start();
            } catch (err) {
                // Občas prohlížeč hodí chybu, pokud se na tlačítko ťukne dvakrát rychle za sebou
                console.warn("Mikrofon už běží nebo se teprve spouští.");
            }
        }
    });
} else {
    // Pokud prohlížeč mikrofon vůbec neumí, tlačítko potichu schováme
    if (micBtn) micBtn.style.display = 'none';
}

initApp();