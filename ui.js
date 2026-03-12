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
        // Zde jsme vyměnili bg-teal za naši novou dynamickou bg-secondary!
        const isActive = chat.id === currentChatId ? 'bg-secondary text-primary font-bold' : 'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300';
        div.className = `p-3 rounded-lg cursor-pointer text-sm truncate transition ${isActive}`;
        div.textContent = chat.title;
        div.onclick = () => onChatClick(chat.id);
        chatListElement.appendChild(div);
    });
}

export function appendMessage(text, sender, container) {
    const div = document.createElement('div');
    div.className = 'flex gap-4 max-w-3xl mx-auto w-full';
    
    if (sender === 'user') {
        div.innerHTML = `<div class="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tr-sm px-5 py-3 text-gray-800 dark:text-gray-100 break-words w-fit max-w-[85%]">${escapeHTML(text)}</div>`;
        div.classList.add('flex-row-reverse');
    } else {
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs shadow-md">✨</div>
            <div class="text-gray-800 dark:text-gray-200 leading-relaxed max-w-[85%]"><p>${escapeHTML(text).replace(/\n/g, '<br>')}</p></div>
        `;
    }
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

    // Funkce pro otevření
    function openSidebar() {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    }

    // Funkce pro zavření
    function closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }

    // Kliknutí na tlačítko ☰ otevře menu
    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    
    // Kliknutí mimo menu (na to ztmavlé pozadí) ho zavře
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // --- LOGIKA PRO SWIPE GESTA ---
    let touchStartX = 0;
    let touchEndX = 0;

    // Když se prst dotkne obrazovky
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    // Když prst opustí obrazovku
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        const threshold = 50; // Prst musí ujet aspoň 50 pixelů
        
        // Pokud táhneš doprava (a začal jsi u levého kraje obrazovky)
        if (swipeDistance > threshold && touchStartX < 50) {
            openSidebar();
        } 
        // Pokud táhneš doleva (zavíráš menu)
        else if (swipeDistance < -threshold) {
            closeSidebar();
        }
    }
    
    // Vrátíme funkci closeSidebar, aby ji mohl použít main.js (při kliknutí na chat)
    return { closeSidebar };
}