import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import "moment/locale/pt-br";
import matchesData from "../../assets/data/botafogo-matches.json";

// Cache keys
const BOTAFOGO_MATCHES_CACHE_KEY = "botafogo_matches_cache";
const BOTAFOGO_CACHE_TIMESTAMP_KEY = "botafogo_cache_timestamp";

// Tempo de expiração do cache (4 horas em milisegundos)
const CACHE_EXPIRY_TIME = 4 * 60 * 60 * 1000;

/**
 * Obtém os próximos jogos do Botafogo
 * Primeiro verifica o cache, se estiver expirado ou não existir,
 * carrega do arquivo JSON local ou faz fetch da API (quando implementada)
 */
export const getUpcomingBotafogoMatches = async () => {
  try {
    // Verificar cache
    const cachedData = await AsyncStorage.getItem(BOTAFOGO_MATCHES_CACHE_KEY);
    const cacheTimestamp = await AsyncStorage.getItem(
      BOTAFOGO_CACHE_TIMESTAMP_KEY
    );

    const now = new Date().getTime();
    const cacheIsValid =
      cachedData &&
      cacheTimestamp &&
      now - parseInt(cacheTimestamp) < CACHE_EXPIRY_TIME;

    if (cacheIsValid) {
      console.log("Usando cache para jogos do Botafogo");
      return JSON.parse(cachedData);
    }

    // Carregar dados do arquivo JSON local
    // Em uma versão futura, isso poderia ser substituído por um fetch de uma API real
    const matches = processMatches(matchesData);

    // Atualizar cache
    await AsyncStorage.setItem(
      BOTAFOGO_MATCHES_CACHE_KEY,
      JSON.stringify(matches)
    );
    await AsyncStorage.setItem(BOTAFOGO_CACHE_TIMESTAMP_KEY, now.toString());

    return matches;
  } catch (error) {
    console.error("Erro ao obter jogos do Botafogo:", error);
    // Em caso de erro, tentar usar os dados locais diretamente
    return processMatches(matchesData);
  }
};

/**
 * Limpa o cache dos jogos do Botafogo
 * Útil para forçar uma atualização
 */
export const clearBotafogoCache = async () => {
  try {
    await AsyncStorage.removeItem(BOTAFOGO_MATCHES_CACHE_KEY);
    await AsyncStorage.removeItem(BOTAFOGO_CACHE_TIMESTAMP_KEY);
    console.log("Cache de jogos do Botafogo limpo com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao limpar cache de jogos do Botafogo:", error);
    return false;
  }
};

/**
 * Processa os dados dos jogos para o formato desejado
 * e filtra apenas os jogos futuros
 */
const processMatches = (matches) => {
  // Ordenar jogos por data (do mais próximo ao mais distante)
  const today = moment().startOf("day");

  return matches
    .map((match) => {
      // Adicionar propriedades adicionais se necessário
      const matchDate = moment(
        `${match.date} ${match.time}`,
        "YYYY-MM-DD HH:mm"
      );

      return {
        ...match,
        formattedDate: matchDate.format("DD [de] MMMM [de] YYYY"),
        formattedTime: matchDate.format("HH:mm"),
        dayOfWeek: matchDate.format("dddd"),
        isFuture: matchDate.isAfter(today),
      };
    })
    .filter((match) => match.isFuture) // Filtrar apenas jogos futuros
    .sort((a, b) => {
      // Ordenar por data
      const dateA = moment(`${a.date} ${a.time}`, "YYYY-MM-DD HH:mm");
      const dateB = moment(`${b.date} ${b.time}`, "YYYY-MM-DD HH:mm");
      return dateA.diff(dateB);
    });
};
