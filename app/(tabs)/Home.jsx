import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import InstagramFeed from "../../components/InstagramFeed";
import YouTubeFeed from "../../components/YouTubeFeed";
import BlogFeed from "../../components/BlogFeed";
import BrasileiraoWidget from "../../components/BrasileiraoWidget";

export default function Home() {
  // Funções para navegar para as páginas completas
  const navigateToYouTube = () => router.push("/(tabs)/Midia");
  const navigateToInstagram = () => router.push("/(tabs)/Midia");
  const navigateToBlog = () => router.push("/(tabs)/Blog");
  const navigateToBrasileirao = () => router.push("/(tabs)/Competicoes");
  const navigateToJogos = () => router.push("/(tabs)/Jogos");

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
          <Pressable
            onPress={navigateToInstagram}
            style={styles.viewMoreButton}
          >
            <Text style={styles.viewMoreText}>Ver mais</Text>
            <Ionicons name="arrow-forward" size={16} color="#666" />
          </Pressable>
        </View>
        <InstagramFeed limit={3} showTitle={false} showViewMore={false} />
      </View>

      {/* Seção do Brasileirão */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Brasileirão 2025</Text>
          <Pressable
            onPress={navigateToBrasileirao}
            style={styles.viewMoreButton}
          >
            <Text style={styles.viewMoreText}>Ver classificação</Text>
            <Ionicons name="arrow-forward" size={16} color="#666" />
          </Pressable>
        </View>
        <BrasileiraoWidget height={300} showHeader={false} showFooter={false} />
      </View>

      {/* Seção Próximos Jogos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Jogos</Text>
          <Pressable onPress={navigateToJogos} style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>Ver calendário</Text>
            <Ionicons name="arrow-forward" size={16} color="#666" />
          </Pressable>
        </View>
        <View style={styles.jogosInfo}>
          <Text style={styles.jogosText}>
            Calendário atualizado com os próximos 9 jogos
          </Text>
          <Text style={styles.jogosText}>
            Inclui partidas do Brasileirão, Copa do Brasil e Libertadores
          </Text>
          <Text style={styles.jogosUpdate}>Atualizado em: 10/07/2025</Text>
        </View>
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
  },
  jogosInfo: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
  },
  jogosText: {
    color: "#CCCCCC",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  jogosUpdate: {
    color: "#D1AC00",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
});
