import moment from "moment";
import "moment/locale/pt-br";
import { Image, StyleSheet, Text, View } from "react-native";

moment.locale("pt-br");

const MatchCard = ({ match, isSpecial = false }) => {
  // Verificar se é um jogo do Mundial
  const isWorldCupMatch = match.league.id === 15 || match.league.id === 6922;

  // Aplicar estilos especiais se for um jogo do Mundial ou se a flag isSpecial estiver ativa
  const cardStyle = [
    styles.card,
    (isSpecial || isWorldCupMatch) && styles.specialCard,
  ];

  // Formatar a data do jogo
  const matchDate = moment(match.fixture.date);
  const formattedDate = matchDate.format("DD [de] MMMM [de] YYYY");
  const formattedTime = matchDate.format("HH:mm");

  return (
    <View style={cardStyle}>
      {(isSpecial || isWorldCupMatch) && (
        <View style={styles.specialBadge}>
          <Text style={styles.specialBadgeText}>Mundial de Clubes</Text>
        </View>
      )}

      <View style={styles.leagueInfo}>
        <Image
          source={{ uri: match.league.logo }}
          style={styles.leagueLogo}
          resizeMode="contain"
        />
        <Text style={styles.leagueText}>{match.league.name}</Text>
        <Text style={styles.roundText}>{match.league.round}</Text>
      </View>

      <View style={styles.matchInfo}>
        <Text style={styles.dateText}>
          {formattedDate} • {formattedTime}
        </Text>
        <Text style={styles.venueText}>
          {match.fixture.venue.name}, {match.fixture.venue.city}
        </Text>
      </View>

      <View style={styles.teamsContainer}>
        <View style={styles.teamInfo}>
          <Image
            source={{ uri: match.teams.home.logo }}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamName}>{match.teams.home.name}</Text>
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.teamInfo}>
          <Image
            source={{ uri: match.teams.away.logo }}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamName}>{match.teams.away.name}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  specialCard: {
    backgroundColor: "#FFF9E5",
    borderWidth: 1,
    borderColor: "#D1AC00",
  },
  specialBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#D1AC00",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    zIndex: 1,
  },
  specialBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  leagueInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  leagueLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  leagueText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginRight: 8,
  },
  roundText: {
    fontSize: 12,
    color: "#888",
  },
  matchInfo: {
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  venueText: {
    fontSize: 14,
    color: "#666",
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
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  vsContainer: {
    flex: 1,
    alignItems: "center",
  },
  vsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D1AC00",
  },
});

export default MatchCard;
