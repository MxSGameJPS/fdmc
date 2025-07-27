import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Stack, router } from "expo-router";
import { db as database } from "../../services/firebase";
import { ref, get, update } from "firebase/database";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MeusPontos() {
  // Verificação de palpite após o jogo
  // Estado para feedback dos palpites
  const [palpiteFeedback, setPalpiteFeedback] = useState(null);
  const [historicoPalpites, setHistoricoPalpites] = useState([]);
  const [palpiteFeito, setPalpiteFeito] = useState(null);

  async function verificarPalpite() {
    try {
      const palpiteStr = await AsyncStorage.getItem("palpiteAtual");
      if (!palpiteStr) return;
      const palpite = JSON.parse(palpiteStr);
      // Buscar resultado do jogo
      const res = await fetch(
        "https://fdmc-api.vercel.app/api/resultados?id=" + palpite.jogoId
      );
      const resultado = await res.json();
      if (!resultado) return;
      // Comparação dos campos
      let pontosGanhos = 0;
      let missoesUpdate = {};
      let feedback = [];
      // Acertou resultado do jogo
      let acertouAlgo = false;
      if (
        resultado.placarMandante === palpite.placarMandante &&
        resultado.placarVisitante === palpite.placarVisitante
      ) {
        missoesUpdate.acertouResultadoDoJogo = true;
        pontosGanhos += 50;
        feedback.push({
          label: "Acertou o placar exato!",
          pontos: 50,
          ok: true,
        });
        acertouAlgo = true;
      } else {
        feedback.push({
          label: "Errou o placar exato.",
          pontos: 0,
          ok: false,
        });
      }
      // Acertou quem fez gol
      if (
        Array.isArray(resultado.goleadores) &&
        palpite.goleadores.every((g) => resultado.goleadores.includes(g))
      ) {
        missoesUpdate.acertouQuemFezGol = true;
        pontosGanhos += 30;
        feedback.push({
          label: "Acertou todos os goleadores!",
          pontos: 30,
          ok: true,
        });
        acertouAlgo = true;
      } else {
        feedback.push({
          label: "Errou os goleadores.",
          pontos: 0,
          ok: false,
        });
      }
      // Acertou melhor jogador
      if (resultado.melhorJogador === palpite.melhorJogador) {
        missoesUpdate.acertouMelhorJogador = true;
        pontosGanhos += 10;
        feedback.push({
          label: "Acertou o melhor jogador!",
          pontos: 10,
          ok: true,
        });
        acertouAlgo = true;
      } else {
        feedback.push({
          label: "Errou o melhor jogador.",
          pontos: 0,
          ok: false,
        });
      }
      // Atualizar pontos, missões e fezPalpite no Firebase
      if (user && pontosGanhos > 0) {
        const pontosRef = ref(database, `users/${user.uid}/pontos`);
        const pontosSnap = await get(pontosRef);
        let pontos = pontosSnap.exists() ? pontosSnap.val() : 0;
        // Buscar missões atuais para manter os campos
        const missoesRef = ref(database, `users/${user.uid}/missoes`);
        const missoesSnap = await get(missoesRef);
        let missaoAtual = missoesSnap.exists() ? missoesSnap.val() : {};
        await update(ref(database, `users/${user.uid}`), {
          pontos: pontos + pontosGanhos,
          missoes: {
            ...missaoAtual,
            ...missoesUpdate,
            acertouResultadoDoJogo:
              missoesUpdate.acertouResultadoDoJogo ??
              missaoAtual.acertouResultadoDoJogo ??
              false,
            acertouQuemFezGol:
              missoesUpdate.acertouQuemFezGol ??
              missaoAtual.acertouQuemFezGol ??
              false,
            acertouMelhorJogador:
              missoesUpdate.acertouMelhorJogador ??
              missaoAtual.acertouMelhorJogador ??
              false,
            acertouPiorJogador:
              missoesUpdate.acertouPiorJogador ??
              missaoAtual.acertouPiorJogador ??
              false,
          },
          fezPalpite: true,
        });
        setUserPoints(pontos + pontosGanhos);
      }
      // Salvar feedback visual
      const palpiteData = {
        total: pontosGanhos,
        detalhes: feedback,
        jogoId: palpite.jogoId,
        data: moment().format("YYYY-MM-DD HH:mm"),
        placarMandante: palpite.placarMandante,
        placarVisitante: palpite.placarVisitante,
        melhorJogador: palpite.melhorJogador,
        piorJogador: palpite.piorJogador,
        goleadores: palpite.goleadores,
      };
      setPalpiteFeedback(palpiteData);
      // Salvar no histórico local
      try {
        const histStr = await AsyncStorage.getItem("historicoPalpites");
        const hist = histStr ? JSON.parse(histStr) : [];
        hist.unshift(palpiteData); // adiciona no início
        await AsyncStorage.setItem(
          "historicoPalpites",
          JSON.stringify(hist.slice(0, 20))
        );
        setHistoricoPalpites(hist.slice(0, 20));
      } catch (_) {}
    } catch (_) {
      // Ignorar erros silenciosamente
    }
  }
  const { user, loading: authLoading } =
    require("../../components/AuthContext").useAuth();
  const [userPoints, setUserPoints] = useState(null);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [missaoStatus, setMissaoStatus] = useState(null); // null, 'concluida', 'nova', 'erro'
  const [loadingMissao, setLoadingMissao] = useState(false);

  const fetchUserPointsAndMission = async () => {
    if (!user) return;
    setLoadingPoints(true);
    setLoadingMissao(true);
    setMissaoStatus(null);
    try {
      const pontosRef = ref(database, `users/${user.uid}/pontos`);
      const pontosSnap = await get(pontosRef);
      let pontos = pontosSnap.exists() ? pontosSnap.val() : 0;
      setUserPoints(pontos);
      const missoesRef = ref(database, `users/${user.uid}/missoes`);
      const missoesSnap = await get(missoesRef);
      let missao = missoesSnap.exists() ? missoesSnap.val() : {};
      const hoje = moment().format("YYYY-MM-DD");
      // Sempre atualizar os campos de missões, mesmo sem pontos
      const novosCampos = {
        acertouResultadoDoJogo: missao.acertouResultadoDoJogo ?? false,
        acertouQuemFezGol: missao.acertouQuemFezGol ?? false,
        acertouMelhorJogador: missao.acertouMelhorJogador ?? false,
        acertouPiorJogador: missao.acertouPiorJogador ?? false,
      };
      if (missao.ultimaMissaoDiaria !== hoje) {
        const novosPontos = pontos + 100;
        await update(ref(database, `users/${user.uid}`), {
          pontos: novosPontos,
          missoes: {
            ...missao,
            ...novosCampos,
            ultimaMissaoDiaria: hoje,
            missaoDiariaConcluida: true,
          },
        });
        setUserPoints(novosPontos);
        setMissaoStatus("nova");
      } else {
        await update(ref(database, `users/${user.uid}/missoes`), {
          ...missao,
          ...novosCampos,
        });
        setMissaoStatus("concluida");
      }
    } catch (_) {
      setMissaoStatus("erro");
    } finally {
      setLoadingPoints(false);
      setLoadingMissao(false);
    }
  };

  useEffect(() => {
    fetchUserPointsAndMission();
    verificarPalpite();
    // Carregar histórico local
    (async () => {
      try {
        const histStr = await AsyncStorage.getItem("historicoPalpites");
        setHistoricoPalpites(histStr ? JSON.parse(histStr) : []);
      } catch (_) {}
    })();
    // Carregar palpite feito
    (async () => {
      try {
        const palpiteStr = await AsyncStorage.getItem("palpiteAtual");
        setPalpiteFeito(palpiteStr ? JSON.parse(palpiteStr) : null);
      } catch (_) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen
        options={{
          title: "Meus Pontos",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerShadowVisible: false,
        }}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.explainer}>
        Bem-vindo ao sistema de pontos! Você acumula pontos ao realizar ações no
        app, como entrar diariamente e completar missões. Em breve, lançaremos
        uma loja para trocar seus pontos por prêmios incríveis. Fique ligado!
      </Text>
      <Text style={styles.pointsTitle}>Meus Pontos</Text>
      {authLoading ? (
        <Text style={styles.pointsSubtitle}>Carregando...</Text>
      ) : !user ? (
        <Text style={styles.pointsSubtitle}>
          Faça login para acompanhar sua pontuação!
        </Text>
      ) : loadingPoints || loadingMissao ? (
        <ActivityIndicator color="#D1AC00" style={{ marginVertical: 32 }} />
      ) : (
        <>
          <Text style={styles.pointsValue}>{userPoints ?? 0}</Text>
          <Text style={styles.pointsSubtitle}>pontos acumulados</Text>

          {/* Card do palpite feito */}
          {palpiteFeito && (
            <View style={styles.palpiteCard}>
              <Text style={styles.palpiteTitle}>Seu palpite</Text>
              <Text style={styles.palpiteTotal}>
                Placar: {palpiteFeito.placarMandante} x{" "}
                {palpiteFeito.placarVisitante}
              </Text>
              <Text style={styles.palpiteTotal}>
                Melhor jogador: {palpiteFeito.melhorJogador || "-"}
              </Text>
              <Text style={styles.palpiteTotal}>
                Pior jogador: {palpiteFeito.piorJogador || "-"}
              </Text>
              <Text style={styles.palpiteTotal}>
                Goleadores:{" "}
                {Array.isArray(palpiteFeito.goleadores)
                  ? palpiteFeito.goleadores.join(", ")
                  : "-"}
              </Text>
            </View>
          )}

          {/* Card de resultado do palpite */}
          {palpiteFeedback && palpiteFeedback.total > 0 && (
            <View style={styles.palpiteCard}>
              <Text style={styles.palpiteTitle}>Resultado do seu palpite</Text>
              <Text style={styles.palpiteTotal}>
                Pontuação extra:{" "}
                <Text style={{ color: "#D1AC00", fontWeight: "bold" }}>
                  +{palpiteFeedback.total}
                </Text>
              </Text>
              {palpiteFeedback.detalhes.map((item, idx) => (
                <Text
                  key={idx}
                  style={item.ok ? styles.palpiteAcerto : styles.palpiteErro}
                >
                  {item.ok ? "✅" : "❌"} {item.label}{" "}
                  {item.pontos > 0 ? `(+${item.pontos})` : ""}
                </Text>
              ))}
            </View>
          )}

          <View style={{ marginTop: 24, alignItems: "center" }}>
            <Text style={styles.missaoTitle}>Missão diária: Entrar no app</Text>
            {missaoStatus === "nova" && (
              <Text style={styles.missaoNova}>
                Parabéns! Você ganhou +100 pontos por acessar hoje 🎉
              </Text>
            )}
            {missaoStatus === "concluida" && (
              <Text style={styles.missaoConcluida}>
                Missão de hoje já concluída!
              </Text>
            )}
            {missaoStatus === "erro" && (
              <Text style={styles.missaoErro}>
                Erro ao verificar missão diária
              </Text>
            )}
          </View>
        </>
      )}
      {/* Card de novidades */}
      <View style={styles.novidadesCard}>
        <Text style={styles.novidadesTitle}>Fique ligado!</Text>
        <Text style={styles.novidadesText}>
          Em breve teremos mais missões diárias e muitas novidades para você
          acumular ainda mais pontos e se divertir no app!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  historicoCard: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  historicoTitle: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
  },
  historicoItem: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  historicoData: {
    color: "#AAA",
    fontSize: 12,
    marginBottom: 2,
  },
  historicoJogo: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 2,
  },
  historicoPontuacao: {
    color: "#fff",
    fontSize: 13,
  },
  palpiteCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D1AC00",
    alignItems: "center",
  },
  palpiteTitle: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    textAlign: "center",
  },
  palpiteTotal: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
  },
  palpiteAcerto: {
    color: "#D1AC00",
    fontSize: 15,
    marginBottom: 4,
    textAlign: "center",
  },
  palpiteErro: {
    color: "#ff6b6b",
    fontSize: 15,
    marginBottom: 4,
    textAlign: "center",
  },
  container: { backgroundColor: "#000", padding: 24, flex: 1 },
  backButton: {
    backgroundColor: "#222",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: "center",
    marginBottom: 16,
    marginTop: "20%",
  },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  pointsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 16,
    textAlign: "center",
  },
  pointsValue: {
    fontSize: 40,
    color: "#D1AC00",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  pointsSubtitle: {
    fontSize: 16,
    color: "#AAAAAA",
    marginBottom: 32,
    textAlign: "center",
  },
  missaoTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  missaoNova: {
    color: "#D1AC00",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  missaoConcluida: {
    color: "#AAAAAA",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  missaoErro: {
    color: "#ff6b6b",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  infoText: {
    color: "#AAAAAA",
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
  },
  explainer: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  novidadesCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 20,
    marginTop: 32,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1AC00",
    shadowColor: "#D1AC00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  novidadesTitle: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  novidadesText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
