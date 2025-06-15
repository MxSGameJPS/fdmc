import AsyncStorage from "@react-native-async-storage/async-storage";
import * as rssParser from "react-native-rss-parser";
import { sendLocalNotification } from "./notificationService";
import { getLiveBotafogoMatch } from "../thesportsdb/botafogo";

// Verificar conteúdo do YouTube
export async function checkYouTubeContent() {
  try {
    const channelId = "UCGYyVRxyMn-7YuConcWEqYQ";
    const rssFeedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    // Buscar últimos vídeos
    const response = await fetch(rssFeedUrl);
    const responseText = await response.text();
    const feed = await rssParser.parse(responseText);

    if (feed.items.length === 0) return;

    // Obter o ID do vídeo mais recente
    const latestVideo = feed.items[0];
    const latestVideoId = latestVideo.id.split(":").pop();

    // Obter o último vídeo verificado
    const lastCheckedVideoId = await AsyncStorage.getItem("lastCheckedVideoId");

    // Se o vídeo mais recente for diferente do último verificado, notificar
    if (latestVideoId !== lastCheckedVideoId) {
      console.log("Novo vídeo encontrado:", latestVideo.title);

      // Enviar notificação
      await sendLocalNotification(
        "Novo vídeo no YouTube!",
        `${latestVideo.title}`,
        {
          type: "youtube",
          videoId: latestVideoId,
          link: `https://www.youtube.com/watch?v=${latestVideoId}`,
        }
      );

      // Atualizar o último vídeo verificado
      await AsyncStorage.setItem("lastCheckedVideoId", latestVideoId);
      return true; // Indica que houve nova notificação
    }

    return false; // Indica que não houve nada novo
  } catch (error) {
    console.error("Erro ao verificar novos vídeos do YouTube:", error);
    return false;
  }
}

// Verificar conteúdo do Instagram
export async function checkInstagramContent() {
  try {
    const rssFeedUrl = "https://rss.app/feeds/DlcJyIwzZWwEy4Uu.xml";

    // Buscar últimos posts
    const response = await fetch(rssFeedUrl);
    const responseText = await response.text();
    const feed = await rssParser.parse(responseText);

    if (feed.items.length === 0) return false;

    // Obter o ID do post mais recente
    const latestPost = feed.items[0];
    const latestPostId = latestPost.id;

    // Obter o último post verificado
    const lastCheckedPostId = await AsyncStorage.getItem(
      "lastCheckedInstagramId"
    );

    // Se o post mais recente for diferente do último verificado, notificar
    if (latestPostId !== lastCheckedPostId) {
      console.log("Novo post do Instagram encontrado:", latestPost.title);

      // Enviar notificação
      await sendLocalNotification(
        "Nova postagem no Instagram!",
        `${latestPost.title}`,
        {
          type: "instagram",
          postId: latestPostId,
          link: latestPost.links[0]?.url,
        }
      );

      // Atualizar o último post verificado
      await AsyncStorage.setItem("lastCheckedInstagramId", latestPostId);
      return true; // Indica que houve nova notificação
    }

    return false; // Indica que não houve nada novo
  } catch (error) {
    console.error("Erro ao verificar novos posts do Instagram:", error);
    return false;
  }
}

