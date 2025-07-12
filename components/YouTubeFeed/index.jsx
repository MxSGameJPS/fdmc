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
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Card from "../card";
import { YOUTUBE_API_KEY } from "../../services/google";

export default function YouTubeFeed({
  limit,
  showTitle = true,
  showViewMore = true,
  horizontalCard = false,
}) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Sempre busca vídeos novos da API ao abrir a tela
    fetchYouTubeVideos();
  }, []);

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
      const apiKey = YOUTUBE_API_KEY;

      // Sempre buscar IDs novos da API (NÃO usar cache de IDs)
      const playlistId = "UUGYyVRxyMn-7YuConcWEqYQ"; // Playlist de uploads (U + channelId)
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=20&fields=items(snippet/resourceId/videoId)`;

      const playlistResponse = await fetch(playlistUrl);
      const playlistData = await playlistResponse.json();

      if (playlistData.error) {
        throw new Error(playlistData.error.message);
      }

      // Extrair apenas os IDs dos vídeos
      const videoIds = playlistData.items
        .filter(
          (item) =>
            item.snippet &&
            item.snippet.resourceId &&
            item.snippet.resourceId.videoId
        )
        .map((item) => item.snippet.resourceId.videoId);

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
      {videos.length > 0 && (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={horizontalCard ? styles.horizontalCard : {}}>
              {horizontalCard ? (
                <Pressable
                  style={styles.simpleCard}
                  onPress={() => {
                    if (item.link) {
                      try {
                        const Linking = require("react-native").Linking;
                        Linking.openURL(item.link);
                      } catch (e) {
                        console.error("Erro ao abrir link:", e);
                      }
                    }
                  }}
                >
                  {item.imagem ? (
                    <Image
                      source={{ uri: item.imagem }}
                      style={styles.simpleImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.noImageContainer}>
                      <Ionicons name="play-circle" size={36} color="#444" />
                    </View>
                  )}
                  <View style={styles.simpleContent}>
                    <Text style={styles.simpleTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <Card
                  title={item.title}
                  content={item.content}
                  imagem={item.imagem}
                  link={item.link}
                />
              )}
            </View>
          )}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          horizontal={horizontalCard}
          contentContainerStyle={
            horizontalCard ? { paddingHorizontal: 12 } : {}
          }
        />
      )}
      {/* {showViewMore && videos.length > 0 && (
        <Pressable
          style={styles.viewMoreButton}
          onPress={navigateToYouTubePage}
        >
          <Text style={styles.viewMoreText}>Ver mais vídeos do YouTube</Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color="#666"
            style={styles.viewMoreIcon}
          />
        </Pressable>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#d1ac00",
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 10,
    backgroundColor: "#222",
    borderRadius: 8,
  },
  viewMoreText: {
    color: "#fff",
    fontWeight: "bold",
    marginRight: 8,
  },
  viewMoreIcon: {
    marginLeft: 4,
  },
  simpleImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  noImageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  simpleContent: {
    padding: 10,
  },
  simpleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
    lineHeight: 18,
  },
  horizontalCard: {
    marginRight: 12,
    width: 220,
  },
  simpleCard: {
    backgroundColor: "#181818",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
    width: 200,
  },
});
