const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get, update } = require("firebase/database");

// Copie exatamente os dados do seu firebaseConfig do seu projeto:
const firebaseConfig = {
  apiKey: "AIzaSyCeKD2RYMGN9cl9fK7UNeD_Q8tIg8BA1sI",
  authDomain: "fdmc-d437a.firebaseapp.com",
  databaseURL: "https://fdmc-d437a-default-rtdb.firebaseio.com",
  projectId: "fdmc-d437a",
  storageBucket: "fdmc-d437a.appspot.com",
  messagingSenderId: "284919922147",
  appId: "1:284919922147:web:17ae7d938ce250c13534d6",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function atualizarTodosUsuarios() {
  const usersRef = ref(db, "users");
  const snapshot = await get(usersRef);
  if (snapshot.exists()) {
    const updates = {};
    snapshot.forEach(child => {
      const data = child.val();
      if (data.fezPalpite === undefined) {
        updates[`${child.key}/fezPalpite`] = false;
      }
    });
    if (Object.keys(updates).length > 0) {
      await update(usersRef, updates);
      console.log("Todos os usuários atualizados com fezPalpite: false!");
    } else {
      console.log("Todos os usuários já possuem fezPalpite.");
    }
  } else {
    console.log("Nenhum usuário encontrado.");
  }
}

atualizarTodosUsuarios().catch(console.error);