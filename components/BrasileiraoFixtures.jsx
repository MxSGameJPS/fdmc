import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Dados obtidos do calendário oficial do Brasileirão Betano 2025
// Atualizado em 04/07/2025
const BRASILEIRAO_FIXTURES = [
  // Rodada 13
  {
    id: 1301,
    date: "2025-07-12T16:30:00-03:00",
    homeTeam: {
      id: 127,
      name: "Flamengo",
      logo: "https://api.sofascore.app/api/v1/team/5981/image",
    },
    awayTeam: {
      id: 130,
      name: "São Paulo",
      logo: "https://api.sofascore.app/api/v1/team/1981/image",
    },
    venue: "Maracanã",
    round: "Rodada 13",
  },
  {
    id: 1302,
    date: "2025-07-12T16:30:00-03:00",
    homeTeam: {
      id: 126,
      name: "Internacional",
      logo: "https://api.sofascore.app/api/v1/team/1966/image",
    },
    awayTeam: {
      id: 127,
      name: "Vitória",
      logo: "https://api.sofascore.app/api/v1/team/1960/image",
    },
    venue: "Beira-Rio",
    round: "Rodada 13",
  },
  {
    id: 1303,
    date: "2025-07-12T18:30:00-03:00",
    homeTeam: {
      id: 127,
      name: "Vasco",
      logo: "https://api.sofascore.app/api/v1/team/1974/image",
    },
    awayTeam: {
      id: 131,
      name: "Botafogo",
      logo: "https://api.sofascore.app/api/v1/team/1958/image",
    },
    venue: "São Januário",
    round: "Rodada 13",
  },
  {
    id: 1304,
    date: "2025-07-12T21:00:00-03:00",
    homeTeam: {
      id: 118,
      name: "Bahia",
      logo: "https://api.sofascore.app/api/v1/team/1955/image",
    },
    awayTeam: {
      id: 127,
      name: "Atlético-MG",
      logo: "https://api.sofascore.app/api/v1/team/1975/image",
    },
    venue: "Arena Fonte Nova",
    round: "Rodada 13",
  },
  {
    id: 1305,
    date: "2025-07-13T19:00:00-03:00",
    homeTeam: {
      id: 127,
      name: "Corinthians",
      logo: "https://api.sofascore.app/api/v1/team/1977/image",
    },
    awayTeam: {
      id: 133,
      name: "Red Bull Bragantino",
      logo: "https://api.sofascore.app/api/v1/team/1999/image",
    },
    venue: "Neo Química Arena",
    round: "Rodada 13",
  },
  {
    id: 1306,
    date: "2025-07-13T20:30:00-03:00",
    homeTeam: {
      id: 119,
      name: "Cruzeiro",
      logo: "https://api.sofascore.app/api/v1/team/1954/image",
    },
    awayTeam: {
      id: 127,
      name: "Grêmio",
      logo: "https://api.sofascore.app/api/v1/team/5926/image",
    },
    venue: "Mineirão",
    round: "Rodada 13",
  },
  {
    id: 1307,
    date: "2025-07-13T20:30:00-03:00",
    homeTeam: {
      id: 127,
      name: "Fortaleza",
      logo: "https://api.sofascore.app/api/v1/team/1961/image",
    },
    awayTeam: {
      id: 122,
      name: "Ceará",
      logo: "https://api.sofascore.app/api/v1/team/1957/image",
    },
    venue: "Castelão",
    round: "Rodada 13",
  },
  {
    id: 1308,
    date: "2025-07-14T20:00:00-03:00",
    homeTeam: {
      id: 123,
      name: "Juventude",
      logo: "https://api.sofascore.app/api/v1/team/1964/image",
    },
    awayTeam: {
      id: 127,
      name: "Sport",
      logo: "https://api.sofascore.app/api/v1/team/1959/image",
    },
    venue: "Alfredo Jaconi",
    round: "Rodada 13",
  },

  // Rodada 14
  {
    id: 1401,
    date: "2025-07-16T19:00:00-03:00",
    homeTeam: {
      id: 127,
      name: "Palmeiras",
      logo: "https://api.sofascore.app/api/v1/team/1963/image",
    },
    awayTeam: {
      id: 130,
      name: "Mirassol",
      logo: "https://api.sofascore.app/api/v1/team/1970/image",
    },
    venue: "Allianz Parque",
    round: "Rodada 14",
  },
  {
    id: 1402,
    date: "2025-07-16T19:30:00-03:00",
    homeTeam: {
      id: 126,
      name: "Ceará",
      logo: "https://api.sofascore.app/api/v1/team/1957/image",
    },
    awayTeam: {
      id: 127,
      name: "Corinthians",
      logo: "https://api.sofascore.app/api/v1/team/1977/image",
    },
    venue: "Castelão",
    round: "Rodada 14",
  },
  {
    id: 1403,
    date: "2025-07-16T20:00:00-03:00",
    homeTeam: {
      id: 127,
      name: "Santos",
      logo: "https://api.sofascore.app/api/v1/team/1968/image",
    },
    awayTeam: {
      id: 131,
      name: "Flamengo",
      logo: "https://api.sofascore.app/api/v1/team/5981/image",
    },
    venue: "Vila Belmiro",
    round: "Rodada 14",
  },
  {
    id: 1404,
    date: "2025-07-16T21:30:00-03:00",
    homeTeam: {
      id: 118,
      name: "Botafogo",
      logo: "https://api.sofascore.app/api/v1/team/1958/image",
    },
    awayTeam: {
      id: 127,
      name: "Vitória",
      logo: "https://api.sofascore.app/api/v1/team/1960/image",
    },
    venue: "Nilton Santos",
    round: "Rodada 14",
  },
  {
    id: 1405,
    date: "2025-07-16T21:30:00-03:00",
    homeTeam: {
      id: 127,
      name: "Red Bull Bragantino",
      logo: "https://api.sofascore.app/api/v1/team/1999/image",
    },
    awayTeam: {
      id: 133,
      name: "São Paulo",
      logo: "https://api.sofascore.app/api/v1/team/1981/image",
    },
    venue: "Nabi Abi Chedid",
    round: "Rodada 14",
  },
  {
    id: 1406,
    date: "2025-07-17T19:30:00-03:00",
    homeTeam: {
      id: 119,
      name: "Fluminense",
      logo: "https://api.sofascore.app/api/v1/team/1961/image",
    },
    awayTeam: {
      id: 127,
      name: "Cruzeiro",
      logo: "https://api.sofascore.app/api/v1/team/1954/image",
    },
    venue: "Maracanã",
    round: "Rodada 14",
  },

  // Rodada 15
  {
    id: 1501,
    date: "2025-07-19T16:00:00-03:00",
    homeTeam: {
      id: 127,
      name: "Fortaleza",
      logo: "https://api.sofascore.app/api/v1/team/1961/image",
    },
    awayTeam: {
      id: 131,
      name: "Bahia",
      logo: "https://api.sofascore.app/api/v1/team/1955/image",
    },
    venue: "Castelão",
    round: "Rodada 15",
  },
  {
    id: 1502,
    date: "2025-07-19T17:30:00-03:00",
    homeTeam: {
      id: 126,
      name: "Vasco",
      logo: "https://api.sofascore.app/api/v1/team/1974/image",
    },
    awayTeam: {
      id: 127,
      name: "Grêmio",
      logo: "https://api.sofascore.app/api/v1/team/5926/image",
    },
    venue: "São Januário",
    round: "Rodada 15",
  },
  {
    id: 1503,
    date: "2025-07-19T18:30:00-03:00",
    homeTeam: {
      id: 128,
      name: "Mirassol",
      logo: "https://api.sofascore.app/api/v1/team/1970/image",
    },
    awayTeam: {
      id: 135,
      name: "Santos",
      logo: "https://api.sofascore.app/api/v1/team/1968/image",
    },
    venue: "José Maria de Campos Maia",
    round: "Rodada 15",
  },
  {
    id: 1504,
    date: "2025-07-19T21:00:00-03:00",
    homeTeam: {
      id: 129,
      name: "São Paulo",
      logo: "https://api.sofascore.app/api/v1/team/1981/image",
    },
    awayTeam: {
      id: 136,
      name: "Corinthians",
      logo: "https://api.sofascore.app/api/v1/team/1977/image",
    },
    venue: "Morumbi",
    round: "Rodada 15",
  },
  {
    id: 1505,
    date: "2025-07-20T11:00:00-03:00",
    homeTeam: {
      id: 130,
      name: "Internacional",
      logo: "https://api.sofascore.app/api/v1/team/1966/image",
    },
    awayTeam: {
      id: 137,
      name: "Ceará",
      logo: "https://api.sofascore.app/api/v1/team/1957/image",
    },
    venue: "Beira-Rio",
    round: "Rodada 15",
  },
  {
    id: 1506,
    date: "2025-07-20T16:00:00-03:00",
    homeTeam: {
      id: 131,
      name: "Cruzeiro",
      logo: "https://api.sofascore.app/api/v1/team/1954/image",
    },
    awayTeam: {
      id: 138,
      name: "Juventude",
      logo: "https://api.sofascore.app/api/v1/team/1964/image",
    },
    venue: "Mineirão",
    round: "Rodada 15",
  },
  {
    id: 1507,
    date: "2025-07-20T16:00:00-03:00",
    homeTeam: {
      id: 132,
      name: "Vitória",
      logo: "https://api.sofascore.app/api/v1/team/1960/image",
    },
    awayTeam: {
      id: 139,
      name: "Red Bull Bragantino",
      logo: "https://api.sofascore.app/api/v1/team/1999/image",
    },
    venue: "Barradão",
    round: "Rodada 15",
  },
  {
    id: 1508,
    date: "2025-07-20T17:30:00-03:00",
    homeTeam: {
      id: 133,
      name: "Palmeiras",
      logo: "https://api.sofascore.app/api/v1/team/1963/image",
    },
    awayTeam: {
      id: 140,
      name: "Atlético-MG",
      logo: "https://api.sofascore.app/api/v1/team/1975/image",
    },
    venue: "Allianz Parque",
    round: "Rodada 15",
  },
  {
    id: 1509,
    date: "2025-07-20T17:30:00-03:00",
    homeTeam: {
      id: 134,
      name: "Sport",
      logo: "https://api.sofascore.app/api/v1/team/1959/image",
    },
    awayTeam: {
      id: 141,
      name: "Botafogo",
      logo: "https://api.sofascore.app/api/v1/team/1958/image",
    },
    venue: "Ilha do Retiro",
    round: "Rodada 15",
  },
  {
    id: 1510,
    date: "2025-07-20T19:30:00-03:00",
    homeTeam: {
      id: 135,
      name: "Flamengo",
      logo: "https://api.sofascore.app/api/v1/team/5981/image",
    },
    awayTeam: {
      id: 142,
      name: "Fluminense",
      logo: "https://api.sofascore.app/api/v1/team/1961/image",
    },
    venue: "Maracanã",
    round: "Rodada 15",
  },
];

