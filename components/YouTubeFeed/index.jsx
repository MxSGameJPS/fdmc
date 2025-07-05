import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Card from "../card";

export default function YouTubeFeed({
  limit,
  showTitle = true,
  showViewMore = true,
}) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadVideos();
  }, []);

  // Função para carregar vídeos, primeiro tentando do cache
  const loadVideos = async () => {
    setLoading(true);

    try {
      // Tenta carregar do cache primeiro
      const cachedVideos = await getCachedVideos();

      if (cachedVideos && cachedVideos.length > 0) {
        console.log("Usando vídeos em cache");
        setVideos(limit ? cachedVideos.slice(0, limit) : cachedVideos);
        setError(null);
        setLoading(false);

        // Verifica se o cache está obsoleto (mais de 6 horas)
        const cacheInfo = await AsyncStorage.getItem("youtube_cache_timestamp");
        if (cacheInfo) {
          const cacheTimestamp = parseInt(cacheInfo);
          const hoursElapsed = (Date.now() - cacheTimestamp) / (1000 * 60 * 60);

          // Se o cache tiver mais de 6 horas, atualize em segundo plano
          if (hoursElapsed > 6) {
            console.log("Cache obsoleto, atualizando em segundo plano");
            fetchYouTubeVideosInBackground();
          }
        }
      } else {
        // Se não houver cache, busque normalmente
        await fetchYouTubeVideos();
      }
    } catch (error) {
      console.error("Erro ao carregar vídeos:", error);
      await fetchYouTubeVideos();
    }
  };

  // Função para obter vídeos do cache
  const getCachedVideos = async () => {
    try {
      const cachedData = await AsyncStorage.getItem("youtube_videos_cache");
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error("Erro ao ler cache:", error);
      return null;
    }
  };

  // Função para obter IDs de vídeos do cache
  const getCachedVideoIds = async () => {
    try {
      const cachedIds = await AsyncStorage.getItem("youtube_video_ids_cache");
      if (cachedIds) {
        return JSON.parse(cachedIds);
      }
      return null;
    } catch (error) {
      console.error("Erro ao ler cache de IDs:", error);
      return null;
    }
  };

  // Função para salvar vídeos no cache
  const saveVideosToCache = async (videos) => {
    try {
      await AsyncStorage.setItem(
        "youtube_videos_cache",
        JSON.stringify(videos)
      );
      await AsyncStorage.setItem(
        "youtube_cache_timestamp",
        Date.now().toString()
      );
    } catch (error) {
      console.error("Erro ao salvar cache:", error);
    }
  };

  // Função para salvar IDs de vídeos no cache
  const saveVideoIdsToCache = async (videoIds) => {
    try {
      await AsyncStorage.setItem(
        "youtube_video_ids_cache",
        JSON.stringify(videoIds)
      );
      await AsyncStorage.setItem(
        "youtube_ids_cache_timestamp",
        Date.now().toString()
      );
    } catch (error) {
      console.error("Erro ao salvar cache de IDs:", error);
    }
  };

  // Função para buscar vídeos em segundo plano sem afetar a UI
  const fetchYouTubeVideosInBackground = async () => {
    try {
      await fetchYouTubeVideos(true);
    } catch (error) {
      console.error("Erro ao atualizar vídeos em segundo plano:", error);
      // Não definimos o estado de erro para não afetar a UI
    }
  };

  const fetchYouTubeVideos = async (isBackgroundUpdate = false) => {
    if (!isBackgroundUpdate) {
      setLoading(true);
    }

    try {
      // ID da API Key
      const apiKey = "AIzaSyAWMupTOwaGu6aAC2cdPeOWato6pZj6piM";

      // Estratégia de 2 etapas para economizar cotas:
      // 1. Obter os IDs dos vídeos (do cache ou da API)
      // 2. Buscar detalhes dos vídeos usando endpoint /videos (mais econômico)

      let videoIds = [];

      // Tentar obter IDs do cache primeiro
      const cachedIds = await getCachedVideoIds();
      const idsNeedUpdate = !cachedIds || cachedIds.length === 0;

      // Se precisar atualizar IDs ou não tiver no cache, buscar da API
      if (idsNeedUpdate) {
        console.log("Buscando novos IDs de vídeos da playlist");

        // Usar playlistItems para obter apenas os IDs (consome apenas 1 cota)
        const playlistId = "UUGYyVRxyMn-7YuConcWEqYQ"; // Playlist de uploads (U + channelId)
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=20&fields=items(snippet/resourceId/videoId)`;

        const playlistResponse = await fetch(playlistUrl);
        const playlistData = await playlistResponse.json();

        if (playlistData.error) {
          throw new Error(playlistData.error.message);
        }

        // Extrair apenas os IDs dos vídeos
        videoIds = playlistData.items
          .filter(
            (item) =>
              item.snippet &&
              item.snippet.resourceId &&
              item.snippet.resourceId.videoId
          )
          .map((item) => item.snippet.resourceId.videoId);

        // Salvar IDs no cache para uso futuro
        if (videoIds.length > 0) {
          await saveVideoIdsToCache(videoIds);
        } else {
          throw new Error("Não foi possível obter IDs de vídeos");
        }
      } else {
        console.log("Usando IDs de vídeos do cache");
        videoIds = cachedIds;
      }

      // Agora, com os IDs em mãos, usar o endpoint /videos para obter detalhes
      // Este endpoint é mais econômico em termos de cotas
      if (videoIds.length > 0) {
        console.log(`Buscando detalhes de ${videoIds.length} vídeos`);

        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds.join(
          ","
        )}&part=snippet,contentDetails,statistics&maxResults=${
          videoIds.length
        }`;

        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();

        if (videosData.error) {
          throw new Error(videosData.error.message);
        }

        const formattedVideos = videosData.items.map((item) => {
          return {
            id: item.id,
            title: item.snippet?.title || "Vídeo sem título",
            content:
              item.snippet?.description ||
              "Assista a este vídeo no canal Fogão do Meu Coração.",
            imagem:
              item.snippet?.thumbnails?.high?.url ||
              item.snippet?.thumbnails?.default?.url ||
              "https://via.placeholder.com/480x360?text=Video+indisponível",
            link: `https://www.youtube.com/watch?v=${item.id}`,
            date: new Date(item.snippet?.publishedAt || new Date()),
            // Informações adicionais disponíveis na API /videos
            viewCount: item.statistics?.viewCount,
            duration: item.contentDetails?.duration,
          };
        });

        // Limite o número de vídeos se a propriedade limit for fornecida
        const limitedVideos = limit
          ? formattedVideos.slice(0, limit)
          : formattedVideos;

        setVideos(limitedVideos);
        setError(null);

        // Salvar no cache para uso futuro
        await saveVideosToCache(formattedVideos);
      } else {
        throw new Error("Lista de IDs de vídeos vazia");
      }
    } catch (error) {
      console.error("Erro ao buscar vídeos do YouTube:", error);

      if (!isBackgroundUpdate) {
        setError(
          "Não foi possível carregar os vídeos do YouTube. Tente novamente mais tarde."
        );

        // Se a API falhar, tente o método de RSS como fallback
        fetchYouTubeVideosViaRSS();
      }
    } finally {
      if (!isBackgroundUpdate) {
        setLoading(false);
      }
    }
  };

  // Método alternativo usando RSS (fallback)
  const fetchYouTubeVideosViaRSS = async () => {
    try {
      setLoading(true);

      const channelId = "UCGYyVRxyMn-7YuConcWEqYQ";
      const rssFeedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

      const response = await fetch(rssFeedUrl);
      const responseText = await response.text();

      // Parsing manual do XML se o rssParser não estiver disponível
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(responseText, "text/xml");

      const entries = xmlDoc.getElementsByTagName("entry");
      const formattedVideos = [];

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const videoId =
          entry.getElementsByTagName("yt:videoId")[0]?.textContent || "";
        const title =
          entry.getElementsByTagName("title")[0]?.textContent ||
          "Vídeo sem título";
        const content =
          entry.getElementsByTagName("media:description")[0]?.textContent ||
          entry.getElementsByTagName("content")[0]?.textContent ||
          "";

        formattedVideos.push({
          id: videoId,
          title: title,
          content:
            content || "Assista a este vídeo no canal Fogão do Meu Coração.",
          imagem: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          link: `https://www.youtube.com/watch?v=${videoId}`,
          date: new Date(
            entry.getElementsByTagName("published")[0]?.textContent ||
              new Date()
          ),
        });
      }

      // Limite o número de vídeos
      const limitedVideos = limit
        ? formattedVideos.slice(0, limit)
        : formattedVideos;

      setVideos(limitedVideos);
      setError(null);

      // Salva os vídeos do RSS no cache também
      await saveVideosToCache(formattedVideos);
    } catch (rssError) {
      console.error("Erro ao buscar vídeos do YouTube via RSS:", rssError);

      // Tentar usar dados offline armazenados no projeto
      try {
        console.log("Tentando carregar dados offline do YouTube");
        const offlineData = require("../../assets/data/youtube/videos.json");
        if (Array.isArray(offlineData) && offlineData.length > 0) {
          console.log(
            "Dados offline carregados com sucesso:",
            offlineData.length,
            "vídeos"
          );
          setVideos(limit ? offlineData.slice(0, limit) : offlineData);
          setError(
            "Usando dados offline. Não foi possível conectar ao YouTube."
          );
        } else {
          throw new Error("Dados offline inválidos");
        }
      } catch (offlineError) {
        console.error("Erro ao carregar dados offline:", offlineError);
        setError(
          "Não foi possível carregar os vídeos do YouTube. Verifique sua conexão."
        );
        setVideos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToYouTubePage = () => {
    router.push("/midia/youtube");
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d1ac00" />
        <Text style={styles.loadingText}>Carregando vídeos do YouTube...</Text>
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchYouTubeVideos}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showTitle && <Text style={styles.sectionTitle}>YouTube</Text>}

      {videos.length > 0 ? (
        <>
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card
                title={item.title}
                content={item.content}
                imagem={item.imagem}
                link={item.link} // Adicione esta linha
              />
            )}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!limit} // Desativa o scroll se for preview
          />

          {showViewMore && videos.length > 0 && (
            <Pressable
              style={styles.viewMoreButton}
              onPress={navigateToYouTubePage}
            >
              <Text style={styles.viewMoreText}>
                Ver mais vídeos do YouTube
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#666"
                style={styles.viewMoreIcon}
              />
            </Pressable>
          )}
        </>
      ) : (
        <Text style={styles.emptyText}>Nenhum vídeo encontrado</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#d1ac00",
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  viewMoreButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  viewMoreText: {
    color: "#333",
    fontWeight: "bold",
    marginRight: 8,
  },
  viewMoreIcon: {
    marginTop: 2,
  },
});
