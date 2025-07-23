import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ScrollView,
  Pressable,
  Easing,
} from "react-native";
import { Audio } from "expo-av";
import { db as database } from "../../services/firebase";
import { ref, get, update } from "firebase/database";
import moment from "moment";
import AuthAlert from "../../components/AuthAlert";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import InstagramFeed from "../../components/InstagramFeed";
import YouTubeFeed from "../../components/YouTubeFeed";
import BlogFeed from "../../components/BlogFeed";

// Letreiro rodante
const MARQUEE_TEXT = "Fogão do Meu Coração - Confira as novidades";
const MARQUEE_DURATION = 9000;

const festivoStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    elevation: 10,
  },
  title: { fontSize: 60, marginBottom: 16 },
  msg: {
    fontSize: 22,
    color: "#D1AC00",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  btn: {
    backgroundColor: "#D1AC00",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  btnText: { color: "#222", fontWeight: "bold", fontSize: 18 },
});

export default function Home() {
  const marqueeAnim = useRef(new Animated.Value(0)).current;
  const [marqueeWidth, setMarqueeWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (marqueeWidth > 0 && containerWidth > 0) {
      marqueeAnim.setValue(0);
      Animated.loop(
        Animated.timing(marqueeAnim, {
          toValue: -marqueeWidth,
          duration: MARQUEE_DURATION,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    }
  }, [marqueeWidth, containerWidth, marqueeAnim]);
  const { user, loading: authLoading } =
    require("../../components/AuthContext").useAuth();
  const [showFestivo, setShowFestivo] = useState(false);
  const [festivoMsg, setFestivoMsg] = useState("");
  const anim = useRef(new Animated.Value(0)).current;
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  // Função para tocar som
  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/victory.mp3")
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 3000);
    } catch (_e) {}
  };

  // Função para verificar missão diária e mostrar efeito
  useEffect(() => {
    if (!user || authLoading) return;
    const checkDailyMission = async () => {
      try {
        const missoesRef = ref(database, `users/${user.uid}/missoes`);
        const pontosRef = ref(database, `users/${user.uid}/pontos`);
        const [missoesSnap, pontosSnap] = await Promise.all([
          get(missoesRef),
          get(pontosRef),
        ]);
        let missao = missoesSnap.exists() ? missoesSnap.val() : {};
        let pontos = pontosSnap.exists() ? pontosSnap.val() : 0;
        const hoje = moment().format("YYYY-MM-DD");
        if (missao.ultimaMissaoDiaria !== hoje) {
          // Missão ainda não feita hoje: marcar como feita e somar pontos
          const novosPontos = pontos + 100;
          await update(ref(database, `users/${user.uid}`), {
            pontos: novosPontos,
            missoes: {
              ...missao,
              ultimaMissaoDiaria: hoje,
              missaoDiariaConcluida: true,
            },
          });
          setFestivoMsg(
            "Parabéns! Você ganhou 100 pontos por entrar no app hoje!"
          );
          setShowFestivo(true);
          playSound();
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }
      } catch (_e) {}
    };
    checkDailyMission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  function handleProtectedNavigation(route) {
    if (authLoading) return;
    if (!user) {
      setShowAuthAlert(true);
      return;
    }
    router.push(route);
  }

  // Modal festivo
  const FestivoModal = () => (
    <Modal visible={showFestivo} transparent animationType="fade">
      <View style={festivoStyles.overlay}>
        <Animated.View
          style={[
            festivoStyles.modal,
            {
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.7],
              }),
            },
          ]}
        >
          <Text style={festivoStyles.title}>🎉</Text>
          <Text style={festivoStyles.msg}>{festivoMsg}</Text>
          <TouchableOpacity
            style={festivoStyles.btn}
            onPress={() => setShowFestivo(false)}
          >
            <Text style={festivoStyles.btnText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1 }}>
      <FestivoModal />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fogão do Meu Coração</Text>
        </View>

        {/* Card de Pontos */}
        <Pressable
          onPress={() => handleProtectedNavigation("/jogos/meus-pontos")}
          style={styles.pontosCard}
        >
          <Ionicons
            name="star"
            size={36}
            color="#D1AC00"
            style={{ marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.pontosCardTitle}>Sistema de Pontos</Text>
            <Text style={styles.pontosCardSubtitle}>
              Confira seu saldo de pontos, missões diárias e conquiste
              recompensas!
            </Text>
            <Text style={styles.pontosCardAcessar}>Acessar meus pontos</Text>
          </View>
        </Pressable>

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
  marqueeContainer: {
    height: 38,
    overflow: "visible",
    justifyContent: "center",
    marginHorizontal: 0,
    marginTop: 8,
    marginBottom: 8,
  },
  marqueeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    textShadowColor: "#fff8dc",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    letterSpacing: 1,
    paddingHorizontal: 16,
    textAlign: "left",
    // Efeito "brilhante" simples
    textShadowOpacity: 0.8,
  },
  pontosCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#D1AC00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  pontosCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 4,
  },
  pontosCardSubtitle: {
    color: "#CCCCCC",
    fontSize: 14,
    marginBottom: 8,
  },
  pontosCardAcessar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 2,
    textDecorationLine: "underline",
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
