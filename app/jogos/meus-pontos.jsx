import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { db as database } from "../../services/firebase";
import { ref, get, update } from "firebase/database";
import moment from "moment";

export default function MeusPontos() {
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
      if (missao.ultimaMissaoDiaria !== hoje) {
        const novosPontos = pontos + 100;
        await update(ref(database, `users/${user.uid}`), {
          pontos: novosPontos,
          missoes: {
            ...missao,
            ultimaMissaoDiaria: hoje,
            missaoDiariaConcluida: true,
          },
        });
        setUserPoints(novosPontos);
        setMissaoStatus("nova");
      } else {
        setMissaoStatus("concluida");
      }
    } catch (err) {
      setMissaoStatus("erro");
    } finally {
      setLoadingPoints(false);
      setLoadingMissao(false);
    }
  };

  useEffect(() => {
    fetchUserPointsAndMission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 24 },
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
