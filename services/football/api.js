import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// API KEY fornecida
const API_KEY = "ef7d8b5fd3ac328746a05b14abeebf12";
const BASE_URL = "https://v3.football.api-sports.io";

// Cache timeout em minutos (aumentado para reduzir chamadas à API)
const CACHE_TIMEOUT = 360; // 6 horas

// Contador de requisições para monitorar o uso diário
let dailyRequestCount = 0;
const REQUEST_LIMIT = 100;

// Cliente Axios com interceptor para diagnóstico
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-apisports-key": API_KEY,
  },
});

// Interceptar requisições para diagnóstico
apiClient.interceptors.request.use(async (config) => {
  // Verificar limite de requisições
  const currentCount = await getDailyRequestCount();

  if (currentCount >= REQUEST_LIMIT) {
    console.warn(
      `ALERTA: Limite diário de requisições próximo! (${currentCount}/${REQUEST_LIMIT})`
    );
  }

  console.log(
    `Requisição API Football: ${config.url} com params:`,
    config.params
  );
  return config;
});

// Interceptar respostas para diagnóstico
apiClient.interceptors.response.use(
  async (response) => {
    // Incrementar contador de requisições
    await incrementDailyRequestCount();

    // Verificar resposta da API
    if (response.data.errors && Object.keys(response.data.errors).length > 0) {
      console.error("API Football retornou erros:", response.data.errors);

      // Determinar o tipo de erro
      const errorMessages = Object.values(response.data.errors).join(", ");
      if (errorMessages.includes("subscription")) {
        console.error(
          "ERRO DE ASSINATURA: O endpoint ou recursos solicitados não estão incluídos em seu plano"
        );
      } else if (errorMessages.includes("key")) {
        console.error("ERRO DE API KEY: Chave inválida ou expirada");
      } else if (errorMessages.includes("limit")) {
        console.error(
          "ERRO DE LIMITE: Você atingiu seu limite diário de requisições"
        );
      }

      throw new Error(`Erro API Football: ${errorMessages}`);
    }

    return response;
  },
  (error) => {
    if (error.response) {
      console.error("API Football - Resposta de erro:", {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("API Football - Sem resposta:", error.request);
    } else {
      console.error("API Football - Erro:", error.message);
    }
    return Promise.reject(error);
  }
);

// Funções para monitorar o uso diário da API
async function getDailyRequestCount() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const storedData = await AsyncStorage.getItem("api_football_daily_usage");

    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.date === today) {
        return data.count;
      }
    }

    // Novo dia, resetar contador
    await AsyncStorage.setItem(
      "api_football_daily_usage",
      JSON.stringify({
        date: today,
        count: 0,
      })
    );
    return 0;
  } catch (error) {
    console.error("Erro ao obter contador de requisições:", error);
    return 0;
  }
}

async function incrementDailyRequestCount() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const storedData = await AsyncStorage.getItem("api_football_daily_usage");

    let count = 1;
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.date === today) {
        count = data.count + 1;
      }
    }

    await AsyncStorage.setItem(
      "api_football_daily_usage",
      JSON.stringify({
        date: today,
        count,
      })
    );
    dailyRequestCount = count;

    return count;
  } catch (error) {
    console.error("Erro ao atualizar contador de requisições:", error);
    return 0;
  }
}

// ID correto do Botafogo
const BOTAFOGO_ID = 120;

// IDs das competições
const COMPETITIONS = {
  BRASILEIRAO: 71, // ID do Brasileirão na API
  BRASILEIRAO_2025: 83, // ID atualizado para o Brasileirão 2025
  COPA_DO_BRASIL: 72,
  LIBERTADORES: 13,
  MUNDIAL_CLUBES: 15,
};

// Função utilitária para salvar em cache
const saveToCache = async (key, data) => {
  try {
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
    console.log(`Dados salvos em cache: ${key}`);
  } catch (error) {
    console.error(`Erro ao salvar cache para ${key}:`, error);
  }
};

// Função utilitária para obter dados do cache
const getFromCache = async (key) => {
  try {
    const cachedData = await AsyncStorage.getItem(key);
    if (!cachedData) return null;

    const { timestamp, data } = JSON.parse(cachedData);
    const expirationTime = CACHE_TIMEOUT * 60 * 1000;

    if (Date.now() - timestamp < expirationTime) {
      console.log(`Usando dados do cache: ${key}`);
      return data;
    }
    console.log(`Cache expirado para: ${key}`);
    return null;
  } catch (error) {
    console.error(`Erro ao obter cache para ${key}:`, error);
    return null;
  }
};

