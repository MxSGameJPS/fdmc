import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/pt-br";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchPostsFromXml } from "../../services/blogService";
import AuthAlert from "../../components/AuthAlert";

moment.locale("pt-br");

export default function Blog() {
  const { user, loading } = require("../../components/AuthContext").useAuth();
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [posts, setPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (forceRefresh = false) => {
    try {
      setBlogLoading(true);
      setError(null);

      // Usar a nova função para extrair diretamente do XML
      const blogPosts = await fetchPostsFromXml();
      setPosts(blogPosts);
    } catch (error) {
      console.error("Erro ao carregar posts do blog:", error);
      setError(
        "Não foi possível carregar as notícias. Tente novamente mais tarde."
      );
    } finally {
      setBlogLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts(true);
  };

  const formatDate = (dateString) => {
    return moment(dateString).format("DD [de] MMMM [de] YYYY");
  };

  const openPost = (url) => {
    if (loading) return;
    if (!user) {
      setShowAuthAlert(true);
      return;
    }
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Erro ao abrir URL do post:", err)
      );
    }
  };

  const renderPostItem = ({ item }) => {
    // Determinar a categoria principal para exibição
    const mainCategory =
      item.categories && item.categories.length > 0
        ? item.categories[0]
        : "Notícia";

    return (
      <Pressable style={styles.postCard} onPress={() => openPost(item.link)}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
            onError={(e) => {
              console.error(`Erro ao carregar imagem: ${item.imageUrl}`);
            }}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="newspaper-outline" size={48} color="#ddd" />
          </View>
        )}

        <View style={styles.postContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{mainCategory}</Text>
          </View>

          <Text style={styles.postTitle}>{item.title}</Text>

          <Text style={styles.postDate}>
            {formatDate(item.publishedAt)} • Por {item.author}
          </Text>

          <Text style={styles.postExcerpt}>{item.excerpt}</Text>

          <View style={styles.readMoreContainer}>
            <Text style={styles.readMoreText}>Leia mais</Text>
            <Ionicons name="arrow-forward" size={16} color="#d1ac00" />
          </View>
        </View>
      </Pressable>
    );
  };

  if (blogLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Carregando notícias...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => loadPosts(true)}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notícias</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#000000", "#696969"]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhuma notícia encontrada. Puxe para baixo para atualizar.
          </Text>
        }
      />
      <AuthAlert
        visible={showAuthAlert}
        onClose={() => setShowAuthAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    backgroundColor: "#000000",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    backgroundColor: "#000000",
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
  },
  postCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postImage: {
    width: "100%",
    height: 180,
  },
  noImageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    alignItems: "center",
  },
  postContent: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    lineHeight: 24,
  },
  postDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#d1ac00",
    marginRight: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
    fontSize: 16,
  },
});
