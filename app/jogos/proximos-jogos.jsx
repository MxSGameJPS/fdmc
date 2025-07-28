import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, router } from "expo-router";

export default function ProximosJogos() {
  const [jogos, setJogos] = useState([]);
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function fetchJogos() {
      setLoading(true);
      setErro("");
      try {
        const res = await fetch("https://fdmc-api.vercel.app/api/jogos");
        const data = await res.json();
        console.log("/api/jogos resposta:", data);
        if (!Array.isArray(data)) {
          setErro("Resposta inesperada da API de jogos.");
          setJogos([]);
          return;
        }
        setJogos(data);
        // Buscar resultados em paralelo
        const results = await Promise.all(
          data.map(async (jogo) => {
            try {
              const resResult = await fetch(
                `https://fdmc-api.vercel.app/api/resultados?id=${jogo.id}`
              );
              const resultData = await resResult.json();
              return { id: jogo.id, resultado: resultData };
            } catch {
              return { id: jogo.id, resultado: null };
            }
          })
        );
        // Monta objeto { id: resultado }
        const resultadosObj = {};
        results.forEach(({ id, resultado }) => {
          resultadosObj[id] = resultado;
        });
        setResultados(resultadosObj);
      } catch (e) {
        setErro("Erro ao buscar jogos: " + (e?.message || ""));
        setJogos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchJogos();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Próximos Jogos",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerShadowVisible: false,
        }}
      />
      <StatusBar style="light" />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator
          color="#FFD700"
          style={{ marginTop: 40 }}
          size="large"
        />
      ) : erro ? (
        <Text style={{ color: "#ff6b6b", textAlign: "center", marginTop: 32 }}>
          {erro}
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {jogos.length === 0 && (
            <Text style={{ color: "#fff", textAlign: "center", marginTop: 32 }}>
              Nenhum jogo encontrado.
            </Text>
          )}
          {jogos.map((jogo) => {
            const resultadoArr = resultados[jogo.id];
            const resultado = Array.isArray(resultadoArr)
              ? resultadoArr.find((r) => r.id === jogo.id)
              : null;
            console.log("JOGO", jogo.id, "RESULTADO", resultado);
            const placarDisponivel =
              resultado &&
              typeof resultado.resultado_mandante === "number" &&
              typeof resultado.resultado_visitante === "number";
            return (
              <View key={jogo.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.timeBox}>
                    <Image
                      source={{ uri: jogo.escudo_mandante }}
                      style={styles.escudo}
                    />
                    <Text style={styles.timeNome}>{jogo.mandante}</Text>
                  </View>
                  <View style={styles.placarBox}>
                    {placarDisponivel && (
                      <Text style={styles.placarText}>
                        {Number(resultado.resultado_mandante)}{" "}
                        <Text style={styles.xText}>X</Text>{" "}
                        {Number(resultado.resultado_visitante)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.timeBox}>
                    <Image
                      source={{ uri: jogo.escudo_visitante }}
                      style={styles.escudo}
                    />
                    <Text style={styles.timeNome}>{jogo.visitante}</Text>
                  </View>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    {jogo.data} às {jogo.hora} • {jogo.local}
                  </Text>
                  <Text style={styles.infoText}>
                    {jogo.campeonato} • {jogo.rodada}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
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
  card: {
    backgroundColor: "#181818",
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeBox: {
    alignItems: "center",
    flex: 1,
  },
  escudo: {
    width: 48,
    height: 48,
    marginBottom: 4,
    resizeMode: "contain",
  },
  timeNome: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  placarBox: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  xText: {
    color: "#FFD700",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  placarText: {
    color: "#FFD700",
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 2,
    textAlign: "center",
  },
  infoBox: {
    marginTop: 8,
    alignItems: "center",
  },
  infoText: {
    color: "#AAA",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 2,
  },
});