// Verificar conteúdo do Blog
export async function checkBlogContent() {
  try {
    // URL correta do feed do blog
    const rssFeedUrl = "https://fogaodomeucoracao.com.br/feed";

    // Buscar últimos posts
    console.log("Verificando novos posts do blog em:", rssFeedUrl);

    const response = await fetch(rssFeedUrl);

    if (!response.ok) {
      throw new Error(`Resposta do feed não ok: ${response.status}`);
    }

    const responseText = await response.text();
    const feed = await rssParser.parse(responseText);

    if (feed.items.length === 0) {
      console.log("Feed do blog não contém itens");
      return false;
    }

    // Obter o post mais recente
    const latestPost = feed.items[0];
    const latestPostId = latestPost.id || latestPost.guid;

    // Extrair a imagem do post
    let imageUrl = null;

    // Método 1: Verificar enclosures (anexos) - comum em feeds RSS
    if (latestPost.enclosures && latestPost.enclosures.length > 0) {
      const imageEnclosure = latestPost.enclosures.find(
        (e) => e.mimeType && e.mimeType.startsWith("image/")
      );
      if (imageEnclosure) {
        imageUrl = imageEnclosure.url;
      }
    }

    // Método 2: Tentar extrair da mídia
    if (
      !imageUrl &&
      latestPost.media &&
      latestPost.media.thumbnails &&
      latestPost.media.thumbnails.length > 0
    ) {
      imageUrl = latestPost.media.thumbnails[0].url;
    }

    // Método 3: Tentar extrair do conteúdo HTML
    if (!imageUrl && latestPost.content) {
      const imgMatch = latestPost.content.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch && imgMatch[1]) {
        imageUrl = imgMatch[1];
      }
    }

    // Método 4: Tentar extrair do resumo HTML
    if (!imageUrl && latestPost.description) {
      const imgMatch = latestPost.description.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch && imgMatch[1]) {
        imageUrl = imgMatch[1];
      }
    }

    console.log("Post mais recente do blog:", latestPost.title);
    console.log("Imagem encontrada:", imageUrl);

    // Obter o último post verificado
    const lastCheckedPostId = await AsyncStorage.getItem("lastCheckedBlogId");

    // Se o post mais recente for diferente do último verificado, notificar
    if (latestPostId !== lastCheckedPostId) {
      console.log("Novo post do blog encontrado:", latestPost.title);

      // Enviar notificação
      await sendLocalNotification(
        "Nova publicação no Blog!",
        `${latestPost.title}`,
        {
          type: "blog",
          postId: latestPostId,
          link: latestPost.links[0]?.url,
          imageUrl: imageUrl,
          publishedAt: latestPost.published,
          author: latestPost.authors[0]?.name || "Fogão do Meu Coração",
        }
      );

      // Atualizar o último post verificado
      await AsyncStorage.setItem("lastCheckedBlogId", latestPostId);

      // Salvar o post completo para exibição
      const blogPosts = await getBlogPosts();
      blogPosts.unshift({
        id: latestPostId,
        title: latestPost.title,
        content: latestPost.content || latestPost.description,
        imageUrl: imageUrl,
        link: latestPost.links[0]?.url,
        publishedAt: latestPost.published,
        author: latestPost.authors[0]?.name || "Fogão do Meu Coração",
      });

      // Manter apenas os 20 posts mais recentes
      if (blogPosts.length > 20) {
        blogPosts.splice(20);
      }

      await saveBlogPosts(blogPosts);

      return true; // Indica que houve nova notificação
    }

    return false; // Indica que não houve nada novo
  } catch (error) {
    console.error("Erro ao verificar novos posts do blog:", error);
    return false;
  }
}

// Funções auxiliares para gerenciar posts do blog
async function getBlogPosts() {
  try {
    const postsJson = await AsyncStorage.getItem("blogPosts");
    return postsJson ? JSON.parse(postsJson) : [];
  } catch (error) {
    console.error("Erro ao obter posts do blog:", error);
    return [];
  }
}

async function saveBlogPosts(posts) {
  try {
    await AsyncStorage.setItem("blogPosts", JSON.stringify(posts));
  } catch (error) {
    console.error("Erro ao salvar posts do blog:", error);
  }
}

// Função para enviar uma notificação de teste
export async function sendTestNotification() {
  try {
    console.log('Enviando notificação de teste...');
    
    const success = await sendLocalNotification(
      "Notificação de Teste",
      "As notificações estão configuradas corretamente! 🎉",
      { 
        type: "test", 
        timestamp: new Date().toISOString() 
      }
    );
    
    console.log("Resultado do envio da notificação de teste:", success);
    return success;
  } catch (error) {
    console.error("Erro ao enviar notificação de teste:", error);
    return false;
  }
}

