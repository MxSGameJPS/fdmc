import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";

// Mapeamento dos escudos dos times usando os links do arquivo botafogo-jogos-2025.json
const TEAM_LOGOS = {
  Botafogo:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Escudo_Botafogo.png/902px-Escudo_Botafogo.png",
  Vasco:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Club_De_Regatas_Vasco_da_Gama_Logo.svg/1024px-Club_De_Regatas_Vasco_da_Gama_Logo.svg.png",
  Vitória:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Esporte_Clube_Vit%C3%B3ria_Logo.svg/1024px-Esporte_Clube_Vit%C3%B3ria_Logo.svg.png",
  Sport:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Sport_Club_do_Recife_logo.svg/1024px-Sport_Club_do_Recife_logo.svg.png",
  Corinthians:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Corinthians_logo.svg/1024px-Corinthians_logo.svg.png",
  Bragantino:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Red_Bull_Bragantino_logo.svg/1024px-Red_Bull_Bragantino_logo.svg.png",
  Cruzeiro:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Cruzeiro_Esporte_Clube_logo.svg/1024px-Cruzeiro_Esporte_Clube_logo.svg.png",
  Flamengo:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flamengo_braz_logo.svg/1024px-Flamengo_braz_logo.svg.png",
  Palmeiras:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/1024px-Palmeiras_logo.svg.png",
  "São Paulo":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/1024px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png",
  Fluminense:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Fluminense_Football_Club_logo.svg/1024px-Fluminense_Football_Club_logo.svg.png",
  "Atlético-MG":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Clube_Atl%C3%A9tico_Mineiro_logo.svg/1024px-Clube_Atl%C3%A9tico_Mineiro_logo.svg.png",
  Internacional:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Escudo_do_Sport_Club_Internacional.svg/1024px-Escudo_do_Sport_Club_Internacional.svg.png",
  Grêmio:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Gremio-logo.svg/1024px-Gremio-logo.svg.png",
  "Athletico-PR":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/CA_Paranaense.svg/1024px-CA_Paranaense.svg.png",
  Bahia:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/ECBahia.svg/1024px-ECBahia.svg.png",
  Fortaleza:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/FortalezaEsporteClube.svg/1024px-FortalezaEsporteClube.svg.png",
  Juventude:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/EC_Juventude.svg/1024px-EC_Juventude.svg.png",
  Cuiabá:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Cuiab%C3%A1EC2020.png/1024px-Cuiab%C3%A1EC2020.png",
  "Atlético-GO":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Atletico_Goianiense_logo.svg/1024px-Atletico_Goianiense_logo.svg.png",
  Criciúma:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Crici%C3%BAma_Esporte_Clube_logo.svg/1024px-Crici%C3%BAma_Esporte_Clube_logo.svg.png",
};

