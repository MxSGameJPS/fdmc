// Função para formatar data DD/MM/AAAA
function formatarData(dataStr) {
  if (!dataStr) return "";
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Função para formatar data e hora DD/MM/AAAA HH:mm
function formatarDataHora(dateObj) {
  if (!dateObj) return "";
  const dia = String(dateObj.getDate()).padStart(2, "0");
  const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
  const ano = dateObj.getFullYear();
  const hora = String(dateObj.getHours()).padStart(2, "0");
  const min = String(dateObj.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${hora}:${min}`;
}
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Palpites() {
  function formatarData(dataStr) {
    if (!dataStr) return "";
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function formatarDataHora(dateObj) {
    if (!dateObj) return "";
    const dia = String(dateObj.getDate()).padStart(2, "0");
    const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
    const ano = dateObj.getFullYear();
    const hora = String(dateObj.getHours()).padStart(2, "0");
    const min = String(dateObj.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  }
  // Função para formatar data DD/MM/AAAA
  function formatarData(dataStr) {
    if (!dataStr) return "";
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  // Função para formatar data e hora DD/MM/AAAA HH:mm
  function formatarDataHora(dateObj) {
    if (!dateObj) return "";
    const dia = String(dateObj.getDate()).padStart(2, "0");
    const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
    const ano = dateObj.getFullYear();
    const hora = String(dateObj.getHours()).padStart(2, "0");
    const min = String(dateObj.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  }
  // Função para formatar data DD/MM/AAAA
  function formatarData(dataStr) {
    if (!dataStr) return "";
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  // Função para formatar data e hora DD/MM/AAAA HH:mm
  function formatarDataHora(dateObj) {
    if (!dateObj) return "";
    const dia = String(dateObj.getDate()).padStart(2, "0");
    const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
    const ano = dateObj.getFullYear();
    const hora = String(dateObj.getHours()).padStart(2, "0");
    const min = String(dateObj.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  }
  const [jogo, setJogo] = useState(null);
  const [elenco, setElenco] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [placarMandante, setPlacarMandante] = useState(0);
  const [placarVisitante, setPlacarVisitante] = useState(0);
  const [goleadores, setGoleadores] = useState([]);
  const [melhorJogador, setMelhorJogador] = useState(null);
  const [piorJogador, setPiorJogador] = useState(null);
  const [limitePalpite, setLimitePalpite] = useState(null);

  // Buscar próximo jogo
  useEffect(() => {
    async function fetchJogo() {
      try {
        const res = await fetch("https://fdmc-api.vercel.app/api/jogos");
        const data = await res.json();
        const jogos = data.jogos || data;
        if (!jogos || !Array.isArray(jogos) || jogos.length === 0) {
          setErro(
            "Não foi possível carregar os jogos. Tente novamente mais tarde."
          );
          return;
        }
        const agora = new Date();
        const proximo =
          jogos.find((j) => {
            const dataHora = new Date(`${j.data}T${j.hora}`);
            return dataHora > agora && j.mandante === "Botafogo";
          }) || jogos[0];
        setJogo(proximo);
        const limite = new Date(`${proximo.data}T${proximo.hora}`);
        limite.setHours(limite.getHours() - 1);
        setLimitePalpite(limite);
      } catch (_) {
        setErro(
          "Erro ao buscar jogos. Verifique sua conexão ou tente novamente mais tarde."
        );
      }
    }
    fetchJogo();
  }, []);

  // Buscar elenco
  useEffect(() => {
    async function fetchElenco() {
      try {
        const res = await fetch("https://fdmc-api.vercel.app/api/elenco");
        const elenco = await res.json();
        if (!elenco || !Array.isArray(elenco) || elenco.length === 0) {
          setErro(
            "Não foi possível carregar o elenco. Tente novamente mais tarde."
          );
        } else {
          setElenco(elenco);
        }
      } catch (_) {
        setErro(
          "Erro ao buscar elenco. Verifique sua conexão ou tente novamente mais tarde."
        );
      }
      setLoading(false);
    }
    fetchElenco();
  }, []);

  // Salvar e carregar palpite localmente
  const { user } = require("../../components/AuthContext");
  const { update, ref } = require("firebase/database");
  const { db: database } = require("../../services/firebase");

  useEffect(() => {
    async function carregarPalpite() {
      const salvo = await AsyncStorage.getItem("palpiteAtual");
      if (salvo) {
        try {
          const palpite = JSON.parse(salvo);
          if (palpite && palpite.jogoId === jogo?.id) {
            setPlacarMandante(palpite.placarMandante ?? 0);
            setPlacarVisitante(palpite.placarVisitante ?? 0);
            setGoleadores(palpite.goleadores ?? []);
            setMelhorJogador(palpite.melhorJogador ?? null);
            setPiorJogador(palpite.piorJogador ?? null);
          }
        } catch {}
      }
    }
    if (jogo) carregarPalpite();
  }, [jogo]);

  async function salvarPalpite() {
    const palpite = {
      jogoId: jogo?.id,
      placarMandante,
      placarVisitante,
      goleadores,
      melhorJogador,
      piorJogador,
      data: new Date().toISOString(),
    };
    await AsyncStorage.setItem("palpiteAtual", JSON.stringify(palpite));
    // Salva fezPalpite: true no Realtime Database
    if (user && user.uid) {
      try {
        await update(ref(database, `users/${user.uid}`), { fezPalpite: true });
      } catch (e) {
        // erro opcionalmente pode ser tratado
      }
    }
    alert("Palpite salvo! Aguarde o resultado após o jogo.");
    router.back();
  }

  if (loading || !jogo) {
    if (erro) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
          }}
        >
          <Text
            style={{
              color: "#ff6b6b",
              fontSize: 18,
              textAlign: "center",
              margin: 24,
            }}
          >
            {erro}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#D1AC00",
              borderRadius: 8,
              padding: 12,
              marginTop: 16,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: "#222", fontWeight: "bold" }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return <ActivityIndicator style={{ marginTop: 40 }} color="#D1AC00" />;
  }

  const agora = new Date();
  const podePalpitar = agora < limitePalpite;

  if (!podePalpitar) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <Text
          style={{
            color: "#FFD700",
            fontSize: 18,
            textAlign: "center",
            margin: 24,
          }}
        >
          O tempo para palpitar neste jogo já acabou!
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#D1AC00",
            borderRadius: 8,
            padding: 12,
            marginTop: 16,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "#222", fontWeight: "bold" }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Acerte o resultado do jogo</Text>
      <View style={styles.card}>
        <Text style={styles.jogoInfo}>
          {jogo.mandante} x {jogo.visitante}
        </Text>
        <Text style={styles.jogoInfo}>
          Data: {formatarData(jogo.data)} - Hora: {jogo.hora}
        </Text>
        <Text style={styles.jogoInfo}>Campeonato: {jogo.campeonato}</Text>
        <Text style={styles.limiteInfo}>
          Você pode palpitar até: {formatarDataHora(limitePalpite)}
        </Text>
      </View>
      <Text style={styles.sectionTitle}>Seu palpite de placar</Text>
      <View style={styles.placarRow}>
        <TextInput
          style={styles.placarInput}
          keyboardType="number-pad"
          value={placarMandante.toString()}
          onChangeText={(t) => setPlacarMandante(Number(t))}
        />
        <Text style={styles.placarX}>x</Text>
        <TextInput
          style={styles.placarInput}
          keyboardType="number-pad"
          value={placarVisitante.toString()}
          onChangeText={(t) => setPlacarVisitante(Number(t))}
        />
      </View>

      <Text style={styles.sectionTitle}>Quem marcará gol?</Text>
      {elenco.map((jogador) => (
        <TouchableOpacity
          key={jogador.id}
          style={styles.checkboxRow}
          onPress={() => {
            setGoleadores(
              goleadores.includes(jogador.nome)
                ? goleadores.filter((n) => n !== jogador.nome)
                : [...goleadores, jogador.nome]
            );
          }}
        >
          <View
            style={[
              styles.checkbox,
              goleadores.includes(jogador.nome) && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.jogadorNome}>{jogador.nome}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Quem será o melhor jogador?</Text>
      {elenco.map((jogador) => (
        <TouchableOpacity
          key={jogador.id + "melhor"}
          style={styles.radioRow}
          onPress={() => setMelhorJogador(jogador.nome)}
        >
          <View
            style={[
              styles.radio,
              melhorJogador === jogador.nome && styles.radioChecked,
            ]}
          />
          <Text style={styles.jogadorNome}>{jogador.nome}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Quem será o pior jogador?</Text>
      {elenco.map((jogador) => (
        <TouchableOpacity
          key={jogador.id + "pior"}
          style={styles.radioRow}
          onPress={() => setPiorJogador(jogador.nome)}
        >
          <View
            style={[
              styles.radio,
              piorJogador === jogador.nome && styles.radioChecked,
            ]}
          />
          <Text style={styles.jogadorNome}>{jogador.nome}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.salvarBtn} onPress={salvarPalpite}>
        <Text style={styles.salvarBtnText}>Salvar palpites</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: "#222",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: "center",
    marginTop: "20%",
  },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  container: { flex: 1, backgroundColor: "#000" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  jogoInfo: { color: "#fff", fontSize: 15, marginBottom: 4 },
  limiteInfo: {
    color: "#D1AC00",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    marginTop: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  placarRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placarInput: {
    backgroundColor: "#222",
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 22,
    borderRadius: 8,
    padding: 8,
    width: 48,
    textAlign: "center",
  },
  placarX: { color: "#fff", fontSize: 22, marginHorizontal: 12 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFD700",
    marginRight: 10,
    backgroundColor: "#222",
  },
  checkboxChecked: { backgroundColor: "#FFD700" },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#FFD700",
    marginRight: 10,
    backgroundColor: "#222",
  },
  radioChecked: { backgroundColor: "#FFD700" },
  jogadorNome: { color: "#fff", fontSize: 15 },
  salvarBtn: {
    backgroundColor: "#D1AC00",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 24,
    marginBottom: "20%",
    alignSelf: "center",
  },
  salvarBtnText: { color: "#222", fontWeight: "bold", fontSize: 18 },
});
