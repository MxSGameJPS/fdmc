import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { checkAllNewContent } from "../../services/notifications/contentChecker";

export default function TabsLayout() {
  useEffect(() => {
    // Verificar novos conteúdos ao abrir as tabs
    checkAllNewContent();

    // Verificar a cada 5 minutos enquanto o app estiver aberto
    const interval = setInterval(() => {
      checkAllNewContent();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#D1AC00",
        tabBarInactiveTintColor: "#757575",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#222222",
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Jogos"
        options={{
          title: "Jogos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="football" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Blog"
        options={{
          title: "Notícias",
          tabBarIcon: ({ color }) => (
            <Ionicons name="newspaper" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="YouTube"
        options={{
          title: "YouTube",
          tabBarIcon: ({ color }) => (
            <Ionicons name="logo-youtube" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Instagram"
        options={{
          title: "Insta",
          tabBarIcon: ({ color }) => (
            <Ionicons name="logo-instagram" size={24} color={color} />
          ),
        }}
      />     
    </Tabs>
  );
}