// Verificar se há jogos ao vivo do Botafogo
export async function checkLiveMatches() {
  try {
    console.log("Verificando jogos ao vivo...");

    // Verificar se há jogos ao vivo
    const liveMatch = await getLiveBotafogoMatch();

    if (!liveMatch) {
      console.log("Nenhum jogo ao vivo no momento.");
      return false;
    }

    // Verificar se já notificamos sobre este jogo ao vivo
    const lastNotifiedMatchId = await AsyncStorage.getItem("lastNotifiedLiveMatchId");

    // Se for o mesmo jogo, verificar se houve gol
    if (lastNotifiedMatchId === liveMatch.id) {
      // Verificar se houve mudança no placar
      const lastHomeScore = parseInt(await AsyncStorage.getItem("lastHomeScore") || "0");
      const lastAwayScore = parseInt(await AsyncStorage.getItem("lastAwayScore") || "0");

      const currentHomeScore = parseInt(liveMatch.teams.home.score || "0");
      const currentAwayScore = parseInt(liveMatch.teams.away.score || "0");

      // Se o placar mudou, notificar
      if (currentHomeScore !== lastHomeScore || currentAwayScore !== lastAwayScore) {
        // Determinar quem marcou
        const botafogoScored =
          (liveMatch.teams.home.isBotafogo && currentHomeScore > lastHomeScore) ||
          (liveMatch.teams.away.isBotafogo && currentAwayScore > lastAwayScore);

        const opponentScored =
          (!liveMatch.teams.home.isBotafogo && currentHomeScore > lastHomeScore) ||
          (!liveMatch.teams.away.isBotafogo && currentAwayScore > lastAwayScore);

        let title = "Atualização de placar!";
        let body = `${liveMatch.teams.home.name} ${currentHomeScore} x ${currentAwayScore} ${liveMatch.teams.away.name}`;

        if (botafogoScored) {
          title = "GOOOOOL DO FOGÃO! ⚽🔥";
          body = `${liveMatch.teams.home.name} ${currentHomeScore} x ${currentAwayScore} ${liveMatch.teams.away.name}`;
        } else if (opponentScored) {
          title = "Gol do adversário";
          body = `${liveMatch.teams.home.name} ${currentHomeScore} x ${currentAwayScore} ${liveMatch.teams.away.name}`;
        }

        // Enviar notificação
        await sendLocalNotification(title, body, {
          type: "live_match",
          matchId: liveMatch.id,
          homeScore: currentHomeScore,
          awayScore: currentAwayScore,
        });

        // Atualizar placar salvo
        await AsyncStorage.setItem("lastHomeScore", String(currentHomeScore));
        await AsyncStorage.setItem("lastAwayScore", String(currentAwayScore));

        return true;
      }

      return false; // Mesmo jogo, sem mudança no placar
    }

    // Novo jogo ao vivo, notificar
    await sendLocalNotification(
      "Jogo do Botafogo ao vivo! 🏁",
      `${liveMatch.teams.home.name} vs ${liveMatch.teams.away.name} - Clique para assistir!`,
      {
        type: "live_match",
        matchId: liveMatch.id,
        homeScore: liveMatch.teams.home.score || 0,
        awayScore: liveMatch.teams.away.score || 0,
      }
    );

    // Salvar ID do jogo e placar inicial
    await AsyncStorage.setItem("lastNotifiedLiveMatchId", liveMatch.id);
    await AsyncStorage.setItem("lastHomeScore", String(liveMatch.teams.home.score || 0));
    await AsyncStorage.setItem("lastAwayScore", String(liveMatch.teams.away.score || 0));

    return true;
  } catch (error) {
    console.error("Erro ao verificar jogos ao vivo:", error);
    return false;
  }
}

// Modificar checkAllNewContent para incluir verificação de jogos ao vivo
export async function checkAllNewContent() {
  try {
    console.log("=== Iniciando verificação de novos conteúdos ===");

    // Verificar jogos ao vivo (prioridade)
    const liveMatchResult = await checkLiveMatches();
    console.log(
      "- Jogos ao vivo verificados:",
      liveMatchResult ? "Atualização encontrada" : "Nada novo"
    );

    // Verificar outros conteúdos
    const youtubeResult = await checkYouTubeContent();
    const instagramResult = await checkInstagramContent();
    const blogResult = await checkBlogContent();

    const hasAnyNewContent = liveMatchResult || youtubeResult || instagramResult || blogResult;

    console.log(
      `=== Verificação concluída. Novos conteúdos encontrados: ${hasAnyNewContent} ===`
    );

    return hasAnyNewContent;
  } catch (error) {
    console.error("Erro ao verificar todos os conteúdos:", error);
    return false;
  }
}
