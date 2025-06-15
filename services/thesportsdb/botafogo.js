import axios from "axios";
import moment from "moment-timezone";
import "moment/locale/pt-br"; // Importar localização em português

// Configuração da API com chave premium
const API_KEY = "242257";
const BASE_URL = "https://www.thesportsdb.com/api/v1/json";

// Cliente axios para API
const apiClient = axios.create({
  baseURL: `${BASE_URL}/${API_KEY}`,
});

// Configurar momento para português
moment.locale("pt-br");

/**
 * Busca o próximo jogo do Botafogo no Mundial de Clubes
 * @returns {Promise<Object>} Dados do próximo jogo
 */
export const getNextBotafogoMatch = async () => {
  try {
    console.log("Buscando próximo jogo do Botafogo no Mundial...");

    // Buscar todos os jogos do Mundial
    const response = await apiClient.get("/eventsnextleague.php?id=4503");

    if (!response.data?.events || !Array.isArray(response.data.events)) {
      console.log("API não retornou dados válidos");
      return getSimulatedNextMatch();
    }

    const allEvents = response.data.events;
    console.log(`Total de jogos do Mundial: ${allEvents.length}`);

    // Filtrar apenas jogos do Botafogo
    const botafogoMatches = allEvents.filter((event) => {
      return (
        event.strHomeTeam?.includes("Botafogo") ||
        event.strAwayTeam?.includes("Botafogo") ||
        event.idHomeTeam === "134285" ||
        event.idAwayTeam === "134285"
      );
    });

    console.log(`Jogos do Botafogo encontrados: ${botafogoMatches.length}`);

    if (botafogoMatches.length === 0) {
      console.log("Nenhum jogo do Botafogo encontrado. Usando simulado.");
      return getSimulatedNextMatch();
    }

    // Converter para o formato do app e ordenar por data
    const formattedMatches = botafogoMatches
      .map(formatMatchData)
      .filter((match) => match !== null)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });

    // Verificar status para determinar o próximo jogo
    const now = new Date();

    // Primeiro, procurar jogos ao vivo
    const liveMatch = formattedMatches.find((match) => match.status === "LIVE");
    if (liveMatch) {
      console.log("Jogo ao vivo encontrado!");
      return liveMatch;
    }

    // Depois, procurar o próximo jogo agendado
    for (const match of formattedMatches) {
      const matchDate = new Date(`${match.date}T${match.time}`);
      if (matchDate >= now && match.status !== "FINISHED") {
        console.log(
          `Próximo jogo encontrado: ${match.teams.home.name} vs ${match.teams.away.name}`
        );
        return match;
      }
    }

    // Se não encontrar próximos jogos, retornar o último jogo
    console.log("Nenhum próximo jogo encontrado. Retornando o último jogo.");
    return formattedMatches[formattedMatches.length - 1];
  } catch (error) {
    console.error("Erro ao buscar próximo jogo:", error.message);
    return getSimulatedNextMatch();
  }
};

/**
 * Busca jogos ao vivo do Botafogo
 * @returns {Promise<Object|null>} Jogo ao vivo ou null
 */
export const getLiveBotafogoMatch = async () => {
  try {
    // Tentar buscar jogos ao vivo
    console.log("Verificando se há jogos ao vivo...");

    // Uma opção é verificar o próximo jogo e ver se ele está acontecendo agora
    const nextMatch = await getNextBotafogoMatch();

    if (nextMatch?.status === "LIVE") {
      console.log("Jogo ao vivo encontrado!");
      return nextMatch;
    }

    console.log("Nenhum jogo ao vivo no momento.");
    return null;
  } catch (error) {
    console.error("Erro ao verificar jogos ao vivo:", error);
    return null;
  }
};

// Vamos atualizar a função que formata os dados do jogo para usar os escudos corretos

// Função para obter o logo correto do time
const getTeamLogo = (teamName) => {
  if (!teamName) return null;

  // Links atualizados para escudos de alta qualidade
  if (teamName.includes("Botafogo")) {
    return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg/1200px-Botafogo_de_Futebol_e_Regatas_logo.svg.png";
  }

  if (teamName.includes("Seattle") || teamName.includes("Sounders")) {
    return "https://brandlogos.net/wp-content/uploads/2016/01/seattle_sounders_fc_2008-2023-logo_brandlogos.net_fppc0.png";
  }

  if (teamName.includes("Paris") || teamName.includes("PSG")) {
    return "https://logodownload.org/wp-content/uploads/2017/02/psg-logo-paris-saint-germain-logo-1.png";
  }

  if (teamName.includes("Atletico") || teamName.includes("Atlético")) {
    return "https://logodownload.org/wp-content/uploads/2018/09/atletico-madrid-logo-1.png";
  }

  // Se não encontrar correspondência, retorna null e usará o que vier da API
  return null;
};

/**
 * Formata os dados de um jogo para o padrão da aplicação
 */