// Função para limpar o cache de futebol
export const clearFootballCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const footballKeys = keys.filter((key) => key.startsWith("football_"));

    if (footballKeys.length > 0) {
      await AsyncStorage.multiRemove(footballKeys);
      console.log(
        `Cache de futebol limpo: ${footballKeys.length} chaves removidas`
      );
    }
    return true;
  } catch (error) {
    console.error("Erro ao limpar cache de futebol:", error);
    return false;
  }
};

// Obter informações da temporada atual
export async function getCurrentSeason() {
  const currentYear = new Date().getFullYear();
  return currentYear;
}

// Obter próximos jogos com tratamento de erro aprimorado
export async function getUpcomingMatches() {
  const cacheKey = `football_upcoming_matches_${BOTAFOGO_ID}`;

  try {
    // Verificar cache primeiro
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      console.log(`Usando próximos jogos em cache`);
      return cachedData;
    }

    // Verificar uso da API
    const requestCount = await getDailyRequestCount();
    if (requestCount >= REQUEST_LIMIT - 5) {
      // Alerta se estiver próximo do limite
      console.warn(
        `ALERTA: Aproximando do limite diário de requisições (${requestCount}/${REQUEST_LIMIT})`
      );

      // Se estiver muito próximo do limite, retornar dados vazios
      if (requestCount >= REQUEST_LIMIT) {
        throw new Error(
          "Limite diário de requisições da API atingido. Tente novamente amanhã."
        );
      }
    }

    // Obter a temporada atual
    const currentYear = await getCurrentSeason();

    // Definir intervalo de datas (próximos 30 dias)
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const formattedEndDate = endDate.toISOString().split("T")[0];

    console.log(`Buscando jogos de ${formattedToday} até ${formattedEndDate}`);

    // Buscar jogos com validação de parâmetros
    const params = {
      team: BOTAFOGO_ID,
      season: currentYear,
      from: formattedToday,
      to: formattedEndDate,
      status: "NS", // Not Started (jogos não iniciados)
    };

    const response = await apiClient.get("/fixtures", { params });

    // Verificar se a resposta tem o formato esperado
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Resposta da API em formato inválido");
    }

    console.log("Headers da resposta:", response.headers);
    console.log("Status da resposta:", response.status);
    console.log("Estrutura da resposta:", Object.keys(response.data));

    if (!response.data.response) {
      throw new Error('Propriedade "response" não encontrada na resposta');
    }

    // Verificar se temos resultados
    if (response.data.response.length === 0) {
      console.log("Nenhum jogo encontrado na API para o período");
      return [];
    }

    // Salvar em cache
    await saveToCache(cacheKey, response.data.response);

    console.log(
      `Encontrados ${response.data.response.length} jogos para o período`
    );
    return response.data.response;
  } catch (error) {
    console.error("Erro ao obter próximos jogos:", error);

    // Tentar usar dados do cache mesmo se estiver expirado
    try {
      const expiredCache = await AsyncStorage.getItem(cacheKey);
      if (expiredCache) {
        console.log("Usando cache expirado devido a erro na API");
        return JSON.parse(expiredCache).data;
      }
    } catch (cacheError) {
      console.error("Erro ao tentar usar cache expirado:", cacheError);
    }

    // Se tudo falhar, retornar array vazio
    return [];
  }
}

// Função simplificada para testar a conexão com a API
export async function testApiConnection() {
  try {
    // Tentar uma requisição simples
    const response = await apiClient.get("/status");

    console.log("Teste de API - Status:", response.status);
    console.log("Teste de API - Resposta:", response.data);

    return {
      success: true,
      message: "Conexão com a API bem-sucedida",
      data: response.data,
    };
  } catch (error) {
    console.error("Teste de API - Erro:", error);

    return {
      success: false,
      message: `Erro na conexão com a API: ${error.message}`,
      error,
    };
  }
}

