// services/football-data.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// URL base da API
const BASE_URL = "https://api.football-data.org/v4";

// API Key (substitua pela sua API Key após se registrar no football-data.org)
// Cadastre-se em https://www.football-data.org/client/register
const API_KEY = "COLOQUE_SUA_API_KEY_AQUI";

// Cache timeout em minutos
const CACHE_TIMEOUT = 60; // 1 hora

// Cliente Axios com interceptor
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Auth-Token": API_KEY,
  },
});

// Interceptor para logs de requisição
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Requisição para Football-Data: ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Erro na requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptor para logs de resposta
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("Erro da API Football-Data:", {
        status: error.response.status,
        data: error.response.data,
      });

      // Verifica o tipo de erro
      if (error.response.status === 403) {
        console.error("Erro de autenticação: verifique sua API Key");
      } else if (error.response.status === 429) {
        console.error(
          "Limite de requisições excedido. Tente novamente mais tarde."
        );
      }
    }
    return Promise.reject(error);
  }
);

// Funções utilitárias para cache
const saveToCache = async (key, data, timeInMinutes = CACHE_TIMEOUT) => {
  try {
    const item = {
      data,
      expiry: Date.now() + timeInMinutes * 60 * 1000,
    };
    await AsyncStorage.setItem(`football_data_${key}`, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error("Erro ao salvar cache:", error);
    return false;
  }
};

const getFromCache = async (key) => {
  try {
    const value = await AsyncStorage.getItem(`football_data_${key}`);
    if (!value) return null;

    const item = JSON.parse(value);
    if (Date.now() > item.expiry) {
      await AsyncStorage.removeItem(`football_data_${key}`);
      return null;
    }
    return item.data;
  } catch (error) {
    console.error("Erro ao recuperar cache:", error);
    return null;
  }
};

// IDs dos principais campeonatos na API football-data.org
const COMPETITIONS = {
  BRASILEIRAO: 2013,
  PREMIER_LEAGUE: 2021,
  CHAMPIONS_LEAGUE: 2001,
  WORLD_CUP: 2000,
  EURO: 2018,
};

// IDs dos times do Brasileirão na API football-data.org
const BRAZILIAN_TEAMS = {
  BOTAFOGO: 1957,
  FLAMENGO: 1783,
  PALMEIRAS: 1768,
  SAO_PAULO: 1776,
  CORINTHIANS: 1777,
  GREMIO: 1767,
  INTERNACIONAL: 1766,
  ATLETICO_MG: 1780,
  CRUZEIRO: 1775,
  ATHLETICO_PR: 1779,
  FLUMINENSE: 1765,
  VASCO: 1779,
  BAHIA: 1955,
  FORTALEZA: 1961,
  BRAGANTINO: 1774,
  JUVENTUDE: 1964,
  VITORIA: 1770,
  CUIABA: 1967,
  ATLETICO_GO: 2020,
  CRICIUMA: 1969,
};

/**
 * Obtém os próximos jogos de um campeonato específico
 * @param {number} competitionId - ID do campeonato (default: Brasileirão)
 * @param {number} limit - Número máximo de jogos a retornar
 */
export const getNextMatches = async (
  competitionId = COMPETITIONS.BRASILEIRAO,
  limit = 10
) => {
  try {
    const cacheKey = `next_matches_${competitionId}_${limit}`;
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      console.log("Usando dados em cache para próximos jogos");
      return cachedData;
    }

    const response = await apiClient.get(
      `/competitions/${competitionId}/matches`,
      {
        params: {
          status: "SCHEDULED",
          limit: limit,
        },
      }
    );

    // Se não houver jogos programados, podemos cair no fallback de usar dados simulados
    if (!response.data.matches || response.data.matches.length === 0) {
      return await getFallbackMatches(competitionId, limit);
    }

    // Formata os dados de resposta
    const matches = response.data.matches.slice(0, limit).map((match) => ({
      id: match.id,
      date: match.utcDate,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        logo: `https://crests.football-data.org/${match.homeTeam.id}.png`,
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        logo: `https://crests.football-data.org/${match.awayTeam.id}.png`,
      },
      venue: match.venue || "Local não definido",
      round: match.matchday ? `Rodada ${match.matchday}` : "Data não definida",
    }));

    // Salva no cache
    await saveToCache(cacheKey, matches);
    return matches;
  } catch (error) {
    console.error("Erro ao buscar próximos jogos:", error);
    return await getFallbackMatches(competitionId, limit);
  }
};

/**
 * Obtém a tabela de classificação de um campeonato
 * @param {number} competitionId - ID do campeonato (default: Brasileirão)
 */
export const getCompetitionStandings = async (
  competitionId = COMPETITIONS.BRASILEIRAO
) => {
  try {
    const cacheKey = `standings_${competitionId}`;
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      console.log("Usando dados em cache para classificação");
      return cachedData;
    }

    const response = await apiClient.get(
      `/competitions/${competitionId}/standings`
    );

    // Formata os dados de resposta
    const standings = response.data.standings[0].table.map((team) => ({
      position: team.position,
      teamId: team.team.id,
      teamName: team.team.name,
      logo: `https://crests.football-data.org/${team.team.id}.png`,
      points: team.points,
      playedGames: team.playedGames,
      won: team.won,
      draw: team.draw,
      lost: team.lost,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalDifference,
    }));

    // Salva no cache
    await saveToCache(cacheKey, standings);
    return standings;
  } catch (error) {
    console.error("Erro ao buscar classificação:", error);
    return [];
  }
};

