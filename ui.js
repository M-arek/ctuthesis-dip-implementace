export function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const colorPicker = document.getElementById('color-picker');

    const savedTheme = localStorage.getItem('couplii_theme');
    const savedColor = localStorage.getItem('couplii_color') || '#9e0000'; // Tvá nová výchozí barva

    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        themeToggle.textContent = '☀️';
    }

    applyColors(savedColor);
    colorPicker.value = savedColor;

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('couplii_theme', isDark ? 'dark' : 'light');
    });

    colorPicker.addEventListener('input', (e) => {
        applyColors(e.target.value);
        localStorage.setItem('couplii_color', e.target.value);
    });
}

function applyColors(hex) {
    document.documentElement.style.setProperty('--primary-color', hex);
    // Vytvoření sekundární barvy (přidáním "26" na konec hex kódu vznikne 15% průhlednost)
    document.documentElement.style.setProperty('--secondary-color', hex + '26');
}

export function renderChatList(conversations, currentChatId, chatListElement, onChatClick) {
    chatListElement.innerHTML = '';
    conversations.forEach(chat => {
        const div = document.createElement('div');
        const isActive = chat.id === currentChatId ? 'bg-secondary text-primary font-bold' : 'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300';
        div.className = `p-3 rounded-lg cursor-pointer text-sm transition ${isActive}`;
        
        // Zabezpečení proti neexistujícímu progresu u starých chatů
        const progress = chat.progress || 0; 
        
        // Přidali jsme mini-lištu progresu přímo pod název chatu
        div.innerHTML = `
            <div class="truncate mb-1.5">${escapeHTML(chat.title)}</div>
            <div class="w-full bg-gray-300 dark:bg-gray-600 h-1 rounded-full overflow-hidden opacity-50">
                <div class="bg-primary h-1 transition-all duration-500" style="width: ${progress}%"></div>
            </div>
        `;
        
        div.onclick = () => onChatClick(chat.id);
        chatListElement.appendChild(div);
    });
}

export function appendMessage(text, sender, container) {
    const div = document.createElement('div');
    // 'group' zajistí, že se kopírovací tlačítko ukáže na najetí myši
    div.className = 'flex gap-4 max-w-3xl mx-auto w-full group';
    
    if (sender === 'user') {
        // ZPRÁVA UŽIVATELE (Zarovnaná doprava i s tlačítkem)
        div.classList.add('flex-row-reverse');
        div.innerHTML = `
            <div class="flex flex-col items-end max-w-[85%] w-full">
                <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tr-sm px-5 py-3 text-gray-800 dark:text-gray-100 break-words w-fit inline-block">
                    ${escapeHTML(text).replace(/\n/g, '<br>')}
                </div>
                <button class="copy-btn mt-2 mr-1 flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <span>Zkopírovat</span>
                </button>
            </div>
        `;
    } else {
        // ZPRÁVA AI (Zarovnaná doleva)
        // Zde je správně vložený tvůj Markdown překladač!
        const formattedText = marked.parse(text);

        div.innerHTML = `
            <div class="w-8 h-8 mt-1 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs shadow-md">✨</div>
            <div class="text-gray-800 dark:text-gray-200 leading-relaxed max-w-[85%] w-full flex flex-col items-start">
                <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm inline-block w-fit overflow-hidden">
                    
                    <div class="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 marker:text-primary">
                        ${formattedText}
                    </div>

                </div>
                <button class="copy-btn mt-2 ml-1 flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <span>Zkopírovat</span>
                </button>
            </div>
        `;
    }
    
    // Společná logika pro zkopírování textu do schránky
    const copyBtn = div.querySelector('.copy-btn');
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(text);
            
            const span = copyBtn.querySelector('span');
            const svg = copyBtn.querySelector('svg');
            span.textContent = 'Zkopírováno!';
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
            copyBtn.classList.add('text-green-500', 'opacity-100');
            
            setTimeout(() => {
                span.textContent = 'Zkopírovat';
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>';
                copyBtn.classList.remove('text-green-500', 'opacity-100');
            }, 2000);
        } catch (err) {
            console.error('Chyba při kopírování:', err);
        }
    });
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

export function appendLoading(container) {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'flex gap-4 max-w-3xl mx-auto w-full';
    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs animate-pulse shadow-md">✨</div>
        <div class="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm w-fit">
            <div class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
            <div class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

export function initMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    }

    function closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }

    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // --- LOGIKA PRO SWIPE GESTA ---
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        const threshold = 50; 
        
        if (swipeDistance > threshold && touchStartX < 50) {
            openSidebar();
        } 
        else if (swipeDistance < -threshold) {
            closeSidebar(); // TADY jsi předtím omylem vložil ten kód zprávy AI. Teď je to opravené!
        }
    }
    
    return { closeSidebar };
}