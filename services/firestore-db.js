import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ...existing code...

const firebaseConfig = {
  apiKey: "AIzaSyCeKD2RYMGN9cl9fK7UNeD_Q8tIg8BA1sI",
  authDomain: "fdmc-d437a.firebaseapp.com",
  databaseURL: "https://fdmc-d437a-default-rtdb.firebaseio.com",
  projectId: "fdmc-d437a",
  storageBucket: "fdmc-d437a.firebasestorage.app",
  messagingSenderId: "284919922147",
  appId: "1:284919922147:web:17ae7d938ce250c13534d6",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