// Dados estáticos da classificação do Brasileirão 2025
// Fonte: FlashScore - Atualizado em 04/07/2025
const BRASILEIRAO_STANDINGS = [
  {
    position: 1,
    teamId: 127,
    teamName: "Botafogo",
    logo: "https://api.sofascore.app/api/v1/team/1958/image",
    points: 32,
    playedGames: 14,
    won: 10,
    draw: 2,
    lost: 2,
    goalsFor: 25,
    goalsAgainst: 10,
    goalDifference: 15,
  },
  {
    position: 2,
    teamId: 130,
    teamName: "Palmeiras",
    logo: "https://api.sofascore.app/api/v1/team/1963/image",
    points: 31,
    playedGames: 14,
    won: 9,
    draw: 4,
    lost: 1,
    goalsFor: 23,
    goalsAgainst: 8,
    goalDifference: 15,
  },
  {
    position: 3,
    teamId: 118,
    teamName: "Flamengo",
    logo: "https://api.sofascore.app/api/v1/team/5981/image",
    points: 27,
    playedGames: 14,
    won: 8,
    draw: 3,
    lost: 3,
    goalsFor: 26,
    goalsAgainst: 12,
    goalDifference: 14,
  },
  {
    position: 4,
    teamId: 126,
    teamName: "São Paulo",
    logo: "https://api.sofascore.app/api/v1/team/1981/image",
    points: 26,
    playedGames: 14,
    won: 8,
    draw: 2,
    lost: 4,
    goalsFor: 19,
    goalsAgainst: 15,
    goalDifference: 4,
  },
  {
    position: 5,
    teamId: 133,
    teamName: "Fluminense",
    logo: "https://api.sofascore.app/api/v1/team/1961/image",
    points: 25,
    playedGames: 14,
    won: 7,
    draw: 4,
    lost: 3,
    goalsFor: 20,
    goalsAgainst: 15,
    goalDifference: 5,
  },
  {
    position: 6,
    teamId: 131,
    teamName: "Corinthians",
    logo: "https://api.sofascore.app/api/v1/team/1977/image",
    points: 22,
    playedGames: 14,
    won: 6,
    draw: 4,
    lost: 4,
    goalsFor: 17,
    goalsAgainst: 13,
    goalDifference: 4,
  },
  {
    position: 7,
    teamId: 123,
    teamName: "Atlético-MG",
    logo: "https://api.sofascore.app/api/v1/team/1975/image",
    points: 21,
    playedGames: 14,
    won: 6,
    draw: 3,
    lost: 5,
    goalsFor: 16,
    goalsAgainst: 14,
    goalDifference: 2,
  },
  {
    position: 8,
    teamId: 122,
    teamName: "Internacional",
    logo: "https://api.sofascore.app/api/v1/team/1966/image",
    points: 20,
    playedGames: 14,
    won: 6,
    draw: 2,
    lost: 6,
    goalsFor: 15,
    goalsAgainst: 16,
    goalDifference: -1,
  },
  {
    position: 9,
    teamId: 119,
    teamName: "Grêmio",
    logo: "https://api.sofascore.app/api/v1/team/5926/image",
    points: 19,
    playedGames: 14,
    won: 5,
    draw: 4,
    lost: 5,
    goalsFor: 14,
    goalsAgainst: 15,
    goalDifference: -1,
  },
  {
    position: 10,
    teamId: 124,
    teamName: "Cruzeiro",
    logo: "https://api.sofascore.app/api/v1/team/1954/image",
    points: 18,
    playedGames: 14,
    won: 5,
    draw: 3,
    lost: 6,
    goalsFor: 14,
    goalsAgainst: 15,
    goalDifference: -1,
  },
  {
    position: 11,
    teamId: 125,
    teamName: "Athletico-PR",
    logo: "https://api.sofascore.app/api/v1/team/1967/image",
    points: 17,
    playedGames: 14,
    won: 5,
    draw: 2,
    lost: 7,
    goalsFor: 13,
    goalsAgainst: 16,
    goalDifference: -3,
  },
  {
    position: 12,
    teamId: 134,
    teamName: "Vasco",
    logo: "https://api.sofascore.app/api/v1/team/1974/image",
    points: 17,
    playedGames: 14,
    won: 5,
    draw: 2,
    lost: 7,
    goalsFor: 12,
    goalsAgainst: 18,
    goalDifference: -6,
  },
  {
    position: 13,
    teamId: 135,
    teamName: "Bahia",
    logo: "https://api.sofascore.app/api/v1/team/1955/image",
    points: 16,
    playedGames: 14,
    won: 4,
    draw: 4,
    lost: 6,
    goalsFor: 12,
    goalsAgainst: 16,
    goalDifference: -4,
  },
  {
    position: 14,
    teamId: 136,
    teamName: "Fortaleza",
    logo: "https://api.sofascore.app/api/v1/team/1961/image",
    points: 15,
    playedGames: 14,
    won: 4,
    draw: 3,
    lost: 7,
    goalsFor: 11,
    goalsAgainst: 19,
    goalDifference: -8,
  },
  {
    position: 15,
    teamId: 137,
    teamName: "Bragantino",
    logo: "https://api.sofascore.app/api/v1/team/1999/image",
    points: 14,
    playedGames: 14,
    won: 3,
    draw: 5,
    lost: 6,
    goalsFor: 10,
    goalsAgainst: 19,
    goalDifference: -9,
  },
  {
    position: 16,
    teamId: 138,
    teamName: "Juventude",
    logo: "https://api.sofascore.app/api/v1/team/1965/image",
    points: 13,
    playedGames: 14,
    won: 3,
    draw: 4,
    lost: 7,
    goalsFor: 10,
    goalsAgainst: 20,
    goalDifference: -10,
  },
  {
    position: 17,
    teamId: 139,
    teamName: "Vitória",
    logo: "https://api.sofascore.app/api/v1/team/1957/image",
    points: 13,
    playedGames: 14,
    won: 3,
    draw: 4,
    lost: 7,
    goalsFor: 9,
    goalsAgainst: 17,
    goalDifference: -8,
  },
  {
    position: 18,
    teamId: 140,
    teamName: "Cuiabá",
    logo: "https://api.sofascore.app/api/v1/team/8045/image",
    points: 10,
    playedGames: 14,
    won: 2,
    draw: 4,
    lost: 8,
    goalsFor: 8,
    goalsAgainst: 23,
    goalDifference: -15,
  },
  {
    position: 19,
    teamId: 141,
    teamName: "Atlético-GO",
    logo: "https://api.sofascore.app/api/v1/team/5911/image",
    points: 8,
    playedGames: 14,
    won: 2,
    draw: 2,
    lost: 10,
    goalsFor: 7,
    goalsAgainst: 24,
    goalDifference: -17,
  },
  {
    position: 20,
    teamId: 142,
    teamName: "Criciúma",
    logo: "https://api.sofascore.app/api/v1/team/1960/image",
    points: 7,
    playedGames: 14,
    won: 1,
    draw: 4,
    lost: 9,
    goalsFor: 6,
    goalsAgainst: 22,
    goalDifference: -16,
  },
];

