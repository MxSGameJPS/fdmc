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
    fetchYouTubeVideos();
  }, []);

  const fetchYouTubeVideos = async () => {
    try {
      setLoading(true);

      // ID do canal do YouTube e API Key fornecidos
      const channelId = "UCGYyVRxyMn-7YuConcWEqYQ";
      const apiKey = "AIzaSyAWMupTOwaGu6aAC2cdPeOWato6pZj6piM";

      const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=20&type=video`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const formattedVideos = data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        content:
          item.snippet.description ||
          "Assista a este vídeo no canal Fogão do Meu Coração.",
        imagem: item.snippet.thumbnails.high.url,
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        date: new Date(item.snippet.publishedAt),
      }));

      // Limite o número de vídeos se a propriedade limit for fornecida
      const limitedVideos = limit
        ? formattedVideos.slice(0, limit)
        : formattedVideos;

      setVideos(limitedVideos);
      setError(null);

   
    } catch (error) {
      console.error("Erro ao buscar vídeos do YouTube:", error);
      setError(
        "Não foi possível carregar os vídeos do YouTube. Tente novamente mais tarde."
      );

      // Se a API falhar, tente o método de RSS como fallback
      fetchYouTubeVideosViaRSS();
    } finally {
      setLoading(false);
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
          entry.getElementsByTagName("yt:videoId")[0]?.textContent;
        const title = entry.getElementsByTagName("title")[0]?.textContent;
        const content =
          entry.getElementsByTagName("media:description")[0]?.textContent ||
          entry.getElementsByTagName("content")[0]?.textContent;

        formattedVideos.push({
          id: videoId,
          title: title,
          content:
            content || "Assista a este vídeo no canal Fogão do Meu Coração.",
          imagem: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          link: `https://www.youtube.com/watch?v=${videoId}`,
          date: new Date(
            entry.getElementsByTagName("published")[0]?.textContent
          ),
        });
      }

      // Limite o número de vídeos
      const limitedVideos = limit
        ? formattedVideos.slice(0, limit)
        : formattedVideos;

      setVideos(limitedVideos);
      setError(null);

     
    } catch (rssError) {
      console.error("Erro ao buscar vídeos do YouTube via RSS:", rssError);
      setError(
        "Não foi possível carregar os vídeos do YouTube. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToYouTubePage = () => {
    router.push("/(tabs)/YouTube");
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