export default function BrasileiraoFixtures({
  limit = 5,
  onlyBotafogo = false,
}) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      // Filtrar apenas jogos do Botafogo se onlyBotafogo for true
      const filteredMatches = onlyBotafogo
        ? BRASILEIRAO_FIXTURES.filter(
            (match) =>
              match.homeTeam.name.includes("Botafogo") ||
              match.awayTeam.name.includes("Botafogo")
          ).slice(0, limit)
        : BRASILEIRAO_FIXTURES.slice(0, limit);

      setMatches(filteredMatches);
      setLoading(false);
    }, 1000);
  }, [limit, onlyBotafogo]);

  const formatMatchDate = (dateString) => {
    const date = new Date(dateString);

    const dia = date
      .toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      })
      .replace(",", "");

    const hora = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${dia} - ${hora}`;
  };

  const renderMatch = ({ item }) => (
    <View style={styles.matchCard}>
      <Text style={styles.roundText}>{item.round}</Text>
      <Text style={styles.dateText}>{formatMatchDate(item.date)}</Text>

      <View style={styles.teamsContainer}>
        <View style={styles.teamContainer}>
          <Image
            source={{ uri: item.homeTeam.logo }}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.teamName,
              item.homeTeam.name.includes("Botafogo") && styles.botafogoTeam,
            ]}
          >
            {item.homeTeam.name}
          </Text>
        </View>

        <View style={styles.versusContainer}>
          <Text style={styles.versusText}>vs</Text>
        </View>

        <View style={styles.teamContainer}>
          <Image
            source={{ uri: item.awayTeam.logo }}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.teamName,
              item.awayTeam.name.includes("Botafogo") && styles.botafogoTeam,
            ]}
          >
            {item.awayTeam.name}
          </Text>
        </View>
      </View>

      <Text style={styles.venueText}>
        <Ionicons name="location-outline" size={12} color="#888" /> {item.venue}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D1AC00" />
        <Text style={styles.loadingText}>Carregando próximos jogos...</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Não há próximos jogos disponíveis.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      <Text style={styles.dataSource}>Fonte: FlashScore (dados estáticos)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  listContent: {
    paddingRight: 16,
  },
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#CCCCCC",
    fontSize: 14,
  },
  emptyContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
  },
  emptyText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  matchCard: {
    width: 260,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 12,
    marginLeft: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: "#D1AC00",
  },
  roundText: {
    color: "#D1AC00",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 13,
    marginBottom: 12,
    fontWeight: "500",
  },
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 6,
    padding: 10,
  },
  teamContainer: {
    flex: 2,
    alignItems: "center",
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  teamName: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  botafogoTeam: {
    color: "#D1AC00",
    fontWeight: "bold",
  },
  versusContainer: {
    flex: 0.5,
    alignItems: "center",
  },
  versusText: {
    color: "#666666",
    fontSize: 12,
  },
  venueText: {
    color: "#888888",
    fontSize: 11,
    textAlign: "center",
  },
  dataSource: {
    fontSize: 10,
    color: "#666666",
    textAlign: "right",
    marginTop: 8,
    marginRight: 16,
    fontStyle: "italic",
  },
});
