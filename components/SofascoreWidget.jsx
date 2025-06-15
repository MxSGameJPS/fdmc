import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";

/**
 * Componente para exibir widgets do Sofascore
 * @param {string} matchId - ID do jogo no Sofascore (opcional)
 * @param {string} tournamentId - ID do torneio no Sofascore (opcional)
 * @param {string} seasonId - ID da temporada no Sofascore (opcional)
 * @param {string} group - Grupo para tabela de classificação (opcional)
 * @param {string} type - Tipo de widget (attackMomentum, h2h, standings, etc)
 * @param {string} title - Título a ser exibido acima do widget
 * @param {string} theme - Tema do widget (light ou dark)
 * @param {number} height - Altura do widget em pixels
 */
const SofascoreWidget = ({
  matchId,
  tournamentId,
  seasonId,
  group,
  type = "attackMomentum",
  title = "",
  theme = "dark",
  height = 286,
}) => {
  const [loading, setLoading] = useState(true);

  // Determinar a URL do widget com base no tipo
  let widgetUrl = "";
  let linkUrl = "";

  if (type === "standings" && tournamentId && seasonId) {
    // URL para widget de tabela de classificação
    const groupParam = group
      ? `/standings/${encodeURIComponent(group)}`
      : "/standings";
    widgetUrl = `https://widgets.sofascore.com/pt-BR/embed/tournament/${tournamentId}/season/${seasonId}${groupParam}?widgetTitle=${encodeURIComponent(
      group || ""
    )}&showCompetitionLogo=true&widgetTheme=${theme}`;

    // Link para a página completa
    linkUrl = `https://www.sofascore.com/pt/torneio/futebol/world/fifa-club-world-cup-group-b/357#id:${seasonId}`;
  } else if (matchId) {
    // URL para widgets relacionados a jogos específicos
    widgetUrl = `https://widgets.sofascore.com/pt-BR/embed/${type}?id=${matchId}&widgetTheme=${theme}`;
    linkUrl = `https://www.sofascore.com/pt/event/${matchId}`;
  }

  const onWidgetLinkPress = () => {
    if (linkUrl) {
      Linking.openURL(linkUrl);
    }
  };

  // Se não tiver URL válida, não renderizar nada
  if (!widgetUrl) {
    return null;
  }

  return (
    <View style={[styles.container, theme === "dark" && styles.containerDark]}>
      {title ? (
        <Text style={[styles.title, theme === "dark" && styles.titleDark]}>
          {title}
        </Text>
      ) : null}
      <View
        style={[
          styles.webviewContainer,
          { height },
          theme === "dark" && styles.webviewContainerDark,
        ]}
      >
        {loading && (
          <View
            style={[
              styles.loadingContainer,
              theme === "dark" && styles.loadingContainerDark,
            ]}
          >
            <ActivityIndicator
              size="large"
              color={theme === "dark" ? "#D1AC00" : "#0071e3"}
            />
            <Text
              style={[
                styles.loadingText,
                theme === "dark" && styles.loadingTextDark,
              ]}
            >
              Carregando dados...
            </Text>
          </View>
        )}
        <WebView
          source={{ uri: widgetUrl }}
          style={styles.webview}
          onLoad={() => setLoading(false)}
          originWhitelist={["*"]}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          injectedJavaScript={`
            document.body.style.backgroundColor = "${
              theme === "dark" ? "#121212" : "#ffffff"
            }";
            document.documentElement.style.backgroundColor = "${
              theme === "dark" ? "#121212" : "#ffffff"
            }";
            true;
          `}
        />
      </View>
      <TouchableOpacity onPress={onWidgetLinkPress}>
        <Text
          style={[
            styles.attribution,
            theme === "dark" && styles.attributionDark,
          ]}
        >
          Classificação fornecida por Sofascore - Toque para ver mais
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
  },
  containerDark: {
    backgroundColor: "#212121",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000000",
  },
  titleDark: {
    color: "#D1AC00",
  },
  webviewContainer: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  webviewContainerDark: {
    backgroundColor: "#121212",
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
    backgroundColor: "#ffffff",
    zIndex: 10,
  },
  loadingContainerDark: {
    backgroundColor: "#121212",
  },
  loadingText: {
    marginTop: 10,
    color: "#666666",
  },
  loadingTextDark: {
    color: "#cccccc",
  },
  attribution: {
    fontSize: 12,
    color: "#008fd7", // Cor azul da Sofascore
    marginTop: 12,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  attributionDark: {
    color: "#0095ff",
  },
});

export default SofascoreWidget;
