import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, router } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

export default function Midia() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: "Mídia",
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Conteúdo do Fogão</Text>
        <Text style={styles.subtitle}>
          Acompanhe o Botafogo nas redes sociais
        </Text>

        {/* Cards para redes sociais */}
        <View style={styles.cardsContainer}>
          {/* Mapa de Calor da Torcida */}
          <TouchableOpacity
            style={styles.socialCard}
            onPress={() => router.push("/midia/mapa-calor")}
          >
            <View
              style={[styles.cardIconContainer, { backgroundColor: "#388E3C" }]}
            >
              <Ionicons name="map" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Mapa de Calor da Torcida</Text>
              <Text style={styles.cardSubtitle}>
                Veja a força da torcida no Brasil
              </Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
            </View>
          </TouchableOpacity>

          {/* YouTube */}
          <TouchableOpacity
            style={styles.socialCard}
            onPress={() => router.push("/midia/youtube")}
          >
            <View
              style={[styles.cardIconContainer, { backgroundColor: "#FF0000" }]}
            >
              <FontAwesome name="youtube-play" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>YouTube</Text>
              <Text style={styles.cardSubtitle}>Vídeos e highlights</Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
            </View>
          </TouchableOpacity>

          {/* Instagram */}
          <TouchableOpacity
            style={styles.socialCard}
            onPress={() => router.push("/midia/instagram")}
          >
            <View
              style={[styles.cardIconContainer, { backgroundColor: "#C13584" }]}
            >
              <FontAwesome name="instagram" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Instagram</Text>
              <Text style={styles.cardSubtitle}>Fotos e reels</Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
            </View>
          </TouchableOpacity>

          {/* Twitter/X */}
          <TouchableOpacity style={styles.socialCard}>
            <View
              style={[styles.cardIconContainer, { backgroundColor: "#1DA1F2" }]}
            >
              <FontAwesome name="twitter" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Twitter (Em Breve)</Text>
              <Text style={styles.cardSubtitle}>Notícias e atualizações</Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
            </View>
          </TouchableOpacity>

          {/* TikTok */}
          <TouchableOpacity style={styles.socialCard}>
            <View
              style={[styles.cardIconContainer, { backgroundColor: "#000000" }]}
            >
              <FontAwesome name="music" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>TikTok (Em Breve)</Text>
              <Text style={styles.cardSubtitle}>Vídeos curtos</Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: "20%",
  },
  subtitle: {
    fontSize: 16,
    color: "#AAAAAA",
    marginTop: 8,
    marginBottom: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  socialCard: {
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#AAAAAA",
    marginTop: 4,
  },
  cardArrow: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