// Simplificando as funções para minimizar chamadas à API
export async function getTeamStatistics(leagueId = COMPETITIONS.BRASILEIRAO) {
  const cacheKey = `football_team_stats_${BOTAFOGO_ID}_${leagueId}`;

  try {
    // Verificar cache primeiro com alta prioridade
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Obter a temporada atual
    const currentYear = await getCurrentSeason();

    // Buscar estatísticas da API
    const response = await apiClient.get("/teams/statistics", {
      params: {
        team: BOTAFOGO_ID,
        league: leagueId,
        season: currentYear,
      },
    });

    if (!response.data || !response.data.response) {
      throw new Error("Resposta inválida da API");
    }

    // Salvar em cache
    await saveToCache(cacheKey, response.data.response);

    return response.data.response;
  } catch (error) {
    console.error("Erro ao obter estatísticas do time:", error);

    // Tentar dados expirados
    try {
      const expiredCache = await AsyncStorage.getItem(cacheKey);
      if (expiredCache) {
        return JSON.parse(expiredCache).data;
      }
    } catch (e) {}

    throw error;
  }
}

// Obter informações da tabela (classificação)
export async function getLeagueTable(leagueId = COMPETITIONS.BRASILEIRAO) {
  const cacheKey = `football_standings_${leagueId}`;

  try {
    // Verificar cache primeiro
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Obter a temporada atual
    const currentYear = await getCurrentSeason();

    // Buscar classificação da API
    const response = await apiClient.get("/standings", {
      params: {
        league: leagueId,
        season: currentYear,
      },
    });

    // Verificar se a resposta tem conteúdo
    if (!response.data) {
      console.error("Resposta vazia da API de classificação");
      return null;
    }

    // Verificar se a estrutura da resposta é a esperada
    if (!response.data.response || !Array.isArray(response.data.response)) {
      console.error("Estrutura de resposta inválida:", response.data);
      return null;
    }

    if (response.data.response.length === 0) {
      console.error("Array de resposta vazio para classificação");
      return null;
    }

    // Salvar em cache
    await saveToCache(cacheKey, response.data.response);

    return response.data.response;
  } catch (error) {
    console.error("Erro ao obter classificação da liga:", error);

    // Tentar dados expirados
    try {
      const expiredCache = await AsyncStorage.getItem(cacheKey);
      if (expiredCache) {
        return JSON.parse(expiredCache).data;
      }
    } catch (e) {}

    return null;
  }
}

// Obter rodadas da competição
export async function getLeagueRounds(leagueId = COMPETITIONS.BRASILEIRAO) {
  const cacheKey = `football_rounds_${leagueId}`;

  try {
    // Verificar cache primeiro
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      console.log(`Usando rodadas em cache para liga ${leagueId}`);
      return cachedData;
    }

    // Obter a temporada atual
    const currentYear = new Date().getFullYear();

    // Buscar rodadas da API
    const response = await apiClient.get("/fixtures/rounds", {
      params: {
        league: leagueId,
        season: currentYear,
      },
    });

    if (!response.data || !response.data.response) {
      throw new Error("Resposta inválida da API de rodadas");
    }

    // Salvar em cache
    await saveToCache(cacheKey, response.data.response);

    return response.data.response;
  } catch (error) {
    console.error("Erro ao obter rodadas da liga:", error);
    throw error;
  }
}

// Obter temporadas disponíveis para o time
export async function getTeamSeasons() {
  const cacheKey = `football_team_seasons_${BOTAFOGO_ID}`;

  try {
    // Verificar cache primeiro
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      console.log("Usando temporadas em cache");
      return cachedData;
    }

    // Buscar temporadas da API
    const response = await apiClient.get("/teams/seasons", {
      params: {
        team: BOTAFOGO_ID,
      },
    });

    if (!response.data || !response.data.response) {
      throw new Error("Resposta inválida da API de temporadas");
    }

    // Salvar em cache
    await saveToCache(cacheKey, response.data.response);

    return response.data.response;
  } catch (error) {
    console.error("Erro ao obter temporadas do time:", error);
    throw error;
  }
}

// Obter detalhes do time
export async function getTeamDetails() {
  const cacheKey = `football_team_details_${BOTAFOGO_ID}`;

  try {
    // Verificar cache primeiro
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Buscar detalhes da API
    const response = await apiClient.get("/teams", {
      params: {
        id: BOTAFOGO_ID,
      },
    });

    if (
      !response.data ||
      !response.data.response ||
      response.data.response.length === 0
    ) {
      throw new Error("Resposta inválida da API de detalhes do time");
    }

    // Salvar em cache
    await saveToCache(cacheKey, response.data.response[0]);

    return response.data.response[0];
  } catch (error) {
    console.error("Erro ao obter detalhes do time:", error);

    // Tentar dados expirados
    try {
      const expiredCache = await AsyncStorage.getItem(cacheKey);
      if (expiredCache) {
        return JSON.parse(expiredCache).data;
      }
    } catch (e) {}

    throw error;
  }
}

