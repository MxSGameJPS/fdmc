import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as rssParser from "react-native-rss-parser";
import Card from "../card";

export default function InstagramFeed({
  limit,
  showTitle = true,
  showViewMore = true,
  horizontalCard = false,
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  const fetchInstagramPosts = async () => {
    try {
      setLoading(true);
      // Feed RSS do Instagram que você já criou no RSS.app
      const rssFeedUrl = "https://rss.app/feeds/YpLRvnez80QZoeKK.xml";

      const response = await fetch(rssFeedUrl);
      const responseText = await response.text();
      const feed = await rssParser.parse(responseText);

      const formattedPosts = feed.items.map((item) => {
        // Métodos avançados para extração de imagens
        const imageUrl = extractBestImage(item);

        return {
          id: item.id,
          title: item.title || "Post do Instagram",
          content: cleanDescription(item.description),
          imagem: imageUrl,
          link: item.links[0]?.url,
          date: new Date(item.published),
        };
      });

      // Limite o número de posts
      const limitedPosts = limit
        ? formattedPosts.slice(0, limit)
        : formattedPosts;

      setPosts(limitedPosts);
      setError(null);

      // Log para debug
    } catch (error) {
      console.error("Erro ao buscar posts do Instagram:", error);
      setError(
        "Não foi possível carregar os posts do Instagram. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  // Função aprimorada para extrair a melhor imagem disponível
  const extractBestImage = (item) => {
    // Tenta vários métodos para extrair imagens em ordem de prioridade

    // 1. Verificar se há enclosures (anexos) com imagens
    if (item.enclosures && item.enclosures.length > 0) {
      const imageEnclosure = item.enclosures.find(
        (e) => e.mimeType && e.mimeType.startsWith("image/")
      );
      if (imageEnclosure && imageEnclosure.url) {
        return imageEnclosure.url;
      }
    }

    // 2. Verificar se há media:content
    if (item.mediaContent && item.mediaContent.length > 0) {
      const mediaWithImage = item.mediaContent.find(
        (m) => m.medium === "image" || (m.type && m.type.startsWith("image/"))
      );
      if (mediaWithImage && mediaWithImage.url) {
        return mediaWithImage.url;
      }
    }

    // 3. Verificar no conteúdo HTML por imagens de alta qualidade
    if (item.content) {
      // Procurar por imagens grandes no formato Instagram
      const instagramMatch = item.content.match(
        /<img[^>]+src="([^"]+instagram[^"]+\.jpg)[^"]*"/
      );
      if (instagramMatch && instagramMatch[1]) {
        return instagramMatch[1];
      }

      // Procurar por qualquer imagem no conteúdo
      const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    }

    // 4. Verificar na descrição por imagens
    if (item.description) {
      const imgMatch = item.description.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    }

    // 5. Verificar se há atributo imageUrl no item
    if (item.imageUrl) {
      return item.imageUrl;
    }

    // Verificar padrões específicos do RSS.app
    if (item.content) {
      // O RSS.app frequentemente coloca imagens em divs com classes específicas
      const rssAppMatch = item.content.match(
        /<div class="rssapp-card-media"[^>]*>\s*<img[^>]+src="([^"]+)"/
      );
      if (rssAppMatch && rssAppMatch[1]) {
        return rssAppMatch[1];
      }
    }

    return null;
  };

  // Função para limpar a descrição HTML
  const cleanDescription = (html) => {
    if (!html) return "";

    // Remove tags HTML
    let text = html.replace(/<[^>]*>?/gm, "").trim();

    // Remove URLs
    text = text.replace(/https?:\/\/\S+/g, "");

    // Remove excesso de espaços em branco
    text = text.replace(/\s+/g, " ");

    return text;
  };

  const navigateToInstagramPage = () => {
    router.push("/(tabs)/Instagram");
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d1ac00" />
        <Text style={styles.loadingText}>Carregando posts do Instagram...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchInstagramPosts}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showTitle && <Text style={styles.sectionTitle}>Instagram</Text>}

      {posts.length > 0 ? (
        <>
          <FlatList
            data={posts}
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
                        <Ionicons name="image" size={36} color="#444" />
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
            horizontal={horizontalCard}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              horizontalCard ? { paddingHorizontal: 12 } : {}
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum post disponível</Text>
              </View>
            }
          />

          {showViewMore && posts.length > 0 && (
            <Pressable
              style={styles.viewMoreButton}
              onPress={navigateToInstagramPage}
            >
              <Text style={styles.viewMoreText}>
                Ver mais posts do Instagram
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
        <Text style={styles.emptyText}>Nenhum post encontrado</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
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
  horizontalCard: {
    width: 220,
    marginHorizontal: 4,
  },
  simpleCard: {
    width: 220,
    backgroundColor: "#1c1c1c",
    borderRadius: 8,
    marginHorizontal: 4,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  simpleImage: {
    width: "100%",
    height: 120,
  },
  noImageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
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
});
