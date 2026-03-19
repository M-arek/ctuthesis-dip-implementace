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

const personaTherapistBtn = document.getElementById('persona-therapist');
const personaCoachBtn = document.getElementById('persona-coach');
let currentPersona = 'therapist'; // Výchozí je hodný terapeut

// --- PŘEPÍNÁNÍ OSOBNOSTÍ ---
function setPersona(persona) {
    currentPersona = persona;
    if (persona === 'therapist') {
        personaTherapistBtn.className = "px-2 py-1.5 md:px-3 md:py-1 rounded-md bg-white dark:bg-gray-700 shadow text-primary font-medium transition-all";
        personaCoachBtn.className = "px-2 py-1.5 md:px-3 md:py-1 rounded-md text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-all";
    } else {
        personaCoachBtn.className = "px-2 py-1.5 md:px-3 md:py-1 rounded-md bg-white dark:bg-gray-700 shadow text-primary font-medium transition-all";
        personaTherapistBtn.className = "px-2 py-1.5 md:px-3 md:py-1 rounded-md text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-all";
    }
}
personaTherapistBtn.addEventListener('click', () => setPersona('therapist'));
personaCoachBtn.addEventListener('click', () => setPersona('coach'));


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
}

newChatBtn.addEventListener('click', async () => {
    const chatId = Date.now().toString();
    const hiddenContext = `Ahoj, jmenuji se ${state.userProfile.name}. Má aktuální situace: ${state.userProfile.status}. V naší konverzaci mi prosím od teď ${state.userProfile.tone}. Napiš mi stručný a přátelský pozdrav (použij mé jméno v 5. pádu) a zeptej se, co dnes probereme. Umíš používat Markdown, ale používej ho pouze pro zvýraznění`;
    
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
    const systemPrompt = `Ahoj, jmenuji se ${state.userProfile.name}. Má aktuální situace: ${state.userProfile.status}. Můj hlavní problém: ${problem}. V naší konverzaci mi prosím od teď ${state.userProfile.tone}. Přivítej mě a navrhni mi, jak můžeme tento problém řešit. Umíš používat Markdown, ale používej ho pouze pro zvýraznění.`;

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
        // FINTA: Vytvoříme si kopii historie zpráv jen pro odeslání na server
        const historyToSend = JSON.parse(JSON.stringify(chat.history));
        
        // Vezmeme poslední zprávu od uživatele, kterou právě posílá
        const lastMessage = historyToSend[historyToSend.length - 1];
        
        // Přilepíme k ní tajnou instrukci podle toho, jaký přepínač je zrovna aktivní
        if (currentPersona === 'coach') {
            lastMessage.content += "\n\n[TAJNÁ INSTRUKCE PRO TUTO ODPOVĚĎ: Zapomeň na přehnanou empatii. Nyní jsi velmi přísný, racionální a přímý vztahový kouč. Nechoď kolem horké kaše, analyzuj fakta, buď kritický (ale užitečný) a navrhni tvrdá, pragmatická řešení. Piš jasně a stručně. Text naformátuj pomocí Markdownu.]";
        } else {
            lastMessage.content += "\n\n[TAJNÁ INSTRUKCE PRO TUTO ODPOVĚĎ: Nyní jsi maximálně laskavý, chápavý a empatický terapeut. Validuj uživatelovy emoce, utěš ho a nabídni jemná, pečující a podpůrná slova. Buď velmi vřelý. Text naformátuj pomocí Markdownu.]";
        }

        // Odešleme upravenou zprávu AI (uživatel tuhle tajnou instrukci neuvidí)
        const data = await fetchAIResponse(historyToSend);
        
        document.getElementById(loadingId).remove();
        appendMessage(data.reply, 'assistant', chatContainer);
        chat.history.push({ role: "assistant", content: data.reply });
        saveData();
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