import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import InstagramFeed from "../../components/InstagramFeed";
import YouTubeFeed from "../../components/YouTubeFeed";
import BlogFeed from "../../components/BlogFeed";

export default function Home() {
  // Funções para navegar para as páginas completas
  const navigateToYouTube = () => router.push("/(tabs)/YouTube");
  const navigateToInstagram = () => router.push("/(tabs)/Instagram");
  const navigateToBlog = () => router.push("/(tabs)/Blog");

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fogão do Meu Coração</Text>
      </View>

       {/* Seção do Blog - 3 posts mais recentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notícias</Text>
          <Pressable onPress={navigateToBlog} style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>Ver mais</Text>
            <Ionicons name="arrow-forward" size={16} color="#666" />
          </Pressable>
        </View>
        <BlogFeed limit={3} showTitle={false} showViewMore={false} />
      </View>
      
      
      
      {/* Seção do YouTube - 3 vídeos mais recentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos Vídeos</Text>
          <Pressable onPress={navigateToYouTube} style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>Ver mais</Text>
            <Ionicons name="arrow-forward" size={16} color="#666" />
          </Pressable>
        </View>
        <YouTubeFeed limit={3} showTitle={false} showViewMore={false} />
      </View>
      
      {/* Seção do Instagram - 3 posts mais recentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Instagram</Text>
          <Pressable onPress={navigateToInstagram} style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>Ver mais</Text>
            <Ionicons name="arrow-forward" size={16} color="#666" />
          </Pressable>
        </View>
        <InstagramFeed limit={3} showTitle={false} showViewMore={false} />
      </View>
      
     
      
      {/* Espaço no final da página */}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    backgroundColor: "#000",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  content: {
    padding: 16,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewMoreText: {
    color: "#fff",
    marginRight: 4,
  },
  footer: {
    height: 40,
  }
});