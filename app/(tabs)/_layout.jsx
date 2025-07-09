import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";

function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function TabBarIcon5(props) {
  return <FontAwesome5 size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
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
        name="Competicoes"
        options={{
          title: "Competições",
          tabBarIcon: ({ color }) => (
            <TabBarIcon5 name="trophy" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Midia"
        options={{
          title: "Mídia",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="play-circle" color={color} />
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
