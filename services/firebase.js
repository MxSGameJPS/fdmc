// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCeKD2RYMGN9cl9fK7UNeD_Q8tIg8BA1sI",
  authDomain: "fdmc-d437a.firebaseapp.com",
  databaseURL: "https://fdmc-d437a-default-rtdb.firebaseio.com",
  projectId: "fdmc-d437a",
  storageBucket: "fdmc-d437a.firebasestorage.app",
  messagingSenderId: "284919922147",
  appId: "1:284919922147:web:17ae7d938ce250c13534d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const saveContent = async (type, content) => {
  try {
    await set(ref(database, `content/${type}`), content);
    console.log(`${type} content saved successfully`);
    return true;
  } catch (error) {
    console.error(`Error saving ${type} content:`, error);
    return false;
  }
};

export const getContent = async (type) => {
  try {
    const snapshot = await get(ref(database, `content/${type}`));
    return snapshot.val() || [];
  } catch (error) {
    console.error(`Error getting ${type} content:`, error);
    return [];
  }
};

export const subscribeToContent = (callback) => {
  const contentRef = ref(database, 'content');
  return onValue(contentRef, (snapshot) => {
    const data = snapshot.val() || {
      youtube: [],
      instagram: [],
      blog: []
    };
    callback(data);
  });
};