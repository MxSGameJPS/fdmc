import AsyncStorage from "@react-native-async-storage/async-storage";

// Chaves de cache
const CACHE_KEYS = {
  LEAGUE_INFO: "thesportsdb_league_info",
  UPCOMING_MATCHES: "thesportsdb_upcoming_matches",
  ALL_MATCHES: "thesportsdb_all_matches",
};

// Tempo de expiração do cache (em minutos)
const CACHE_EXPIRATION = {
  LEAGUE_INFO: 24 * 60, // 24 horas
  UPCOMING_MATCHES: 30, // 30 minutos
  ALL_MATCHES: 60, // 1 hora
};

/**
 * Salva dados no cache
 * @param {string} key - Chave do cache
 * @param {any} data - Dados a serem armazenados
 * @param {number} expirationMinutes - Tempo de expiração em minutos
 */
export const saveToCache = async (key, data, expirationMinutes) => {
  try {
    const cacheItem = {
      data,
      expiration: Date.now() + expirationMinutes * 60 * 1000,
    };

    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error(`Erro ao salvar no cache (${key}):`, error);
  }
};

/**
 * Busca dados do cache
 * @param {string} key - Chave do cache
 * @returns {any|null} - Dados do cache ou null se expirado/inexistente
 */
export const getFromCache = async (key) => {
  try {
    const cachedData = await AsyncStorage.getItem(key);

    if (!cachedData) return null;

    const cacheItem = JSON.parse(cachedData);

    // Verificar se o cache expirou
    if (Date.now() > cacheItem.expiration) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error(`Erro ao buscar do cache (${key}):`, error);
    return null;
  }
};

/**
 * Limpa todo o cache do TheSportsDB
 */
export const clearTheSportsDBCache = async () => {
  try {
    const keys = Object.values(CACHE_KEYS);
    await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
    console.log("Cache do TheSportsDB limpo com sucesso");
  } catch (error) {
    console.error("Erro ao limpar cache do TheSportsDB:", error);
  }
};

export { CACHE_KEYS, CACHE_EXPIRATION };