// Função para obter os próximos jogos do Brasileirão
export const getNextBrasileiraoMatches = async (limit = 5) => {
  try {
    const cacheKey = `football_brasileirao_next_matches_${limit}_2025`;

    // Verificar se há dados em cache
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) return cachedData;

    // Usar o ano correto para o Brasileirão 2025
    const season = 2025;

    // Se não houver dados em cache, vamos criar alguns dados de exemplo
    // até que a API tenha dados reais para o Brasileirão 2025

    // DADOS FICTÍCIOS para testes enquanto a API não tem dados de 2025
    const mockMatches = [
      {
        id: 1001,
        date: "2025-07-06T16:00:00-03:00",
        timestamp: 1720116000,
        homeTeam: {
          id: 127,
          name: "Botafogo",
          logo: "https://media.api-sports.io/football/teams/127.png",
        },
        awayTeam: {
          id: 130,
          name: "Flamengo",
          logo: "https://media.api-sports.io/football/teams/130.png",
        },
        venue: "Estádio Nilton Santos",
        status: { short: "NS" },
        round: "Rodada 15",
      },
      {
        id: 1002,
        date: "2025-07-13T16:00:00-03:00",
        timestamp: 1720720800,
        homeTeam: {
          id: 126,
          name: "São Paulo",
          logo: "https://media.api-sports.io/football/teams/126.png",
        },
        awayTeam: {
          id: 127,
          name: "Botafogo",
          logo: "https://media.api-sports.io/football/teams/127.png",
        },
        venue: "Morumbis",
        status: { short: "NS" },
        round: "Rodada 16",
      },
      {
        id: 1003,
        date: "2025-07-20T18:30:00-03:00",
        timestamp: 1721335800,
        homeTeam: {
          id: 127,
          name: "Botafogo",
          logo: "https://media.api-sports.io/football/teams/127.png",
        },
        awayTeam: {
          id: 131,
          name: "Corinthians",
          logo: "https://media.api-sports.io/football/teams/131.png",
        },
        venue: "Estádio Nilton Santos",
        status: { short: "NS" },
        round: "Rodada 17",
      },
      {
        id: 1004,
        date: "2025-07-27T16:00:00-03:00",
        timestamp: 1721930400,
        homeTeam: {
          id: 118,
          name: "Palmeiras",
          logo: "https://media.api-sports.io/football/teams/118.png",
        },
        awayTeam: {
          id: 127,
          name: "Botafogo",
          logo: "https://media.api-sports.io/football/teams/127.png",
        },
        venue: "Allianz Parque",
        status: { short: "NS" },
        round: "Rodada 18",
      },
      {
        id: 1005,
        date: "2025-08-03T18:30:00-03:00",
        timestamp: 1722545400,
        homeTeam: {
          id: 127,
          name: "Botafogo",
          logo: "https://media.api-sports.io/football/teams/127.png",
        },
        awayTeam: {
          id: 154,
          name: "Fluminense",
          logo: "https://media.api-sports.io/football/teams/154.png",
        },
        venue: "Estádio Nilton Santos",
        status: { short: "NS" },
        round: "Rodada 19",
      },
    ];

    // Salvar em cache
    await saveToCache(cacheKey, mockMatches);
    return mockMatches;

    /* Código original que tentaria buscar da API - comentado temporariamente
    const response = await apiClient.get("/fixtures", {
      params: {
        league: COMPETITIONS.BRASILEIRAO_2025,
        season: season,
        next: limit,
        timezone: "America/Sao_Paulo",
      },
    });
    */

    /* Código comentado temporariamente
    if (response.data && response.data.response) {
      // Processar e formatar dados
      const matches = response.data.response.map((match) => ({
        id: match.fixture.id,
        date: match.fixture.date,
        timestamp: match.fixture.timestamp,
        homeTeam: {
          id: match.teams.home.id,
          name: match.teams.home.name,
          logo: match.teams.home.logo,
        },
        awayTeam: {
          id: match.teams.away.id,
          name: match.teams.away.name,
          logo: match.teams.away.logo,
        },
        venue: match.fixture.venue?.name || "Local não definido",
        status: match.fixture.status,
        round: match.league.round,
      }));

      // Salvar em cache
      await saveToCache(cacheKey, matches);
      return matches;
    }

    throw new Error("Não foi possível obter jogos do Brasileirão");
    */
  } catch (error) {
    console.error("Erro ao obter próximos jogos do Brasileirão:", error);
    return [];
  }
};
