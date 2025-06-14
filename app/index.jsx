import { router } from "expo-router";
import { useEffect } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import Botao from "../components/botao";
import { clearFootballCache } from "../services/football/api";
import { initializeContentTracking } from "../services/initialSetup";

export default function Index() {
  useEffect(() => {
    // Inicializar o rastreamento de conteúdo
    initializeContentTracking();
  }, []);

  useEffect(() => {
    // Limpar cache para forçar o uso do novo ID
    clearFootballCache();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/avatar.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Botao onPress={() => router.push("/(tabs)/Home")} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  container: {
    flex: 1,
    justifyContent: "center", // Centraliza verticalmente
    alignItems: "center", // Centraliza horizontalmente
  },
});
