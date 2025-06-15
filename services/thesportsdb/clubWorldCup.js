import * as api from "./api";
import {
  getFromCache,
  saveToCache,
  CACHE_KEYS,
  CACHE_EXPIRATION,
  clearTheSportsDBCache,
} from "./cache";

/**
 * Obtém informações da liga FIFA Club World Cup
 * @param {boolean} forceRefresh - Forçar atualização ignorando o cache
 * @returns {Promise} - Informações da liga
 */
export const getClubWorldCupInfo = async (forceRefresh = false) => {
  try {
    // Tentar obter do cache primeiro, se não for forçada atualização
    if (!forceRefresh) {
      const cachedData = await getFromCache(CACHE_KEYS.LEAGUE_INFO);
      if (cachedData) return cachedData;
    }

    // Se não tiver no cache ou for refresh forçado, buscar da API
    const leagueInfo = await api.getLeagueInfo();

    // Salvar no cache
    await saveToCache(
      CACHE_KEYS.LEAGUE_INFO,
      leagueInfo,
      CACHE_EXPIRATION.LEAGUE_INFO
    );

    return leagueInfo;
  } catch (error) {
    console.error("Erro ao obter informações do Mundial de Clubes:", error);
    throw error;
  }
};

/**
 * Obtém os próximos jogos do Mundial de Clubes
 * @param {boolean} forceRefresh - Forçar atualização ignorando o cache
 * @returns {Promise} - Lista de próximos jogos
 */
export const getUpcomingWorldCupMatches = async (forceRefresh = false) => {
  try {
    // Verificar se há jogos ao vivo primeiro
    const liveMatches = await api.getLiveMatches();

    // Se houver jogos ao vivo, não usar cache
    if (liveMatches.length > 0) {
      return liveMatches;
    }

    // Tentar obter do cache se não for refresh forçado
    if (!forceRefresh) {
      const cachedMatches = await getFromCache(CACHE_KEYS.UPCOMING_MATCHES);
      if (cachedMatches) return cachedMatches;
    }

    // Buscar próximos jogos
    const upcomingMatches = await api.getUpcomingMatches();

    // Salvar no cache
    await saveToCache(
      CACHE_KEYS.UPCOMING_MATCHES,
      upcomingMatches,
      CACHE_EXPIRATION.UPCOMING_MATCHES
    );

    return upcomingMatches;
  } catch (error) {
    console.error("Erro ao obter próximos jogos do Mundial:", error);
    throw error;
  }
};

/**
 * Obtém todos os jogos do Mundial de Clubes
 * @param {boolean} forceRefresh - Forçar atualização ignorando o cache
 * @returns {Promise} - Lista de todos os jogos
 */
export const getAllWorldCupMatches = async (forceRefresh = false) => {
  try {
    // Tentar obter do cache primeiro, se não for forçada atualização
    if (!forceRefresh) {
      const cachedMatches = await getFromCache(CACHE_KEYS.ALL_MATCHES);
      if (cachedMatches) return cachedMatches;
    }

    // Buscar todos os jogos
    const allMatches = await api.getAllMatches();

    // Ordenar por data (mais recente primeiro)
    const sortedMatches = allMatches.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });

    // Salvar no cache
    await saveToCache(
      CACHE_KEYS.ALL_MATCHES,
      sortedMatches,
      CACHE_EXPIRATION.ALL_MATCHES
    );

    return sortedMatches;
  } catch (error) {
    console.error("Erro ao obter todos os jogos do Mundial:", error);
    throw error;
  }
};

/**
 * Limpa o cache de dados do Mundial
 */
export const clearWorldCupCache = async () => {
  await clearTheSportsDBCache();
};
