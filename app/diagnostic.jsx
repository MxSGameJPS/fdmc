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
} from "react-native";
import {
  clearFootballCache,
  getDailyRequestCount,
  testApiConnection,
} from "../services/football/api";
import { diagnosticNotificationsSystem } from "../services/notifications/diagnostic";

export default function DiagnosticScreen() {
  const [testResults, setTestResults] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [apiUsage, setApiUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    loadCacheInfo();
    loadApiUsage();
  }, []);

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
                  <Text style={styles.detailsLabel}>Status do Background Fetch:</Text>
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
              Execute o diagnóstico para verificar o status do sistema de notificações
            </Text>
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
