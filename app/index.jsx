import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import Botao from "../components/botao";
import { clearFootballCache } from "../services/football/api";
import { initializeContentTracking } from "../services/initialSetup";
import { setupNotifications } from "../services/notifications/setup";
import { checkAuthState } from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [verificandoAuth, setVerificandoAuth] = useState(true);

  // Verificar o estado da autenticação
  useEffect(() => {
    const verificarAutenticacao = async () => {
      try {
        // Verificar se o usuário está logado
        const user = await checkAuthState();

        // Sempre redireciona para Home, independente do login
        router.replace("/(tabs)/Home");
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setVerificandoAuth(false);
      }
    };

    verificarAutenticacao();
  }, []);

  useEffect(() => {
    // Inicializar o rastreamento de conteúdo
    initializeContentTracking();
    // Limpar cache para forçar o uso do novo ID
    clearFootballCache();
  }, []);

  useEffect(() => {
    // Configurar notificações
    try {
      setupNotifications();
    } catch (error) {
      console.error("Erro ao inicializar as notificações:", error);

      // Tentar importar diretamente se necessário
      try {
        const setupModule = require("../services/notifications/setup");
        if (setupModule.default && setupModule.default.setupNotifications) {
          console.log("Tentando chamada alternativa via default export");
          setupModule.default.setupNotifications();
        } else if (setupModule.setupNotifications) {
          console.log("Tentando chamada alternativa via require");
          setupModule.setupNotifications();
        }
      } catch (importError) {
        console.error(
          "Falha completa ao inicializar notificações:",
          importError
        );
      }
    }
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/avatar.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {verificandoAuth ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D1AC00" />
            <Text style={styles.loadingText}>Verificando autenticação...</Text>
          </View>
        ) : (
          <Botao />
        )}
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 16,
    fontSize: 16,
  },
});
