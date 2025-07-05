import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export default function Botao() {
  return (
    <>
      <Pressable onPress={() => router.navigate("/Login")} style={styles.button}>
        <Text style={styles.buttonText}>Entrar</Text>
      </Pressable>
      <Pressable
        // A rota está correta, mas vamos verificar se está indo para o lugar certo
        onPress={() => router.navigate("/Cadastro")}
        style={styles.buttonCadastrar}
      >
        <Text style={styles.buttonText}>Cadastrar</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 346,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.26)",
    backgroundColor: "rgba(14, 14, 14, 0.42)",
    padding: 13,
  },
  buttonCadastrar: {
    width: 346,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.26)",
    backgroundColor: "rgba(235, 172, 0, 0.73)",
    padding: 13,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});
