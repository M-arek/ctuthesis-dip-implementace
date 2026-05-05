import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { UserProfile, Conversation } from './types';

// 1. ZÍSKÁNÍ NEBO VYTVOŘENÍ ANONYMNÍHO UŽIVATELE
export const getOrSignInUser = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Přestaneme poslouchat po prvním načtení
      if (user) {
        resolve(user); // Uživatel už má token
      } else {
        // Uživatel je tu poprvé, tajně ho přihlásíme
        signInAnonymously(auth)
          .then((userCred) => resolve(userCred.user))
          .catch(reject);
      }
    });
  });
};

// 2. ULOŽENÍ A NAČTENÍ PROFILU (Dotazník)
export const saveProfileToDB = async (userId: string, profile: UserProfile) => {
  await setDoc(doc(db, 'users', userId), { profile });
};

export const loadProfileFromDB = async (userId: string): Promise<UserProfile | null> => {
  const docSnap = await getDoc(doc(db, 'users', userId));
  if (docSnap.exists()) {
    return docSnap.data().profile as UserProfile;
  }
  return null;
};

// 3. ULOŽENÍ, NAČTENÍ A SMAZÁNÍ KONVERZACÍ
export const saveConversationToDB = async (userId: string, conversation: Conversation) => {
  await setDoc(doc(db, `users/${userId}/conversations`, conversation.id), conversation);
};

export const deleteConversationFromDB = async (userId: string, chatId: string) => {
  await deleteDoc(doc(db, `users/${userId}/conversations`, chatId));
};

export const loadConversationsFromDB = async (userId: string): Promise<Conversation[]> => {
  const querySnapshot = await getDocs(collection(db, `users/${userId}/conversations`));
  const conversations: Conversation[] = [];
  querySnapshot.forEach((doc) => {
    conversations.push(doc.data() as Conversation);
  });
  // Seřadíme od nejnovější (podle ID, které je vlastně timestamp)
  return conversations.sort((a, b) => parseInt(b.id) - parseInt(a.id));
};