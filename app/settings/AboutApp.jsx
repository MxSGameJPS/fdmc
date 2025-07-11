import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Share,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import Constants from "expo-constants";

export default function AboutApp() {
  // Função para abrir WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = "5551993392983";
    const message =
      "Olá! Vi o app Fogão do Meu Coração e gostaria de informações sobre desenvolvimento de aplicativos.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback para navegador caso WhatsApp não esteja instalado
          return Linking.openURL(
            `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
          );
        }
      })
      .catch((err) => console.error("Erro ao abrir WhatsApp:", err));
  };

  // Função para compartilhar o app
  const shareApp = async () => {
    try {
      await Share.share({
        message:
          "Confira o app Fogão do Meu Coração! O melhor aplicativo para torcedores do Botafogo https://play.google.com/store/apps/details?id=com.mxsgamejps.fogaodomeucoracao",
        title: "Fogão do Meu Coração",
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre o Aplicativo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logoPreta.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>Fogão do Meu Coração</Text>
        <Text style={styles.version}>
          Versão{" "}
          {Constants.expoConfig?.version || Constants.manifest?.version || "-"}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sobre o App</Text>
          <Text style={styles.cardText}>
            O Fogão do Meu Coração é o aplicativo oficial para os torcedores do
            Botafogo acompanharem todas as notícias, jogos, estatísticas e
            conteúdos de mídia social do clube.
          </Text>
          <Text style={styles.cardText}>
            Desenvolvido com paixão por torcedores para torcedores, nosso
            objetivo é manter você conectado com tudo que acontece no Glorioso,
            onde quer que esteja.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Desenvolvimento</Text>
          <Text style={styles.cardText}>
            Está gostando do aplicativo e quer um similar para sua empresa ou
            projeto?
          </Text>

          <TouchableOpacity style={styles.contactButton} onPress={openWhatsApp}>
            <FontAwesome5 name="whatsapp" size={24} color="#fff" />
            <Text style={styles.contactButtonText}>Contatar Desenvolvedor</Text>
          </TouchableOpacity>

          <View style={styles.developerInfo}>
            <Text style={styles.developerName}>Saulo Pavanello</Text>
            <Text style={styles.developerContact}>(51) 99339-2983</Text>
            <Text style={styles.developerRole}>Desenvolvedor React Native</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={shareApp}>
          <Ionicons name="share-social" size={22} color="#000" />
          <Text style={styles.shareButtonText}>Compartilhar App</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            © 2025 Fogão do Meu Coração. Todos os direitos reservados.
          </Text>
          <Text style={styles.footerText}>
            Este aplicativo não é afiliado oficialmente ao Botafogo F.R.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#000000",
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  version: {
    fontSize: 16,
    color: "#D1AC00",
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 12,
    lineHeight: 22,
  },
  contactButton: {
    backgroundColor: "#25D366", // Cor do WhatsApp
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  developerInfo: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 12,
  },
  developerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  developerContact: {
    fontSize: 14,
    color: "#AAAAAA",
    marginTop: 4,
  },
  developerRole: {
    fontSize: 14,
    color: "#D1AC00",
    marginTop: 4,
  },
  shareButton: {
    backgroundColor: "#D1AC00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  shareButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  footerContainer: {
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#777777",
    textAlign: "center",
    marginBottom: 8,
  },
});