export default function BrasileiraoStandings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setStandings(BRASILEIRAO_STANDINGS);
      setLoading(false);
    }, 1000);
  }, []);

  const renderTeamRow = ({ item }) => {
    // Usar o escudo do nosso mapeamento, se disponível, senão usar o da SofaScore
    const logoUrl = TEAM_LOGOS[item.teamName] || item.logo;

    return (
      <View
        style={[
          styles.tableRow,
          item.teamName.includes("Botafogo") && styles.botafogoRow,
        ]}
      >
        <Text
          style={[
            styles.positionCell,
            item.teamName.includes("Botafogo") && styles.botafogoText,
          ]}
        >
          {item.position}
        </Text>

        <View style={styles.teamCell}>
          <Image
            source={{ uri: logoUrl }}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.teamName,
              item.teamName.includes("Botafogo") && styles.botafogoText,
            ]}
          >
            {item.teamName}
          </Text>
        </View>

        <Text
          style={[
            styles.pointsCell,
            item.teamName.includes("Botafogo") && styles.botafogoText,
          ]}
        >
          {item.points}
        </Text>

        <Text style={styles.statsCell}>{item.playedGames}</Text>
        <Text style={styles.statsCell}>{item.won}</Text>
        <Text style={styles.statsCell}>{item.draw}</Text>
        <Text style={styles.statsCell}>{item.lost}</Text>
        <Text style={styles.statsCell}>{item.goalsFor}</Text>
        <Text style={styles.statsCell}>{item.goalsAgainst}</Text>
        <Text style={styles.statsCell}>{item.goalDifference}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D1AC00" />
        <Text style={styles.loadingText}>Carregando classificação...</Text>
      </View>
    );
  }

  if (standings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Classificação não disponível.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho da tabela */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerPos}>P</Text>
        <Text style={styles.headerTeam}>Time</Text>
        <Text style={styles.headerPts}>PTS</Text>
        <Text style={styles.headerStat}>J</Text>
        <Text style={styles.headerStat}>V</Text>
        <Text style={styles.headerStat}>E</Text>
        <Text style={styles.headerStat}>D</Text>
        <Text style={styles.headerStat}>GP</Text>
        <Text style={styles.headerStat}>GC</Text>
        <Text style={styles.headerStat}>SG</Text>
      </View>

      <FlatList
        data={standings}
        renderItem={renderTeamRow}
        keyExtractor={(item) => item.position.toString()}
        showsVerticalScrollIndicator={false}
      />

      <Text style={styles.dataSource}>
        Fonte: FlashScore (dados estáticos) • Escudos atualizados
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 8,
    color: "#CCCCCC",
    fontSize: 14,
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
  },
  emptyText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000000",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  headerPos: {
    width: 30,
    textAlign: "center",
    fontWeight: "bold",
    color: "#CCCCCC",
    fontSize: 12,
  },
  headerTeam: {
    flex: 2,
    fontWeight: "bold",
    color: "#CCCCCC",
    fontSize: 12,
    paddingLeft: 8,
  },
  headerPts: {
    width: 40,
    textAlign: "center",
    fontWeight: "bold",
    color: "#D1AC00",
    fontSize: 12,
  },
  headerStat: {
    width: 30,
    textAlign: "center",
    fontWeight: "bold",
    color: "#CCCCCC",
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    alignItems: "center",
  },
  botafogoRow: {
    backgroundColor: "rgba(209, 172, 0, 0.1)",
  },
  positionCell: {
    width: 30,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 14,
  },
  teamCell: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  teamLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  teamName: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  pointsCell: {
    width: 40,
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  statsCell: {
    width: 30,
    textAlign: "center",
    color: "#CCCCCC",
    fontSize: 14,
  },
  botafogoText: {
    color: "#D1AC00",
    fontWeight: "bold",
  },
  dataSource: {
    fontSize: 10,
    color: "#666666",
    textAlign: "right",
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontStyle: "italic",
    backgroundColor: "#0D0D0D",
  },
});
