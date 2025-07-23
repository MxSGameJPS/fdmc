import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../services/firebase";
let onAuthStateChanged;
try {
  onAuthStateChanged = require("firebase/auth").onAuthStateChanged;
} catch {}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;
    setLoading(true);
    if (auth && onAuthStateChanged) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
        } else {
          setUser(null);
          await AsyncStorage.removeItem("user");
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // login não é mais necessário, pois o estado é controlado pelo Firebase Auth
  const login = async () => {};

  const logout = async () => {
    if (auth) {
      try {
        const { signOut } = require("firebase/auth");
        await signOut(auth);
      } catch {}
    }
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
