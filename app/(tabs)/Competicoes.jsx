import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

export default function CompeticesTab() {
  const router = useRouter();

  // Em vez de redirecionar, exibimos o conteúdo diretamente
  // Isso evita o conflito de rotas que causava o crash
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Competições</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/competicoes/brasileirao")}
        >
          <View style={styles.cardContent}>
            <FontAwesome5 name="trophy" size={24} color="#D1AC00" />
            <Text style={styles.cardTitle}>Brasileirão</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#D1AC00" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/competicoes/libertadores")}
        >
          <View style={styles.cardContent}>
            <FontAwesome5 name="trophy" size={24} color="#D1AC00" />
            <Text style={styles.cardTitle}>Libertadores</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#D1AC00" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/competicoes/copa-do-brasil")}
        >
          <View style={styles.cardContent}>
            <FontAwesome5 name="trophy" size={24} color="#D1AC00" />
            <Text style={styles.cardTitle}>Copa do Brasil</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#D1AC00" />
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    marginTop: 10,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
});
