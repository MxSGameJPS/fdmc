// services/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Alert } from "react-native";

// Import do diagnóstico
import { saveErrorLog, testFirebaseInit } from './firebase-diagnostic';

// Sua configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCeKD2RYMGN9cl9fK7UNeD_Q8tIg8BA1sI",
  authDomain: "fdmc-d437a.firebaseapp.com",
  databaseURL: "https://fdmc-d437a-default-rtdb.firebaseio.com",
  projectId: "fdmc-d437a",
  storageBucket: "fdmc-d437a.firebasestorage.app",
  messagingSenderId: "284919922147",
  appId: "1:284919922147:web:17ae7d938ce250c13534d6",
};

// Verificar se o Firebase já foi inicializado
let app;
try {
  if (!getApps().length) {
    console.log("Inicializando Firebase pela primeira vez");
    app = initializeApp(firebaseConfig);
  } else {
    console.log("Firebase já está inicializado");
    app = getApps()[0];
  }
} catch (initError) {
  console.error("Erro crítico ao inicializar Firebase App:", initError);
  saveErrorLog('firebase-init', initError, { config: 'Firebase app initialization' });
  
  // Mostrar alerta se possível, mas evitar ciclos de erro
  try {
    setTimeout(() => {
      Alert.alert(
        "Erro de Inicialização",
        "Houve um problema ao iniciar o aplicativo. Por favor, tente novamente mais tarde."
      );
    }, 1000);
  } catch (alertError) {
    console.error("Não foi possível mostrar alerta:", alertError);
  }
}

// Inicializar Auth com persistência para React Native
let auth;
try {
  if (Platform.OS === "web") {
    console.log("Inicializando auth para ambiente web");
    auth = getAuth(app);
  } else {
    console.log("Inicializando auth para ambiente nativo com AsyncStorage");
    
    // Tentar verificar se o AsyncStorage está funcionando
    AsyncStorage.setItem('auth_test', 'test')
      .then(() => console.log('AsyncStorage está funcionando'))
      .catch(error => {
        console.error('AsyncStorage não está funcionando:', error);
        saveErrorLog('firebase-asyncstorage', error);
      });
      
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch (error) {
  console.error("Erro ao inicializar Auth:", error);
  saveErrorLog('firebase-auth-init', error, { platform: Platform.OS });
  
  // Tentar recuperar uma instância existente com método alternativo
  try {
    auth = getAuth(app);
    console.log("Instância de Auth recuperada com getAuth");
  } catch (fallbackError) {
    console.error("Falha ao recuperar instância de Auth:", fallbackError);
    saveErrorLog('firebase-auth-fallback', fallbackError);
    auth = null; // Definir explicitamente como null para evitar referências indefinidas
  }
}

// Inicializar Database
let database;
try {
  database = getDatabase(app);
} catch (dbError) {
  console.error("Erro ao inicializar Database:", dbError);
  saveErrorLog('firebase-database-init', dbError);
  database = null;
}

// Executar diagnóstico
testFirebaseInit(app, auth, database)
  .then(results => console.log('Diagnóstico Firebase:', results))
  .catch(error => console.error('Erro ao executar diagnóstico:', error));

export { app, auth, database };

// Funções auxiliares para o banco de dados
export const saveUserData = async (userId, userData) => {
  try {
    if (!database) {
      throw new Error('O banco de dados não está inicializado');
    }
    
    const { ref, set } = await import("firebase/database");
    await set(ref(database, `users/${userId}`), userData);
    console.log("User data saved successfully");
    return true;
  } catch (error) {
    console.error("Error saving user data:", error);
    saveErrorLog('saveUserData', error, { userId });
    return false;
  }
};

// Função para verificar o estado de autenticação
export const checkAuthState = () => {
  return new Promise((resolve) => {
    try {
      const { onAuthStateChanged } = require("firebase/auth");

      if (!auth) {
        console.error('Auth não está disponível em checkAuthState');
        saveErrorLog('checkAuthState', new Error('Auth não está disponível'));
        resolve(null);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, 
        (user) => {
          unsubscribe();
          resolve(user);
        }, 
        (error) => {
          console.error('Erro em onAuthStateChanged:', error);
          saveErrorLog('onAuthStateChanged', error);
          unsubscribe();
          resolve(null);
        }
      );
    } catch (error) {
      console.error('Erro ao verificar estado de autenticação:', error);
      saveErrorLog('checkAuthState', error);
      resolve(null);
    }
  });
};

export const getUserData = async (userId) => {
  try {
    if (!database) {
      throw new Error('O banco de dados não está inicializado');
    }
    
    const { ref, get } = await import("firebase/database");
    const snapshot = await get(ref(database, `users/${userId}`));
    return snapshot.val();
  } catch (error) {
    console.error("Error getting user data:", error);
    saveErrorLog('getUserData', error, { userId });
    return null;
  }
};

// Função para logout
export const logout = async (removerPersistencia = false) => {
  try {
    if (!auth) {
      throw new Error('Auth não está disponível');
    }
    
    const { signOut } = await import("firebase/auth");
    await signOut(auth);

    // Se for para remover a persistência, remover a preferência de manter conectado
    if (removerPersistencia) {
      try {
        await AsyncStorage.removeItem("manterConectado");
      } catch (storageError) {
        console.error('Erro ao remover preferência de login:', storageError);
        saveErrorLog('logout-storage', storageError);
      }
    }

    console.log("Logout realizado com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    saveErrorLog('logout', error);
    return false;
  }
};
