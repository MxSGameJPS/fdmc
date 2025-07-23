import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function JogosMenu() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Jogos",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerShadowVisible: false,
        }}
      />
      <Text style={styles.title}>Jogos</Text>
      <Text style={styles.subtitle}>Escolha uma opção</Text>
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/jogos/proximos-jogos")}
        >
          <Ionicons
            name="calendar"
            size={32}
            color="#D1AC00"
            style={styles.icon}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Próximos Jogos</Text>
            <Text style={styles.cardSubtitle}>Veja o calendário oficial</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/jogos/meus-pontos")}
        >
          <Ionicons name="star" size={32} color="#D1AC00" style={styles.icon} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Meus Pontos</Text>
            <Text style={styles.cardSubtitle}>Acompanhe sua pontuação</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 60,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#AAAAAA",
    marginBottom: 24,
    textAlign: "center",
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#AAAAAA",
    marginTop: 4,
  },
});