const formatMatchData = (event) => {
  try {
    // Verificar IDs e nomes para determinar se é Botafogo
    const homeIsBotafogo =
      event.idHomeTeam === "134285" ||
      (event.strHomeTeam || "").includes("Botafogo");

    const awayIsBotafogo =
      event.idAwayTeam === "134285" ||
      (event.strAwayTeam || "").includes("Botafogo");

    // Obter logos dos times usando a função atualizada
    const homeLogo = getTeamLogo(event.strHomeTeam) || event.strHomeTeamBadge;
    const awayLogo = getTeamLogo(event.strAwayTeam) || event.strAwayTeamBadge;

    // Converter horários (usar horário local quando disponível)
    const date = event.dateEventLocal || event.dateEvent || "";
    let time = event.strTimeLocal || event.strTime || "";

    // Se o time terminar em :00, simplificar
    if (time.endsWith(":00")) {
      time = time.substring(0, 5);
    }

    // Formatar data para exibição
    const dateMoment = moment(date);
    const formattedDate = dateMoment.format("DD [de] MMMM [de] YYYY");

    // Determinar o status do jogo
    let status = "SCHEDULED";
    if (event.strStatus === "Not Started") status = "SCHEDULED";
    else if (["1H", "HT", "2H", "ET", "P", "BT"].includes(event.strStatus))
      status = "LIVE";
    else if (["FT", "AET", "PEN"].includes(event.strStatus))
      status = "FINISHED";

    // Retornar objeto formatado
    return {
      id: event.idEvent,
      competition: "FIFA Club World Cup",
      date,
      time,
      formattedDate,
      formattedDateTime: `${formattedDate} às ${time}`,
      venue: event.strVenue || "A definir",
      round:
        `Grupo ${event.strGroup || "B"}` +
        (event.intRound ? ` - Rodada ${event.intRound}` : ""),
      status,
      elapsed: event.strProgress || null,
      teams: {
        home: {
          id: event.idHomeTeam,
          name: event.strHomeTeam,
          logo: homeLogo, // Logo atualizado aqui
          score: event.intHomeScore,
          isBotafogo: homeIsBotafogo,
        },
        away: {
          id: event.idAwayTeam,
          name: event.strAwayTeam,
          logo: awayLogo, // Logo atualizado aqui
          score: event.intAwayScore,
          isBotafogo: awayIsBotafogo,
        },
      },
    };
  } catch (error) {
    console.error("Erro ao formatar dados do jogo:", error);
    return null;
  }
};

/**
 * Retorna um jogo simulado como fallback
 * @returns {Object} Jogo simulado
 */
const getSimulatedNextMatch = () => {
  const today = new Date();
  let matchDate, matchTime, opponent, isHome;

  // Determinar qual jogo mostrar com base na data atual
  if (today < new Date("2025-06-16")) {
    // Antes do primeiro jogo: Seattle Sounders
    matchDate = "2025-06-15";
    matchTime = "23:00";
    opponent = "Seattle Sounders FC";
    isHome = true;
  } else if (today < new Date("2025-06-20")) {
    // Entre primeiro e segundo jogo: PSG
    matchDate = "2025-06-19";
    matchTime = "22:00";
    opponent = "Paris SG";
    isHome = false;
  } else {
    // Após segundo jogo ou padrão: Atlético Madrid
    matchDate = "2025-06-22";
    matchTime = "19:30";
    opponent = "Atlético Madrid";
    isHome = false;
  }

  const formattedDate = moment(matchDate).format("DD [de] MMMM [de] YYYY");

  // Montar o jogo
  return {
    id: `sim-${Math.random().toString(36).substr(2, 9)}`,
    competition: "FIFA Club World Cup",
    date: matchDate,
    time: matchTime,
    formattedDate: formattedDate,
    formattedDateTime: `${formattedDate} às ${matchTime}`,
    venue: isHome ? "Estádio Nilton Santos, Rio de Janeiro" : "A definir",
    round: "Grupo B",
    status: "SCHEDULED",
    elapsed: null,
    teams: {
      home: {
        id: isHome ? "134285" : "0",
        name: isHome ? "Botafogo" : opponent,
        logo: isHome
          ? "https://www.botafogo.com.br/img/escudo.png"
          : getOpponentLogo(opponent),
        score: null,
        isBotafogo: isHome,
      },
      away: {
        id: isHome ? "0" : "134285",
        name: isHome ? opponent : "Botafogo",
        logo: isHome
          ? getOpponentLogo(opponent)
          : "https://www.botafogo.com.br/img/escudo.png",
        score: null,
        isBotafogo: !isHome,
      },
    },
  };
};

/**
 * Helper para obter o logo do adversário
 */
const getOpponentLogo = (opponent) => {
  if (opponent.includes("Seattle")) {
    return "https://logodownload.org/wp-content/uploads/2019/10/seattle-sounders-logo-1.png";
  }
  if (opponent.includes("Paris")) {
    return "https://logodownload.org/wp-content/uploads/2017/02/psg-logo-paris-saint-germain-logo-1.png";
  }
  if (opponent.includes("Atlético") || opponent.includes("Atletico")) {
    return "https://logodownload.org/wp-content/uploads/2018/09/atletico-madrid-logo-1.png";
  }
  return "https://upload.wikimedia.org/wikipedia/commons/c/c1/Empty_football_team_logo.png";
};
