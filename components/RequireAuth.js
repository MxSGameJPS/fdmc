import React from "react";
import { useAuth } from "./AuthContext";
import { router } from "expo-router";

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // Ou um loader

  if (!user) {
    router.replace("/Login");
    return null;
  }

  return children;
}
