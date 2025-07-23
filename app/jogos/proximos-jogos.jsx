import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, router } from "expo-router";
import { WebView } from "react-native-webview";

export default function ProximosJogos() {
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
      <View style={{ flex: 1, marginTop: 24 }}>
        <WebView
          source={{
            uri: "https://www.canva.com/design/DAF-205ymd0/psLBlz8k5bTOOafnJQ9jNA/view?embed",
          }}
          style={{ flex: 1, backgroundColor: "#000" }}
          allowsFullscreenVideo
          startInLoadingState
        />
      </View>
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
  // ...outros estilos mantidos para compatibilidade futura...
});
