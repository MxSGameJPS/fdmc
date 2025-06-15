/**
 * Mapeamento de logos dos times que participarão do Mundial de Clubes
 * Garante que mesmo se a API não retornar logos, teremos imagens de alta qualidade
 */
export const TEAM_LOGOS = {
  // Time brasileiro
  Botafogo: "https://www.botafogo.com.br/img/escudo.png",
  "Botafogo FR": "https://www.botafogo.com.br/img/escudo.png",
  "Botafogo de Futebol e Regatas": "https://www.botafogo.com.br/img/escudo.png",

  // Times europeus
  "Real Madrid":
    "https://logodownload.org/wp-content/uploads/2016/05/real-madrid-logo-1.png",
  "Manchester City":
    "https://logodownload.org/wp-content/uploads/2017/02/manchester-city-fc-logo-escudo-badge.png",
  "Bayern Munich":
    "https://logodownload.org/wp-content/uploads/2017/02/bayern-munchen-fc-logo.png",
  "Paris Saint-Germain":
    "https://logodownload.org/wp-content/uploads/2017/02/psg-logo-paris-saint-germain-logo-1.png",
  "Paris SG":
    "https://logodownload.org/wp-content/uploads/2017/02/psg-logo-paris-saint-germain-logo-1.png",
  "Inter Milan":
    "https://logodownload.org/wp-content/uploads/2016/09/internazionale-logo-inter-de-milao.png",
  Juventus:
    "https://logodownload.org/wp-content/uploads/2017/02/juventus-logo-0.png",
  "Atlético Madrid":
    "https://logodownload.org/wp-content/uploads/2018/09/atletico-madrid-logo-1.png",
  "Atletico Madrid":
    "https://logodownload.org/wp-content/uploads/2018/09/atletico-madrid-logo-1.png",

  // Times sul-americanos
  Flamengo:
    "https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg",
  "River Plate":
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_C_A_River_Plate.svg",
  "Boca Juniors":
    "https://upload.wikimedia.org/wikipedia/commons/4/41/CABJ70.svg",
  Palmeiras:
    "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg",
  Fluminense:
    "https://upload.wikimedia.org/wikipedia/en/9/9e/Fluminense_fc_logo.svg",

  // Times norte-americanos
  "Seattle Sounders":
    "https://logodownload.org/wp-content/uploads/2019/10/seattle-sounders-logo-1.png",
  "Seattle Sounders FC":
    "https://logodownload.org/wp-content/uploads/2019/10/seattle-sounders-logo-1.png",
  Monterrey:
    "https://logodownload.org/wp-content/uploads/2017/05/cf-monterrey-rayados-logo-escudo.png",
  "Club León":
    "https://upload.wikimedia.org/wikipedia/en/5/51/ClubLeon2020.png",

  // Times asiáticos
  "Al-Hilal": "https://upload.wikimedia.org/wikipedia/en/a/a7/Al_Hilal_SFC.svg",
  "Al-Ahly":
    "https://upload.wikimedia.org/wikipedia/en/f/f1/Al_Ahly_SC_logo.svg",
  "Urawa Red Diamonds":
    "https://upload.wikimedia.org/wikipedia/en/e/e2/Urawa_Red_Diamonds.svg",
};

/**
 * Retorna um logo de alta qualidade para o time a partir do nome
 * @param {string} teamName - Nome do time
 * @returns {string} URL da imagem do escudo
 */
export const getTeamLogo = (teamName) => {
  if (!teamName) return null;

  // Verificar se temos o time exatamente no mapeamento
  if (TEAM_LOGOS[teamName]) {
    return TEAM_LOGOS[teamName];
  }

  // Verificar correspondência parcial (case insensitive)
  const normalizedName = teamName.toLowerCase();

  for (const [key, url] of Object.entries(TEAM_LOGOS)) {
    if (
      normalizedName.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedName)
    ) {
      return url;
    }
  }

  // Se não encontrar, retornar o badge da própria API
  return null;
};
