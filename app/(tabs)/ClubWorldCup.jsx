import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import {
  getNextBotafogoMatch,
  getLiveBotafogoMatch,
} from "../../services/thesportsdb/botafogo";

export default function ClubWorldCup() {
  const [nextMatch, setNextMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // URL para onde o link "Sofascore" deve direcionar
  const sofascoreUrl =
    "https://www.sofascore.com/pt/torneio/futebol/world/fifa-club-world-cup-group-b/357#id:69619";

  // Carregar o próximo jogo
  const loadNextMatch = async () => {
    try {
      setError(null);
      setLoading(true);

      console.log("Carregando próximo jogo do Botafogo...");
      const match = await getNextBotafogoMatch();

      if (match) {
        console.log(
          `Jogo encontrado: ${match.teams.home.name} vs ${match.teams.away.name}`
        );
        setNextMatch(match);
      } else {
        setError(
          "Não foi possível encontrar o próximo jogo do Botafogo no Mundial."
        );
      }
    } catch (err) {
      console.error("Erro ao carregar próximo jogo:", err);
      setError("Erro ao carregar informações do jogo.");
    } finally {
      setLoading(false);
    }
  };

  // Verificar jogos ao vivo e carregar dados iniciais
  useEffect(() => {
    loadNextMatch();

    // Verificar jogos ao vivo a cada minuto
    const interval = setInterval(async () => {
      try {
        console.log("Verificando jogos ao vivo...");
        const liveMatch = await getLiveBotafogoMatch();

        if (liveMatch) {
          console.log("Jogo ao vivo encontrado!");
          setNextMatch(liveMatch);
        }
      } catch (err) {
        console.error("Erro ao verificar jogos ao vivo:", err);
      }
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  // Função para atualizar manualmente
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTableLoading(true);
    loadNextMatch().then(() => setRefreshing(false));
  }, []);

  // Função para abrir link de transmissão
  const openWatchLink = () => {
    Linking.openURL(
      "https://www.youtube.com/results?search_query=botafogo+mundial+de+clubes+ao+vivo"
    );
  };

  // Renderizar card do próximo jogo
  const renderMatchCard = () => {
    if (!nextMatch) return null;

    const {
      teams,
      competition,
      formattedDateTime,
      venue,
      round,
      status,
      elapsed,
    } = nextMatch;
    const isLive = status === "LIVE";

    return (
      <View style={styles.matchCard}>
        {/* Cabeçalho do card */}
        <View style={styles.cardHeader}>
          <Text style={styles.competitionName}>{competition}</Text>
          <Text style={styles.roundInfo}>{round}</Text>

          {/* Mostrar badge de ao vivo se aplicável */}
          {isLive && (
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>AO VIVO</Text>
            </View>
          )}

          <Text style={styles.dateTime}>{formattedDateTime}</Text>
          <Text style={styles.venue}>{venue}</Text>
        </View>

        {/* Conteúdo do jogo */}
        <View style={styles.matchContent}>
          {/* Time da casa */}
          <View style={styles.teamContainer}>
            <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />
            <Text
              style={[
                styles.teamName,
                teams.home.isBotafogo && styles.botafogoText,
              ]}
            >
              {teams.home.name}
            </Text>
          </View>

          {/* Placar / vs */}
          <View style={styles.scoreContainer}>
            {isLive || status === "FINISHED" ? (
              <>
                <Text style={styles.score}>{teams.home.score || 0}</Text>
                <Text style={styles.scoreX}>X</Text>
                <Text style={styles.score}>{teams.away.score || 0}</Text>
                {elapsed && <Text style={styles.elapsed}>{elapsed}</Text>}
              </>
            ) : (
              <Text style={styles.scoreX}>X</Text>
            )}
          </View>

          {/* Time visitante */}
          <View style={styles.teamContainer}>
            <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
            <Text
              style={[
                styles.teamName,
                teams.away.isBotafogo && styles.botafogoText,
              ]}
            >
              {teams.away.name}
            </Text>
          </View>
        </View>

        {/* Botões de ação */}
        {isLive && (
          <TouchableOpacity style={styles.watchButton} onPress={openWatchLink}>
            <Ionicons name="play-circle-outline" size={18} color="#000" />
            <Text style={styles.watchButtonText}>Assistir ao jogo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mundial de Clubes</Text>
          <Text style={styles.headerSubtitle}>
            FIFA Club World Cup - Grupo B
          </Text>
        </View>

        {/* Card do próximo jogo - nova adição */}
        {loading ? (
          <View style={styles.loadingMatchCard}>
            <ActivityIndicator size="large" color="#D1AC00" />
            <Text style={styles.loadingMatchText}>
              Carregando próximo jogo...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorMatchCard}>
            <Text style={styles.errorMatchText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadNextMatch}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Próximo Jogo</Text>
            {renderMatchCard()}
          </View>
        )}

        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Classificação - Grupo B</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              O Botafogo está no Grupo B do novo formato do Mundial de Clubes da
              FIFA, que acontecerá em 2025 nos Estados Unidos.
            </Text>
          </View>

          <View style={styles.webviewContainer}>
            {tableLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D1AC00" />
                <Text style={styles.loadingText}>
                  Carregando classificação...
                </Text>
              </View>
            )}
            <WebView
              source={{
                uri: "https://widgets.sofascore.com/pt-BR/embed/tournament/142880/season/69619/standings/Group%20B?widgetTitle=Group%20B&showCompetitionLogo=true",
              }}
              style={styles.webview}
              onLoad={() => setTableLoading(false)}
              originWhitelist={["*"]}
              scrollEnabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>

          <TouchableOpacity
            style={styles.attributionContainer}
            onPress={() => Linking.openURL(sofascoreUrl)}
          >
            <Text style={styles.attributionText}>
              Classificação fornecida por Sofascore
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Formato da Competição</Text>
          <Text style={styles.infoText}>
            O novo Mundial de Clubes terá 32 equipes divididas em 8 grupos de 4
            times.
          </Text>
          <Text style={styles.infoText}>
            Os dois primeiros de cada grupo avançam para as oitavas de final,
            seguindo em formato eliminatório até a final.
          </Text>
          <Text style={styles.infoText}>
            O Botafogo se classificou como campeão da Libertadores 2024 e está
            no Grupo B ao lado de clubes de elite do futebol mundial.
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Perguntas Frequentes</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Quando será realizado o Mundial de Clubes?
            </Text>
            <Text style={styles.faqAnswer}>
              O novo Mundial de Clubes da FIFA será disputado de 15 de junho a
              13 de julho de 2025 nos Estados Unidos.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Como o Botafogo se classificou?
            </Text>
            <Text style={styles.faqAnswer}>
              O Botafogo conquistou a vaga ao vencer a Copa Libertadores da
              América de 2024.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Quais outros times brasileiros participarão?
            </Text>
            <Text style={styles.faqAnswer}>
              Além do Botafogo, o Brasil será representado pelo Palmeiras e pelo
              Flamengo, que conquistaram as edições anteriores da Libertadores.
            </Text>
          </View>
        </View>

        {/* Botão de atualizar */}
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={18} color="#fff" />
          <Text style={styles.refreshButtonText}>Atualizar informações</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#999999",
    marginTop: 4,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 12,
    textAlign: "center",
  },
  descriptionContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  description: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    textAlign: "center",
  },
  webviewContainer: {
    height: 431,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    color: "#666666",
  },
  attributionContainer: {
    alignItems: "center",
  },
  attributionText: {
    fontSize: 12,
    color: "#008fd7",
    textDecorationLine: "underline",
  },
  infoText: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 12,
    lineHeight: 20,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
  },

  // Novos estilos para o card do próximo jogo
  matchCard: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  cardHeader: {
    marginBottom: 12,
  },
  competitionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D1AC00",
    textAlign: "center",
  },
  roundInfo: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  dateTime: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginTop: 6,
  },
  venue: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  matchContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  teamContainer: {
    flex: 2,
    alignItems: "center",
  },
  teamLogo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 6,
  },
  teamName: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  botafogoText: {
    color: "#000",
    fontWeight: "bold",
  },
  scoreContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  scoreX: {
    fontSize: 16,
    color: "#666",
    marginVertical: 2,
  },
  elapsed: {
    fontSize: 11,
    color: "#D1AC00",
    marginTop: 2,
    fontWeight: "bold",
  },
  liveIndicator: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: "center",
  },
  liveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  watchButton: {
    backgroundColor: "#D1AC00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
  },
  watchButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
  },
  loadingMatchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 180,
  },
  loadingMatchText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  errorMatchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 180,
  },
  errorMatchText: {
    color: "#ff4d4d",
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#D1AC00",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  refreshButton: {
    backgroundColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    margin: 16,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
