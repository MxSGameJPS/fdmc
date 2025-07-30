import React, { useEffect } from "react";
import { registerForPushNotificationsAsync } from "../services/notifications/notificationService";
import { Stack } from "expo-router";
import { AuthProvider } from "../components/AuthContext";

export default function Layout() {
  useEffect(() => {
    console.log("Chamando registerForPushNotificationsAsync");
    registerForPushNotificationsAsync();
  }, []);
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
