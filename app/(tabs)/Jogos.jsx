import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import moment from "moment";
import "moment/locale/pt-br";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Importar o serviço
import {
  clearBotafogoCache,
  getUpcomingBotafogoMatches,
} from "../../services/botafogo/calendar";

moment.locale("pt-br");


export default function Jogos() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Função para carregar jogos
  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const upcomingMatches = await getUpcomingBotafogoMatches();
      setMatches(upcomingMatches || []);
    } catch (error) {
      console.error("Erro ao carregar jogos:", error);
      setError(
        "Não foi possível carregar os jogos. Puxe para baixo para tentar novamente."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await clearBotafogoCache();
    loadMatches();
  };

  

    // Verificar cada chave do objeto SOFASCORE_IDS
  

 

  const renderMatchItem = ({ item }) => {
    // Formatar a data para exibição
    const matchDate = item.date
      ? moment(item.date).format("DD [de] MMMM [de] YYYY")
      : "";

 

    return (
      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <Text style={styles.competitionName}>{item.competition}</Text>
          <Text style={styles.matchDate}>
            {matchDate} • {item.time}
          </Text>
          <Text style={styles.venueText}>{item.venue}</Text>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.teamInfo}>
            <Image
              source={{
                uri:
                  item.teams.home.logo ||
                  "https://www.botafogo.com.br/img/escudo.png",
              }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.teamName,
                item.teams.home.isBotafogo && styles.botafogoTeam,
              ]}
            >
              {item.teams.home.name}
            </Text>
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>x</Text>
          </View>

          <View style={styles.teamInfo}>
            <Image
              source={{
                uri:
                  item.teams.away.logo ||
                  "https://www.botafogo.com.br/img/escudo.png",
              }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.teamName,
                item.teams.away.isBotafogo && styles.botafogoTeam,
              ]}
            >
              {item.teams.away.name}
            </Text>
          </View>
        </View>

        
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Carregando jogos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Próximos Jogos</Text>
        <Text style={styles.headerSubtitle}>Dados oficiais do Botafogo</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            Puxe para baixo para tentar novamente
          </Text>
        </View>
      ) : null}

      <FlatList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.matchesContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ffffff"]}
            tintColor="#ffffff"
          />
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum jogo confirmado para o período
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ffffff",
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
  matchesContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    color: "#aaaaaa",
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#aaaaaa",
    fontSize: 16,
    textAlign: "center",
  },
  matchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  matchHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingBottom: 12,
  },
  competitionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 4,
  },
  matchDate: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 4,
  },
  venueText: {
    fontSize: 12,
    color: "#000000",
  },
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamInfo: {
    flex: 2,
    alignItems: "center",
  },
  teamLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#000000",
  },
  botafogoTeam: {
    fontWeight: "bold",
    color: "#D1AC00",
  },
  vsContainer: {
    flex: 1,
    alignItems: "center",
  },
  vsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  widgetContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 16,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 12,
    textAlign: "center",
  },
  webviewWrapper: {
    height: 286,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
  attributionContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  attribution: {
    fontSize: 12,
    color: "#008fd7",
    textDecorationLine: "underline",
  },
});
