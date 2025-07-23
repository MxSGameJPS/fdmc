import React from "react";
import { View, Text, Button, Modal, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function AuthAlert({ visible, onClose }) {
  const router = useRouter();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            Seja bem vindo Torcedor ao mais completo app do Botafogo, para
            acessar o app você deve criar uma conta ou efetuar o login
          </Text>
          <Button
            title="Quero entrar para o time"
            onPress={() => {
              onClose();
              router.push("/Login");
            }}
            color="#000"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    maxWidth: 340,
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#222",
  },
});