/**
 * Dados de fallback para quando a API não retorna dados ou ocorre um erro
 */
const getFallbackMatches = async (competitionId, limit) => {
  console.log("Usando dados de fallback para próximos jogos");

  // Dados simulados para o Brasileirão
  if (competitionId === COMPETITIONS.BRASILEIRAO) {
    const mockMatches = [
      {
        id: 1001,
        date: "2025-07-06T16:00:00-03:00",
        homeTeam: {
          id: BRAZILIAN_TEAMS.BOTAFOGO,
          name: "Botafogo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.BOTAFOGO}.png`,
        },
        awayTeam: {
          id: BRAZILIAN_TEAMS.FLAMENGO,
          name: "Flamengo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.FLAMENGO}.png`,
        },
        venue: "Estádio Nilton Santos",
        round: "Rodada 15",
      },
      {
        id: 1002,
        date: "2025-07-13T16:00:00-03:00",
        homeTeam: {
          id: BRAZILIAN_TEAMS.SAO_PAULO,
          name: "São Paulo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.SAO_PAULO}.png`,
        },
        awayTeam: {
          id: BRAZILIAN_TEAMS.BOTAFOGO,
          name: "Botafogo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.BOTAFOGO}.png`,
        },
        venue: "Morumbis",
        round: "Rodada 16",
      },
      {
        id: 1003,
        date: "2025-07-20T18:30:00-03:00",
        homeTeam: {
          id: BRAZILIAN_TEAMS.BOTAFOGO,
          name: "Botafogo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.BOTAFOGO}.png`,
        },
        awayTeam: {
          id: BRAZILIAN_TEAMS.CORINTHIANS,
          name: "Corinthians",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.CORINTHIANS}.png`,
        },
        venue: "Estádio Nilton Santos",
        round: "Rodada 17",
      },
      {
        id: 1004,
        date: "2025-07-27T16:00:00-03:00",
        homeTeam: {
          id: BRAZILIAN_TEAMS.PALMEIRAS,
          name: "Palmeiras",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.PALMEIRAS}.png`,
        },
        awayTeam: {
          id: BRAZILIAN_TEAMS.BOTAFOGO,
          name: "Botafogo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.BOTAFOGO}.png`,
        },
        venue: "Allianz Parque",
        round: "Rodada 18",
      },
      {
        id: 1005,
        date: "2025-08-03T18:30:00-03:00",
        homeTeam: {
          id: BRAZILIAN_TEAMS.BOTAFOGO,
          name: "Botafogo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.BOTAFOGO}.png`,
        },
        awayTeam: {
          id: BRAZILIAN_TEAMS.FLUMINENSE,
          name: "Fluminense",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.FLUMINENSE}.png`,
        },
        venue: "Estádio Nilton Santos",
        round: "Rodada 19",
      },
      {
        id: 1006,
        date: "2025-08-10T16:00:00-03:00",
        homeTeam: {
          id: BRAZILIAN_TEAMS.GREMIO,
          name: "Grêmio",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.GREMIO}.png`,
        },
        awayTeam: {
          id: BRAZILIAN_TEAMS.BOTAFOGO,
          name: "Botafogo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.BOTAFOGO}.png`,
        },
        venue: "Arena do Grêmio",
        round: "Rodada 20",
      },
      {
        id: 1007,
        date: "2025-08-17T18:30:00-03:00",
        homeTeam: {
          id: BRAZILIAN_TEAMS.BOTAFOGO,
          name: "Botafogo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.BOTAFOGO}.png`,
        },
        awayTeam: {
          id: BRAZILIAN_TEAMS.INTERNACIONAL,
          name: "Internacional",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.INTERNACIONAL}.png`,
        },
        venue: "Estádio Nilton Santos",
        round: "Rodada 21",
      },
      {
        id: 1008,
        date: "2025-08-24T16:00:00-03:00",
        homeTeam: {
          id: BRAZILIAN_TEAMS.ATLETICO_MG,
          name: "Atlético-MG",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.ATLETICO_MG}.png`,
        },
        awayTeam: {
          id: BRAZILIAN_TEAMS.BOTAFOGO,
          name: "Botafogo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.BOTAFOGO}.png`,
        },
        venue: "Arena MRV",
        round: "Rodada 22",
      },
      {
        id: 1009,
        date: "2025-08-31T18:30:00-03:00",
        homeTeam: {
          id: BRAZILIAN_TEAMS.BOTAFOGO,
          name: "Botafogo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.BOTAFOGO}.png`,
        },
        awayTeam: {
          id: BRAZILIAN_TEAMS.CRUZEIRO,
          name: "Cruzeiro",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.CRUZEIRO}.png`,
        },
        venue: "Estádio Nilton Santos",
        round: "Rodada 23",
      },
      {
        id: 1010,
        date: "2025-09-07T16:00:00-03:00",
        homeTeam: {
          id: BRAZILIAN_TEAMS.ATHLETICO_PR,
          name: "Athletico-PR",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.ATHLETICO_PR}.png`,
        },
        awayTeam: {
          id: BRAZILIAN_TEAMS.BOTAFOGO,
          name: "Botafogo",
          logo: `https://crests.football-data.org/${BRAZILIAN_TEAMS.BOTAFOGO}.png`,
        },
        venue: "Ligga Arena",
        round: "Rodada 24",
      },
    ];

    return mockMatches.slice(0, limit);
  }

  // Dados genéricos para outros campeonatos
  return [];
};
