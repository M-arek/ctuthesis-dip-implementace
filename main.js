import { state, loadData, saveData } from './storage.js';
import { fetchAIResponse } from './api.js';
import { initTheme, renderChatList, appendMessage, appendLoading } from './ui.js';

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

// --- START APLIKACE ---
function initApp() {
    initTheme();
    loadData();

    if (state.userProfile) {
        onboardingScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
        if (state.conversations.length > 0) switchChat(state.conversations[0].id);
        else createNewChat();
        updateSidebar();
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
}

newChatBtn.addEventListener('click', async () => {
    const chatId = Date.now().toString();
    const hiddenContext = `Ahoj, jmenuji se ${state.userProfile.name}. Má aktuální situace: ${state.userProfile.status}. V naší konverzaci mi prosím od teď ${state.userProfile.tone}. Napiš mi stručný a přátelský pozdrav (použij mé jméno v 5. pádu) a zeptej se, co dnes probereme.`;
    
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

    const chatId = Date.now().toString();
    const systemPrompt = `Ahoj, jmenuji se ${state.userProfile.name}. Má aktuální situace: ${state.userProfile.status}. Můj hlavní problém: ${problem}. V naší konverzaci mi prosím od teď ${state.userProfile.tone}. Přivítej mě a navrhni mi, jak můžeme tento problém řešit.`;

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

initApp();