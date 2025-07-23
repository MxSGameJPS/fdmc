import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, router } from "expo-router";
import { Ionicons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { getUserData } from "../../services/firebase";
import { useAuth } from "../../components/AuthContext";
import Constants from "expo-constants";

export default function Configuracoes() {
  // Forçar persistência do Auth ao montar a tela
  // Removed logic for setting persistence
  const [temaDark, setTemaDark] = React.useState(true);
  const [dataSaver, setDataSaver] = React.useState(false);
  const [userName, setUserName] = React.useState("");
  const { user, logout } = useAuth();

  React.useEffect(() => {
    const fetchUserName = async () => {
      if (user && user.uid) {
        const userData = await getUserData(user.uid);
        setUserName(userData?.nome || user.displayName || "Usuário logado");
      } else {
        setUserName("");
      }
    };
    fetchUserName();
  }, [user]);

  // Funções para navegar para configurações específicas
  const navigateToNotificacoes = () =>
    router.push("/settings/NotificationSettings");

  const handleLogout = async () => {
    await logout();
    router.replace("/Login");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Configurações",
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Personalize sua experiência</Text>

          {/* Seção de configurações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PREFERÊNCIAS DE CONTEÚDO</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={navigateToNotificacoes}
            >
              <FontAwesome5
                name="bell"
                size={20}
                color="#D1AC00"
                style={styles.menuIcon}
              />
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Notificações</Text>
                <Text style={styles.menuSubtitle}>
                  Gerencie o que você quer receber
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
            </TouchableOpacity>

            <View style={styles.menuItem}>
              <FontAwesome5
                name="moon"
                size={20}
                color="#D1AC00"
                style={styles.menuIcon}
              />
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Tema Escuro</Text>
                <Text style={styles.menuSubtitle}>Aparência do aplicativo</Text>
              </View>
              <Switch
                trackColor={{ false: "#555555", true: "#D1AC00" }}
                thumbColor={temaDark ? "#FFFFFF" : "#f4f3f4"}
                ios_backgroundColor="#555555"
                onValueChange={setTemaDark}
                value={temaDark}
              />
            </View>

            <View style={styles.menuItem}>
              <FontAwesome5
                name="tachometer-alt"
                size={20}
                color="#D1AC00"
                style={styles.menuIcon}
              />
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Economizar Dados</Text>
                <Text style={styles.menuSubtitle}>
                  Carrega imagens em baixa resolução
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#555555", true: "#D1AC00" }}
                thumbColor={dataSaver ? "#FFFFFF" : "#f4f3f4"}
                ios_backgroundColor="#555555"
                onValueChange={setDataSaver}
                value={dataSaver}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONTA</Text>

            {user ? (
              <View
                style={[
                  styles.menuItem,
                  { flexDirection: "row", alignItems: "center" },
                ]}
              >
                <FontAwesome
                  name="user"
                  size={32}
                  color="#D1AC00"
                  style={styles.menuIcon}
                />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>
                    {userName || user.displayName || "Usuário logado"}
                  </Text>
                  <Text style={styles.menuSubtitle}>{user.email}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{ marginLeft: 10 }}
                >
                  <Ionicons name="log-out-outline" size={24} color="#D1AC00" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/Login")}
              >
                <FontAwesome
                  name="user"
                  size={20}
                  color="#D1AC00"
                  style={styles.menuIcon}
                />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Entrar na conta</Text>
                  <Text style={styles.menuSubtitle}>
                    Acesse recursos exclusivos
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SOBRE</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/settings/AboutApp")}
            >
              <FontAwesome5
                name="info-circle"
                size={20}
                color="#D1AC00"
                style={styles.menuIcon}
              />
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Sobre o aplicativo</Text>
                <Text style={styles.menuSubtitle}>
                  Versão{" "}
                  {Constants.expoConfig?.version ||
                    Constants.manifest?.version ||
                    "-"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const email = "suporte@fogaodomeucoracao.com.br";
                const subject = "Suporte - App Fogão do Meu Coração";
                const body =
                  "Olá equipe de suporte, preciso de ajuda com o seguinte problema:";

                Linking.openURL(
                  `mailto:${email}?subject=${encodeURIComponent(
                    subject
                  )}&body=${encodeURIComponent(body)}`
                );
              }}
            >
              <FontAwesome5
                name="life-ring"
                size={20}
                color="#D1AC00"
                style={styles.menuIcon}
              />
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Ajuda e Suporte</Text>
                <Text style={styles.menuSubtitle}>
                  Entre em contato conosco
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: "20%",
  },
  subtitle: {
    fontSize: 16,
    color: "#AAAAAA",
    marginTop: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D1AC00",
    marginBottom: 16,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
    textAlign: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#AAAAAA",
    marginTop: 4,
  },
});
