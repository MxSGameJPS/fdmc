import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

/**
 * Componente Widget de Classificação do Brasileirão
 * @param {string} title - Título a ser exibido acima do widget
 * @param {boolean} showHeader - Se deve mostrar o cabeçalho
 * @param {boolean} showFooter - Se deve mostrar o rodapé
 * @param {number} height - Altura do componente
 */
export default function BrasileiraoWidget({
  title = "Classificação do Brasileirão 2025",
  showHeader = true,
  showFooter = true,
  height = 600,
}) {
  const [loading, setLoading] = useState(true);

  // URL para onde o link "Sofascore" deve direcionar
  const sofascoreUrl =
    "https://www.sofascore.com/pt/torneio/futebol/brazil/brasileirao-serie-a/325#id:72034";

  const openSofascoreLink = () => {
    Linking.openURL(sofascoreUrl);
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={openSofascoreLink}>
            <Text style={styles.headerLink}>Sofascore</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.widgetContainer, { height }]}>
        <WebView
          source={{
            html: `
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                <style>
                  body { margin: 0; padding: 0; background-color: #121212; }
                  iframe { width: 100% !important; border: none; }
                </style>
              </head>
              <body>
                <iframe id="sofa-standings-embed-83-72034" src="https://widgets.sofascore.com/pt-BR/embed/tournament/83/season/72034/standings/Brasileiro%20Serie%20A%202025?widgetTitle=Brasileiro%20Serie%20A%202025&showCompetitionLogo=true" style="height:${height}px!important;max-width:768px!important;width:100%!important;" frameborder="0" scrolling="no"></iframe>
                <div style="font-size:12px;font-family:Arial,sans-serif;text-align:left;padding:10px;color:#aaa;">
                  Classificação fornecida por Sofascore
                </div>
              </body>
              </html>
            `,
          }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          originWhitelist={["*"]}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onError={(error) => console.error("WebView error:", error)}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D1AC00" />
            <Text style={styles.loadingText}>Carregando classificação...</Text>
          </View>
        )}
      </View>

      {showFooter && (
        <TouchableOpacity
          style={styles.footerButton}
          onPress={openSofascoreLink}
        >
          <Text style={styles.footerButtonText}>
            Ver classificação completa
          </Text>
          <Ionicons name="open-outline" size={16} color="#D1AC00" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000000",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#121212",
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerLink: {
    color: "#D1AC00",
    fontWeight: "bold",
    fontSize: 14,
  },
  widgetContainer: {
    backgroundColor: "#121212",
    width: "100%",
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
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
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  footerButtonText: {
    color: "#D1AC00",
    fontWeight: "bold",
    marginRight: 8,
  },
});
