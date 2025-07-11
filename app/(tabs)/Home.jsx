import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import InstagramFeed from "../../components/InstagramFeed";
import YouTubeFeed from "../../components/YouTubeFeed";
import BlogFeed from "../../components/BlogFeed";
import BrasileiraoWidget from "../../components/BrasileiraoWidget";

export default function Home() {
  // Funções para navegar para as páginas completas
  const navigateToYouTube = () => router.push("/midia/youtube");
  const navigateToInstagram = () => router.push("/midia/instagram");
  const navigateToBlog = () => router.push("/(tabs)/Blog");
  const navigateToBrasileirao = () => router.push("/competicoes/brasileirao");
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
        <BlogFeed limit={5} showTitle={false} showViewMore={false} />
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
        <YouTubeFeed
          limit={5}
          showTitle={false}
          showViewMore={false}
          horizontalCard
        />
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
        <InstagramFeed
          limit={5}
          showTitle={false}
          showViewMore={false}
          horizontalCard
        />
      </View>

      {/* Card do Mapa de Calor */}
      <View
        style={{
          backgroundColor: "#222",
          borderRadius: 12,
          margin: 16,
          marginBottom: 0,
          overflow: "hidden",
        }}
      >
        <Pressable
          onPress={() => router.push("/midia/mapa-calor")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Ionicons
            name="flame"
            size={32}
            color="#d1ac00"
            style={{ marginRight: 16 }}
          />
          <View>
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 18,
                marginBottom: 4,
              }}
            >
              Mapa de Calor da Torcida
            </Text>
            <Text
              style={{
                color: "#aaa",
                fontSize: 15,
                fontWeight: "500",
                marginTop: 2,
                maxWidth: 250,
              }}
            >
              Descubra onde está a Nação Alvinegra espalhada pelo Brasil! Toque
              para ver o mapa de calor exclusivo da torcida do Fogão.
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Seção do Brasileirão */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Brasileirão 2025</Text>
        </View>
        <Pressable
          onPress={navigateToBrasileirao}
          style={{
            backgroundColor: "#D1AC00",
            borderRadius: 8,
            paddingVertical: 14,
            paddingHorizontal: 24,
            alignItems: "center",
            marginHorizontal: 16,
            marginBottom: 16,
            marginTop: 8,
            elevation: 2,
          }}
        >
          <Text style={{ color: "#222", fontWeight: "bold", fontSize: 16 }}>
            Confira a classificação do Brasileirão agora
          </Text>
        </Pressable>
      </View>

      {/* Seção Próximos Jogos */}
      <View style={styles.section}>
        <Pressable
          onPress={navigateToJogos}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#222",
            marginHorizontal: 8,
            marginBottom: 8,
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos Jogos</Text>
            {/* <View style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>Ver calendário</Text>
              <Ionicons name="arrow-forward" size={16} color="#666" />
            </View> */}
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
        </Pressable>
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
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 20,
    padding: 8,
    fontWeight: "bold",
    color: "#fff",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
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
