export const state = {
    userProfile: null,
    conversations: [],
    currentChatId: null
};

export function loadData() {
    const profile = localStorage.getItem('couplii_profile');
    const chats = localStorage.getItem('couplii_chats');
    if (profile) state.userProfile = JSON.parse(profile);
    if (chats) state.conversations = JSON.parse(chats);
}

export function saveData() {
    localStorage.setItem('couplii_profile', JSON.stringify(state.userProfile));
    localStorage.setItem('couplii_chats', JSON.stringify(state.conversations));
}