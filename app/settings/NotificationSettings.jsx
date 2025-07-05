import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  registerBackgroundFetchAsync,
  unregisterBackgroundFetchAsync,
  checkBackgroundFetchStatusAsync,
} from "../../services/notifications/backgroundTasks";
import { sendTestNotification } from "../../services/notifications/contentChecker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [youtubeNotifications, setYoutubeNotifications] = useState(true);
  const [instagramNotifications, setInstagramNotifications] = useState(true);
  const [blogNotifications, setBlogNotifications] = useState(true);
  const [status, setStatus] = useState("Verificando...");

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadSettings();
  }, []);

  // Carregar configurações do AsyncStorage
  const loadSettings = async () => {
    try {
      setLoading(true);

      // Verificar se as tarefas em segundo plano estão ativas
      const backgroundStatus = await checkBackgroundFetchStatusAsync();
      setNotificationsEnabled(backgroundStatus.isRegistered);
      setStatus(backgroundStatus.statusText);

      // Carregar preferências específicas
      const matchSetting = await AsyncStorage.getItem("notify_matches");
      const youtubeSetting = await AsyncStorage.getItem("notify_youtube");
      const instagramSetting = await AsyncStorage.getItem("notify_instagram");
      const blogSetting = await AsyncStorage.getItem("notify_blog");

      setMatchNotifications(matchSetting !== "false");
      setYoutubeNotifications(youtubeSetting !== "false");
      setInstagramNotifications(instagramSetting !== "false");
      setBlogNotifications(blogSetting !== "false");
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      Alert.alert("Erro", "Não foi possível carregar as configurações.");
    } finally {
      setLoading(false);
    }
  };

  // Salvar uma configuração específica
  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Erro ao salvar configuração ${key}:`, error);
    }
  };

  // Alternar notificações gerais
  const toggleNotifications = async () => {
    try {
      setLoading(true);

      if (notificationsEnabled) {
        // Desativar tarefas em segundo plano
        await unregisterBackgroundFetchAsync();
        setNotificationsEnabled(false);
      } else {
        // Ativar tarefas em segundo plano
        await registerBackgroundFetchAsync();
        setNotificationsEnabled(true);
      }

      // Verificar novo status
      const backgroundStatus = await checkBackgroundFetchStatusAsync();
      setStatus(backgroundStatus.statusText);
    } catch (error) {
      console.error("Erro ao alternar notificações:", error);
      Alert.alert(
        "Erro",
        "Não foi possível atualizar as configurações de notificação."
      );
    } finally {
      setLoading(false);
    }
  };

  // Alternar notificações de jogos
  const toggleMatchNotifications = async (value) => {
    setMatchNotifications(value);
    await saveSettings("notify_matches", value);
  };

  // Alternar notificações do YouTube
  const toggleYoutubeNotifications = async (value) => {
    setYoutubeNotifications(value);
    await saveSettings("notify_youtube", value);
  };

  // Alternar notificações do Instagram
  const toggleInstagramNotifications = async (value) => {
    setInstagramNotifications(value);
    await saveSettings("notify_instagram", value);
  };

  // Alternar notificações do Blog
  const toggleBlogNotifications = async (value) => {
    setBlogNotifications(value);
    await saveSettings("notify_blog", value);
  };

  // Enviar notificação de teste
  const handleTestNotification = async () => {
    try {
      setLoading(true);

      if (!notificationsEnabled) {
        Alert.alert(
          "Notificações desativadas",
          "Você precisa ativar as notificações primeiro."
        );
        return;
      }

      const success = await sendTestNotification();

      if (success) {
        Alert.alert(
          "Notificação enviada",
          "Você deve receber uma notificação de teste em instantes."
        );
      } else {
        Alert.alert("Falha", "Não foi possível enviar a notificação de teste.");
      }
    } catch (error) {
      console.error("Erro ao enviar notificação de teste:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um problema ao enviar a notificação de teste."
      );
    } finally {
      setLoading(false);
    }
  };

  // Abrir instruções para desativar otimização de bateria
  const showBatteryOptimizationInfo = () => {
    Alert.alert(
      "Configurações de Bateria",
      "Para garantir que as notificações funcionem corretamente, desative a otimização de bateria para este app:\n\n" +
        "1. Vá para Configurações do dispositivo\n" +
        '2. Abra "Apps" ou "Aplicativos"\n' +
        "3. Encontre este app\n" +
        '4. Selecione "Bateria"\n' +
        '5. Desative "Otimização de bateria" ou "Restrições em segundo plano"\n\n' +
        "As etapas podem variar dependendo do seu dispositivo.",
      [{ text: "Entendi" }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações de Notificações</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D1AC00" />
            <Text style={styles.loadingText}>Carregando configurações...</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.statusContainer}>
                <Text style={styles.statusTitle}>Status das notificações</Text>
                <Text style={styles.statusText}>{status}</Text>

                <View style={styles.mainSwitchRow}>
                  <Text style={styles.mainSwitchText}>
                    Ativar todas as notificações
                  </Text>
                  <Switch
                    trackColor={{ false: "#444", true: "#D1AC00" }}
                    thumbColor={notificationsEnabled ? "#FFFFFF" : "#f4f3f4"}
                    onValueChange={toggleNotifications}
                    value={notificationsEnabled}
                    disabled={loading}
                  />
                </View>
              </View>

              {Platform.OS !== "web" && (
                <TouchableOpacity
                  style={[styles.helpButton]}
                  onPress={showBatteryOptimizationInfo}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#D1AC00"
                  />
                  <Text style={styles.helpButtonText}>
                    Problemas com notificações? Toque aqui
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.sectionTitle}>TIPOS DE NOTIFICAÇÃO</Text>

            <View style={styles.card}>
              {/* Notificações de Partidas */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Jogos ao vivo</Text>
                  <Text style={styles.switchDescription}>
                    Receba alertas sobre gols, início e fim de partidas
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: "#444", true: "#D1AC00" }}
                  thumbColor={matchNotifications ? "#FFFFFF" : "#f4f3f4"}
                  onValueChange={toggleMatchNotifications}
                  value={matchNotifications && notificationsEnabled}
                  disabled={!notificationsEnabled || loading}
                />
              </View>

              {/* Notificações de YouTube */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Vídeos do YouTube</Text>
                  <Text style={styles.switchDescription}>
                    Seja notificado sobre novos vídeos publicados
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: "#444", true: "#D1AC00" }}
                  thumbColor={youtubeNotifications ? "#FFFFFF" : "#f4f3f4"}
                  onValueChange={toggleYoutubeNotifications}
                  value={youtubeNotifications && notificationsEnabled}
                  disabled={!notificationsEnabled || loading}
                />
              </View>

              {/* Notificações do Instagram */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Posts do Instagram</Text>
                  <Text style={styles.switchDescription}>
                    Receba alertas sobre novas publicações do clube
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: "#444", true: "#D1AC00" }}
                  thumbColor={instagramNotifications ? "#FFFFFF" : "#f4f3f4"}
                  onValueChange={toggleInstagramNotifications}
                  value={instagramNotifications && notificationsEnabled}
                  disabled={!notificationsEnabled || loading}
                />
              </View>

              {/* Notificações do Blog */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Notícias e Blog</Text>
                  <Text style={styles.switchDescription}>
                    Fique por dentro das últimas notícias do clube
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: "#444", true: "#D1AC00" }}
                  thumbColor={blogNotifications ? "#FFFFFF" : "#f4f3f4"}
                  onValueChange={toggleBlogNotifications}
                  value={blogNotifications && notificationsEnabled}
                  disabled={!notificationsEnabled || loading}
                />
              </View>
            </View>

            {notificationsEnabled && (
              <>
                <Text style={styles.sectionTitle}>TESTAR NOTIFICAÇÕES</Text>

                <View style={styles.card}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleTestNotification}
                    disabled={loading}
                  >
                    <Ionicons name="notifications" size={18} color="#000" />
                    <Text style={styles.buttonText}>
                      Enviar notificação de teste
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.disclaimerText}>
                    Se você não receber a notificação de teste, verifique as
                    configurações de bateria do seu dispositivo e permissões do
                    aplicativo.
                  </Text>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#000000",
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
  },
  card: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusTitle: {
    color: "#D1AC00",
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
  },
  statusText: {
    color: "#aaa",
    marginBottom: 12,
    fontSize: 14,
  },
  mainSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  mainSwitchText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 12,
    letterSpacing: 1,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
  },
  helpButtonText: {
    color: "#D1AC00",
    marginLeft: 6,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: "#aaa",
  },
  button: {
    backgroundColor: "#D1AC00",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: "#444",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },
});
