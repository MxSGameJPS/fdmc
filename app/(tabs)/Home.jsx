import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import AuthAlert from "../../components/AuthAlert";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import InstagramFeed from "../../components/InstagramFeed";
import YouTubeFeed from "../../components/YouTubeFeed";
import BlogFeed from "../../components/BlogFeed";

export default function Home() {
  const { user, loading } = require("../../components/AuthContext").useAuth();
  const [showAuthAlert, setShowAuthAlert] = React.useState(false);
  function handleProtectedNavigation(route) {
    if (loading) return;
    if (!user) {
      setShowAuthAlert(true);
      return;
    }
    router.push(route);
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fogão do Meu Coração</Text>
        </View>

        {/* Seção do Blog */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notícias</Text>
            <Pressable
              onPress={() => handleProtectedNavigation("/(tabs)/Blog")}
              style={styles.viewMoreButton}
            >
              <Text style={styles.viewMoreText}>Ver mais</Text>
              <Ionicons name="arrow-forward" size={16} color="#666" />
            </Pressable>
          </View>
          <BlogFeed limit={5} showTitle={false} showViewMore={false} />
        </View>

        {/* Seção do YouTube */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos Vídeos</Text>
            <Pressable
              onPress={() => handleProtectedNavigation("/midia/youtube")}
              style={styles.viewMoreButton}
            >
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

        {/* Seção do Instagram */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Instagram</Text>
            <Pressable
              onPress={() => handleProtectedNavigation("/midia/instagram")}
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

        {/* Seção do Mapa de Calor da Torcida */}
        <View style={styles.section}>
          <Pressable
            onPress={() => handleProtectedNavigation("/midia/mapa-calor")}
            style={styles.heatmapCard}
          >
            <Ionicons
              name="flame"
              size={40}
              color="#D1AC00"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.heatmapTitle}>Mapa de Calor da Torcida</Text>
            <Text style={styles.heatmapSubtitle}>
              Veja onde está a Nação Alvinegra espalhada pelo Brasil e pelo
              mundo!
            </Text>
            <Text style={styles.heatmapButton}>Acessar Mapa de Calor</Text>
          </Pressable>
        </View>

        {/* Seção do Brasileirão */}
        <View style={styles.section}>
          <Pressable
            onPress={() =>
              handleProtectedNavigation("/competicoes/brasileirao")
            }
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
            onPress={() => handleProtectedNavigation("/(tabs)/Jogos")}
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
            </View>
            <View style={styles.jogosInfo}>
              <Text style={styles.jogosText}>
                Calendário atualizado com os próximos 9 jogos
              </Text>
              <Text style={styles.jogosText}>
                {`Inclui partidas do Brasileirão, Copa do Brasil e Libertadores`}
              </Text>
              <Text style={styles.jogosUpdate}>Atualizado em: 10/07/2025</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.footer} />
      </ScrollView>
      <AuthAlert
        visible={showAuthAlert}
        onClose={() => setShowAuthAlert(false)}
      />
    </View>
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
  heatmapCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    alignItems: "center",
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#D1AC00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  heatmapTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 6,
    textAlign: "center",
  },
  heatmapSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 16,
    textAlign: "center",
  },
  heatmapButton: {
    backgroundColor: "#D1AC00",
    color: "#222",
    fontWeight: "bold",
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
    textAlign: "center",
    overflow: "hidden",
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
