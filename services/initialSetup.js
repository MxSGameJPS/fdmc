import AsyncStorage from "@react-native-async-storage/async-storage";
import * as rssParser from "react-native-rss-parser";

export async function initializeContentTracking() {
  try {
    // Verificar se já foi inicializado
    const initialized = await AsyncStorage.getItem(
      "contentTrackingInitialized"
    );
    if (initialized === "true") {
      console.log("Rastreamento de conteúdo já inicializado anteriormente.");
      return;
    }

    console.log("Inicializando rastreamento de conteúdo...");

    // YouTube
    try {
      const channelId = "UCGYyVRxyMn-7YuConcWEqYQ";
      const youtubeRssFeedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

      const youtubeResponse = await fetch(youtubeRssFeedUrl);
      const youtubeText = await youtubeResponse.text();
      const youtubeFeed = await rssParser.parse(youtubeText);

      if (youtubeFeed.items.length > 0) {
        const latestVideoId = youtubeFeed.items[0].id.split(":").pop();
        await AsyncStorage.setItem("lastCheckedVideoId", latestVideoId);
        console.log("Último vídeo do YouTube registrado:", latestVideoId);
      }
    } catch (youtubeError) {
      console.error(
        "Erro ao inicializar rastreamento do YouTube:",
        youtubeError
      );
    }

    // Instagram
    try {
      const instagramRssFeedUrl = "https://rss.app/feeds/DlcJyIwzZWwEy4Uu.xml";

      const instagramResponse = await fetch(instagramRssFeedUrl);
      const instagramText = await instagramResponse.text();
      const instagramFeed = await rssParser.parse(instagramText);

      if (instagramFeed.items.length > 0) {
        const latestPostId = instagramFeed.items[0].id;
        await AsyncStorage.setItem("lastCheckedInstagramId", latestPostId);
        console.log("Último post do Instagram registrado:", latestPostId);
      }
    } catch (instagramError) {
      console.error(
        "Erro ao inicializar rastreamento do Instagram:",
        instagramError
      );
    }

    // Blog
    try {
      const blogRssFeedUrl = "https://www.site-do-contratante.com/feed/";

      const blogResponse = await fetch(blogRssFeedUrl);
      const blogText = await blogResponse.text();
      const blogFeed = await rssParser.parse(blogText);

      if (blogFeed.items.length > 0) {
        const latestPostId = blogFeed.items[0].id || blogFeed.items[0].guid;
        await AsyncStorage.setItem("lastCheckedBlogId", latestPostId);
        console.log("Última postagem do blog registrada:", latestPostId);
      }
    } catch (blogError) {
      console.error("Erro ao inicializar rastreamento do blog:", blogError);
    }

    // Marcar como inicializado
    await AsyncStorage.setItem("contentTrackingInitialized", "true");
    console.log("Rastreamento de conteúdo inicializado com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar rastreamento de conteúdo:", error);
  }
}

// Limpar rastreamento (útil para testes)
export async function resetContentTracking() {
  try {
    await AsyncStorage.removeItem("contentTrackingInitialized");
    await AsyncStorage.removeItem("lastCheckedVideoId");
    await AsyncStorage.removeItem("lastCheckedInstagramId");
    await AsyncStorage.removeItem("lastCheckedBlogId");
    console.log("Rastreamento de conteúdo redefinido com sucesso!");
  } catch (error) {
    console.error("Erro ao redefinir rastreamento de conteúdo:", error);
  }
}
