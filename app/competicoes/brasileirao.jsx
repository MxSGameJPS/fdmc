import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Brasileirao() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  // URL para onde o link "SofaScore" deve direcionar
  const sofascoreUrl =
    "https://www.sofascore.com/pt/torneio/futebol/brazil/brasileirao-serie-a/325#id:72034";

  // Função para voltar para a tela principal de competições
 

  // Função para atualizar manualmente
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);

    // Recarregar a WebView
    if (webViewRef.current) {
      webViewRef.current.reload();
    }

    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const openSofascoreLink = () => {
    Linking.openURL(sofascoreUrl);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
     

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#D1AC00"]}
            tintColor="#D1AC00"
          />
        }
      >
        <TouchableOpacity onPress={() => router.navigate("/competicoes")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Brasileirão Betano Série A 2025</Text>
          <TouchableOpacity onPress={openSofascoreLink}>
            <Text style={styles.headerLink}>SofaScore</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Dados atualizados em tempo real via SofaScore
        </Text>

        <Text style={styles.sectionTitle}>Classificação</Text>
        <View style={styles.widgetContainer}>
          <WebView
            ref={webViewRef}
            source={{
              uri: "https://widgets.sofascore.com/pt-BR/embed/tournament/83/season/72034/standings/Brasileiro%20Serie%20A%202025?widgetTitle=Brasileiro%20Serie%20A%202025&showCompetitionLogo=true",
            }}
            style={styles.webview}
            onLoadEnd={() => setLoading(false)}
            originWhitelist={["*"]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            onError={(error) => console.error("WebView error:", error)}
          />
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D1AC00" />
              <Text style={styles.loadingText}>
                Carregando classificação...
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            Classificação do Brasileirão Betano 2025
          </Text>
          <Text style={styles.footerText}>
            Fonte: SofaScore - Atualizado em tempo real
          </Text>
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
  backButton: {
    padding: 8,
    marginLeft: -5,
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
    marginTop: "20%", // Ajuste para evitar sobreposição com a barra de status
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 70, // Aumentado para evitar que o conteúdo seja coberto pela tab bar
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  headerLink: {
    color: "#D1AC00",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#AAAAAA",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 15,
    marginTop: 10,
  },
  widgetContainer: {
    height: 1150, // Altura para acomodar a tabela completa
    backgroundColor: "#121212",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 16,
  },
  footerInfo: {
    marginTop: 16,
    alignItems: "center",
  },
  footerText: {
    color: "#888888",
    marginBottom: 8,
    textAlign: "center",
  },
});
