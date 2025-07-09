import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  clearFootballCache,
  getDailyRequestCount,
  testApiConnection,
} from "../services/football/api";
import { diagnosticNotificationsSystem } from "../services/notifications/diagnostic";
import {
  getErrorLogs,
  clearErrorLogs,
  testFirebaseInit,
} from "../services/firebase-diagnostic";
import { app, auth, database } from "../services/firebase";

export default function DiagnosticScreen() {
  const [testResults, setTestResults] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [apiUsage, setApiUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [firebaseDiagnostic, setFirebaseDiagnostic] = useState(null);
  const [firebaseLogs, setFirebaseLogs] = useState([]);
  const [firebaseLoading, setFirebaseLoading] = useState(false);

  useEffect(() => {
    loadCacheInfo();
    loadApiUsage();
    loadFirebaseDiagnostic();
  }, []);

  // Função para carregar diagnóstico do Firebase
  const loadFirebaseDiagnostic = async () => {
    setFirebaseLoading(true);
    try {
      // Teste de inicialização do Firebase
      const results = await testFirebaseInit(app, auth, database);
      setFirebaseDiagnostic(results);

      // Carregar logs de erro
      const logs = await getErrorLogs();
      setFirebaseLogs(logs);
    } catch (error) {
      console.error("Erro ao carregar diagnóstico do Firebase:", error);
      Alert.alert(
        "Erro",
        "Não foi possível carregar o diagnóstico do Firebase."
      );
    } finally {
      setFirebaseLoading(false);
    }
  };

  // Função para limpar logs do Firebase
  const clearFirebaseLogs = async () => {
    try {
      await clearErrorLogs();
      Alert.alert("Sucesso", "Logs do Firebase limpos com sucesso!");
      setFirebaseLogs([]);
    } catch (error) {
      console.error("Erro ao limpar logs do Firebase:", error);
      Alert.alert("Erro", "Não foi possível limpar os logs.");
    }
  };

  // Função para tentar recuperar o Firebase
  const tryRecoverFirebase = async () => {
    try {
      // Tentar recarregar os módulos do Firebase
      const authModule = require("firebase/auth");
      const dbModule = require("firebase/database");

      Alert.alert(
        "Recarregamento",
        "Tentativa de recarregar módulos do Firebase iniciada. Por favor, reinicie o aplicativo.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Erro ao recarregar Firebase:", error);
      Alert.alert(
        "Erro",
        "Não foi possível recarregar os módulos do Firebase."
      );
    }
  };

  const runApiTest = async () => {
    setLoading(true);
    try {
      const result = await testApiConnection();
      setTestResults(result);
    } catch (error) {
      setTestResults({
        success: false,
        message: `Erro ao executar teste: ${error.message}`,
        error: error.toString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCacheInfo = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const footballKeys = keys.filter((key) => key.startsWith("football_"));

      let cacheDetails = [];
      for (const key of footballKeys) {
        const rawData = await AsyncStorage.getItem(key);
        if (rawData) {
          const { timestamp } = JSON.parse(rawData);
          const date = new Date(timestamp);
          cacheDetails.push({
            key,
            timestamp,
            date: date.toLocaleString(),
            age:
              Math.round((Date.now() - timestamp) / (60 * 60 * 1000)) +
              " horas",
          });
        }
      }

      setCacheInfo({
        totalItems: footballKeys.length,
        details: cacheDetails,
      });
    } catch (error) {
      console.error("Erro ao carregar informações de cache:", error);
    }
  };

  const loadApiUsage = async () => {
    try {
      const count = await getDailyRequestCount();
      setApiUsage({
        count,
        limit: 100,
        remaining: 100 - count,
      });
    } catch (error) {
      console.error("Erro ao carregar uso da API:", error);
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await clearFootballCache();
      await loadCacheInfo();
      alert("Cache limpo com sucesso");
    } catch (error) {
      alert(`Erro ao limpar cache: ${error.message}`);
    } finally {
      setClearingCache(false);
    }
  };

  const runNotificationDiagnostic = async () => {
    setNotificationLoading(true);
    try {
      const result = await diagnosticNotificationsSystem();
      setNotificationStatus(result);
    } catch (error) {
      setNotificationStatus({
        success: false,
        message: `Erro ao diagnosticar notificações: ${error.message}`,
        error: error.toString(),
      });
    } finally {
      setNotificationLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Diagnóstico da API</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status da API</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={runApiTest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Testar Conexão</Text>
            )}
          </TouchableOpacity>

          {testResults && (
            <View style={styles.resultCard}>
              <Text
                style={[
                  styles.statusText,
                  { color: testResults.success ? "#4CAF50" : "#F44336" },
                ]}
              >
                {testResults.success ? "✓ Funcionando" : "✗ Erro"}
              </Text>
              <Text style={styles.message}>{testResults.message}</Text>

              {testResults.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorText}>
                    {testResults.error.toString()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uso da API</Text>
          {apiUsage ? (
            <View style={styles.usageCard}>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Requisições hoje:</Text>
                <Text style={styles.usageValue}>{apiUsage.count}</Text>
              </View>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Limite diário:</Text>
                <Text style={styles.usageValue}>{apiUsage.limit}</Text>
              </View>
              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>Restantes:</Text>
                <Text
                  style={[
                    styles.usageValue,
                    { color: apiUsage.remaining < 20 ? "#F44336" : "#4CAF50" },
                  ]}
                >
                  {apiUsage.remaining}
                </Text>
              </View>
            </View>
          ) : (
            <ActivityIndicator size="small" />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cache da API</Text>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={handleClearCache}
              disabled={clearingCache}
            >
              {clearingCache ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.smallButtonText}>Limpar</Text>
              )}
            </TouchableOpacity>
          </View>

          {cacheInfo ? (
            <View style={styles.cacheCard}>
              <Text style={styles.cacheCount}>
                {cacheInfo.totalItems} item(s) em cache
              </Text>

              {cacheInfo.details.map((item, index) => (
                <View key={index} style={styles.cacheItem}>
                  <Text style={styles.cacheKey}>{item.key}</Text>
                  <Text style={styles.cacheDate}>Atualizado: {item.date}</Text>
                  <Text style={styles.cacheAge}>Idade: {item.age}</Text>
                </View>
              ))}
            </View>
          ) : (
            <ActivityIndicator size="small" />
          )}
        </View>

        {/* Seção de Diagnóstico de Notificações */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sistema de Notificações</Text>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={runNotificationDiagnostic}
              disabled={notificationLoading}
            >
              <Text style={styles.smallButtonText}>
                {notificationLoading ? "Verificando..." : "Verificar"}
              </Text>
            </TouchableOpacity>
          </View>

          {notificationStatus ? (
            <View style={styles.resultCard}>
              <Text
                style={[
                  styles.statusText,
                  { color: notificationStatus.success ? "#4CAF50" : "#F44336" },
                ]}
              >
                {notificationStatus.success
                  ? "✓ Sistema funcionando"
                  : "✗ Problema encontrado"}
              </Text>

              {notificationStatus.backgroundFetchStatus && (
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>
                    Status do Background Fetch:
                  </Text>
                  <Text style={styles.detailsValue}>
                    {notificationStatus.backgroundFetchStatus.isRegistered
                      ? "Registrado"
                      : "Não registrado"}
                  </Text>
                </View>
              )}

              {notificationStatus.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorText}>
                    {notificationStatus.error.toString()}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.infoText}>
              Execute o diagnóstico para verificar o status do sistema de
              notificações
            </Text>
          )}
        </View>

        {/* Seção de Diagnóstico do Firebase */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sistema de Autenticação</Text>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={loadFirebaseDiagnostic}
              disabled={firebaseLoading}
            >
              <Text style={styles.smallButtonText}>
                {firebaseLoading ? "Verificando..." : "Verificar"}
              </Text>
            </TouchableOpacity>
          </View>

          {firebaseLoading ? (
            <ActivityIndicator size="small" />
          ) : firebaseDiagnostic ? (
            <View style={styles.resultCard}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: firebaseDiagnostic.authInitialized
                      ? "#4CAF50"
                      : "#F44336",
                  },
                ]}
              >
                {firebaseDiagnostic.authInitialized
                  ? "✓ Operacional"
                  : "✗ Com problemas"}
              </Text>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>App Inicializado:</Text>
                <Text
                  style={[
                    styles.detailsValue,
                    {
                      color: firebaseDiagnostic.appInitialized
                        ? "#4CAF50"
                        : "#F44336",
                    },
                  ]}
                >
                  {firebaseDiagnostic.appInitialized ? "Sim" : "Não"}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Auth Inicializado:</Text>
                <Text
                  style={[
                    styles.detailsValue,
                    {
                      color: firebaseDiagnostic.authInitialized
                        ? "#4CAF50"
                        : "#F44336",
                    },
                  ]}
                >
                  {firebaseDiagnostic.authInitialized ? "Sim" : "Não"}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Database Inicializado:</Text>
                <Text
                  style={[
                    styles.detailsValue,
                    {
                      color: firebaseDiagnostic.databaseInitialized
                        ? "#4CAF50"
                        : "#F44336",
                    },
                  ]}
                >
                  {firebaseDiagnostic.databaseInitialized ? "Sim" : "Não"}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>
                  AsyncStorage Funcionando:
                </Text>
                <Text
                  style={[
                    styles.detailsValue,
                    {
                      color: firebaseDiagnostic.asyncStorageWorking
                        ? "#4CAF50"
                        : "#F44336",
                    },
                  ]}
                >
                  {firebaseDiagnostic.asyncStorageWorking ? "Sim" : "Não"}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, { marginTop: 10 }]}
                onPress={tryRecoverFirebase}
              >
                <Text style={styles.buttonText}>Tentar Recuperar Firebase</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.infoText}>
              Clique em Verificar para testar o sistema de autenticação
            </Text>
          )}

          {/* Logs do Firebase */}
          {firebaseLogs && firebaseLogs.length > 0 && (
            <View style={[styles.resultCard, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>
                Logs de Erro ({firebaseLogs.length})
              </Text>

              {firebaseLogs.slice(0, 3).map((log, index) => (
                <View key={index} style={styles.errorDetails}>
                  <Text style={{ color: "#D1AC00" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                  <Text style={{ color: "#FFFFFF" }}>
                    Componente: {log.component}
                  </Text>
                  <Text style={styles.errorText}>{log.errorMessage}</Text>
                  {log.errorCode && (
                    <Text style={{ color: "#FF9999" }}>
                      Código: {log.errorCode}
                    </Text>
                  )}
                </View>
              ))}

              {firebaseLogs.length > 3 && (
                <Text
                  style={{
                    color: "#AAAAAA",
                    marginTop: 5,
                    textAlign: "center",
                  }}
                >
                  + {firebaseLogs.length - 3} logs adicionais
                </Text>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  { marginTop: 10, backgroundColor: "#444" },
                ]}
                onPress={clearFirebaseLogs}
              >
                <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                  Limpar Logs
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#000",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#D1AC00",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  smallButton: {
    backgroundColor: "#666",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  smallButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
  },
  resultCard: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  message: {
    color: "#DDD",
    marginBottom: 8,
  },
  errorDetails: {
    backgroundColor: "#3A1A1A",
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  errorText: {
    color: "#FF9999",
    fontFamily: "monospace",
  },
  usageCard: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 8,
  },
  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  usageLabel: {
    color: "#BBBBBB",
  },
  usageValue: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  cacheCard: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 8,
  },
  cacheCount: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 12,
  },
  cacheItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    marginBottom: 8,
  },
  cacheKey: {
    color: "#D1AC00",
    fontFamily: "monospace",
    fontSize: 12,
    marginBottom: 4,
  },
  cacheDate: {
    color: "#BBBBBB",
    fontSize: 12,
  },
  cacheAge: {
    color: "#999999",
    fontSize: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailsLabel: {
    color: "#BBBBBB",
  },
  detailsValue: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  infoText: {
    color: "#AAAAAA",
    textAlign: "center",
    marginTop: 16,
  },
});
