import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function TabBarIcon5(props) {
  return <FontAwesome5 size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#D1AC00",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#333333",
        },
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#FFFFFF",
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Blog"
        options={{
          title: "Notícias",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="newspaper-o" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Jogos"
        options={{
          title: "Jogos",
          tabBarIcon: ({ color }) => (
            <TabBarIcon5 name="calendar-alt" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="ClubWorldCup"
        options={{
          title: "Mundial",
          tabBarIcon: ({ color }) => (
            <TabBarIcon5 name="trophy" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="YouTube"
        options={{
          title: "YouTube",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="youtube-play" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Instagram"
        options={{
          title: "Instagram",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="instagram" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Configuracoes"
        options={{
          title: "Mais",
          tabBarIcon: ({ color }) => <TabBarIcon name="bars" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
