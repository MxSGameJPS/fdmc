import axios from "axios";
import moment from "moment-timezone";

// Configuração da API
const API_KEY = "242257";
const BASE_URL = "https://www.thesportsdb.com/api/v2/json";

// ID da liga FIFA Club World Cup
const FIFA_CLUB_WORLD_CUP_ID = "6922";

// Cliente axios com configurações base
const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

/**
 * Converte horário UTC para Brasília
 * @param {string} dateTimeStr - Data e hora no formato da API
 * @returns {Object} - Objeto com data formatada e horário
 */
const convertToBrasiliaTime = (dateTimeStr) => {
  if (!dateTimeStr) return { date: null, time: null };

  // Criar um objeto moment a partir da string de data
  const utcDateTime = moment.utc(dateTimeStr);

  // Converter para o fuso horário de Brasília
  const brasiliaDateTime = utcDateTime.tz("America/Sao_Paulo");

  return {
    date: brasiliaDateTime.format("YYYY-MM-DD"),
    time: brasiliaDateTime.format("HH:mm"),
    formattedDate: brasiliaDateTime.format("DD [de] MMMM [de] YYYY"),
    formattedDateTime: brasiliaDateTime.format(
      "DD [de] MMMM [de] YYYY [às] HH:mm"
    ),
  };
};

/**
 * Busca informações sobre a liga FIFA Club World Cup
 * @returns {Promise} - Promise com dados da liga
 */
export const getLeagueInfo = async () => {
  try {
    const response = await apiClient.get(`/${API_KEY}/lookuptable.php`, {
      params: { l: FIFA_CLUB_WORLD_CUP_ID },
    });

    return response.data.table || [];
  } catch (error) {
    console.error("Erro ao buscar informações da liga:", error);
    throw error;
  }
};

/**
 * Busca os próximos jogos da FIFA Club World Cup
 * @returns {Promise} - Promise com lista de jogos
 */
export const getUpcomingMatches = async () => {
  try {
    const response = await apiClient.get(`/${API_KEY}/eventsround.php`, {
      params: {
        id: FIFA_CLUB_WORLD_CUP_ID,
        r: "CURRENT", // busca a rodada atual
        s: "2024-2025", // temporada
      },
    });

    // Se não houver eventos ou a resposta for inválida
    if (
      !response.data ||
      !response.data.events ||
      !Array.isArray(response.data.events)
    ) {
      return [];
    }

    // Mapear os eventos para o formato que precisamos
    return response.data.events.map((event) => {
      // Converter horário UTC para Brasília
      const brasiliaTime = convertToBrasiliaTime(event.strTimestamp);

      return {
        id: event.idEvent,
        competition: "FIFA Club World Cup",
        date: brasiliaTime.date,
        time: brasiliaTime.time,
        formattedDate: brasiliaTime.formattedDate,
        formattedDateTime: brasiliaTime.formattedDateTime,
        venue: event.strVenue || "A definir",
        round: event.intRound,
        status: event.strStatus,
        teams: {
          home: {
            id: event.idHomeTeam,
            name: event.strHomeTeam,
            logo: event.strHomeTeamBadge,
            score: event.intHomeScore,
            isBotafogo: event.strHomeTeam.includes("Botafogo"),
          },
          away: {
            id: event.idAwayTeam,
            name: event.strAwayTeam,
            logo: event.strAwayTeamBadge,
            score: event.intAwayScore,
            isBotafogo: event.strAwayTeam.includes("Botafogo"),
          },
        },
      };
    });
  } catch (error) {
    console.error("Erro ao buscar próximos jogos:", error);
    throw error;
  }
};

/**
 * Busca resultados ao vivo da FIFA Club World Cup
 * @returns {Promise} - Promise com jogos ao vivo
 */
export const getLiveMatches = async () => {
  try {
    const response = await apiClient.get(`/${API_KEY}/livescore.php`, {
      params: {
        l: FIFA_CLUB_WORLD_CUP_ID,
      },
    });

    // Se não houver eventos ao vivo ou a resposta for inválida
    if (
      !response.data ||
      !response.data.events ||
      !Array.isArray(response.data.events)
    ) {
      return [];
    }

    // Mapear os eventos para o formato que precisamos
    return response.data.events.map((event) => {
      // Converter horário UTC para Brasília
      const brasiliaTime = convertToBrasiliaTime(event.strTimestamp);

      return {
        id: event.idEvent,
        competition: "FIFA Club World Cup",
        date: brasiliaTime.date,
        time: brasiliaTime.time,
        formattedDate: brasiliaTime.formattedDate,
        formattedDateTime: brasiliaTime.formattedDateTime,
        venue: event.strVenue || "A definir",
        round: event.intRound,
        status: event.strStatus,
        elapsed: event.strProgress, // Minutos jogados
        teams: {
          home: {
            id: event.idHomeTeam,
            name: event.strHomeTeam,
            logo: event.strHomeTeamBadge,
            score: event.intHomeScore,
            isBotafogo: event.strHomeTeam.includes("Botafogo"),
          },
          away: {
            id: event.idAwayTeam,
            name: event.strAwayTeam,
            logo: event.strAwayTeamBadge,
            score: event.intAwayScore,
            isBotafogo: event.strAwayTeam.includes("Botafogo"),
          },
        },
      };
    });
  } catch (error) {
    console.error("Erro ao buscar jogos ao vivo:", error);
    throw error;
  }
};

/**
 * Busca todos os jogos da FIFA Club World Cup (incluindo passados e futuros)
 * @returns {Promise} - Promise com todos os jogos
 */
export const getAllMatches = async () => {
  try {
    const response = await apiClient.get(`/${API_KEY}/eventspastleague.php`, {
      params: {
        id: FIFA_CLUB_WORLD_CUP_ID,
      },
    });

    // Se não houver eventos ou a resposta for inválida
    if (
      !response.data ||
      !response.data.events ||
      !Array.isArray(response.data.events)
    ) {
      return [];
    }

    // Mapear os eventos para o formato que precisamos
    return response.data.events.map((event) => {
      // Converter horário UTC para Brasília
      const brasiliaTime = convertToBrasiliaTime(event.strTimestamp);

      return {
        id: event.idEvent,
        competition: "FIFA Club World Cup",
        date: brasiliaTime.date,
        time: brasiliaTime.time,
        formattedDate: brasiliaTime.formattedDate,
        formattedDateTime: brasiliaTime.formattedDateTime,
        venue: event.strVenue || "A definir",
        round: event.intRound,
        status: event.strStatus,
        teams: {
          home: {
            id: event.idHomeTeam,
            name: event.strHomeTeam,
            logo: event.strHomeTeamBadge,
            score: event.intHomeScore,
            isBotafogo: event.strHomeTeam.includes("Botafogo"),
          },
          away: {
            id: event.idAwayTeam,
            name: event.strAwayTeam,
            logo: event.strAwayTeamBadge,
            score: event.intAwayScore,
            isBotafogo: event.strAwayTeam.includes("Botafogo"),
          },
        },
      };
    });
  } catch (error) {
    console.error("Erro ao buscar todos os jogos:", error);
    throw error;
  }
};
