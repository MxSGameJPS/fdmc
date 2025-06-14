import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
  Image,
  Linking,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Card({ title, content, imagem, imagemLocal, link }) {
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Verificar se o card já foi curtido anteriormente
  useState(() => {
    const checkLikeStatus = async () => {
      try {
        // Usar title como identificador único para o card
        const storedLikeStatus = await AsyncStorage.getItem(`like_${title}`);
        if (storedLikeStatus) {
          const { isLiked, count } = JSON.parse(storedLikeStatus);
          setLiked(isLiked);
          setLikeCount(count);
        }
      } catch (error) {
        console.error("Erro ao carregar status de curtida:", error);
      }
    };

    checkLikeStatus();
  }, [title]);

  // Função para lidar com curtidas
  const handleLike = async () => {
    try {
      const newLiked = !liked;
      const newCount = newLiked ? likeCount + 1 : likeCount - 1;

      setLiked(newLiked);
      setLikeCount(newCount);

      // Salvar status de curtida no AsyncStorage
      await AsyncStorage.setItem(
        `like_${title}`,
        JSON.stringify({ isLiked: newLiked, count: newCount })
      );
    } catch (error) {
      console.error("Erro ao salvar curtida:", error);
    }
  };

  // Função para compartilhar
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${title}\n\n${content}\n\nVeja mais no app Fogão do Meu Coração!${
          link ? `\n\n${link}` : ""
        }`,
        url: link,
        title: title,
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  // Função para abrir o link
  const handleCardPress = () => {
    if (link) {
      Linking.openURL(link).catch((err) =>
        console.error("Erro ao abrir o link:", err)
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handleCardPress}
      activeOpacity={link ? 0.7 : 1}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.content}>{content}</Text>

        {!imageError ? (
          imagemLocal ? (
            <Image
              source={imagemLocal}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => {
                console.error(
                  "Erro ao carregar imagem local:",
                  e.nativeEvent.error
                );
                setImageError(true);
              }}
            />
          ) : imagem ? (
            <Image
              source={{ uri: imagem }}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => {
                console.error(
                  "Erro ao carregar imagem remota:",
                  e.nativeEvent.error
                );
                setImageError(true);
              }}
            />
          ) : null
        ) : (
          <View style={[styles.image, styles.errorContainer]}>
            <Text style={styles.errorText}>Imagem não disponível</Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? "#e74c3c" : "#666"}
            />
            {likeCount > 0 && <Text style={styles.likeCount}>{likeCount}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#666" />
          </TouchableOpacity>

          {link && (
            <View style={styles.linkIndicator}>
              <Ionicons name="open-outline" size={16} color="#666" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  errorContainer: {
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#888",
  },
  cardActions: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    padding: 5,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  linkIndicator: {
    marginLeft: "auto",
    padding: 5,
  },
});
