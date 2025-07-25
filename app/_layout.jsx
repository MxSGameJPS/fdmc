import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../components/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AuthProvider>
  );
}
