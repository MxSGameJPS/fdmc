import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

// Importar diretamente do arquivo firebase
import { auth } from "../../services/firebase";
import { saveErrorLog, getErrorLogs } from "../../services/firebase-diagnostic";
import { signOut } from "firebase/auth";

// Importar separadamente para evitar erros de inicialização
let signInWithEmailAndPassword, onAuthStateChanged;
try {
  const authModule = require("firebase/auth");
  signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
  onAuthStateChanged = authModule.onAuthStateChanged;
} catch (error) {
  console.error("Erro ao importar funções de autenticação:", error);
  saveErrorLog("login-import", error);
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [manterConectado, setManterConectado] = useState(true);
  const [firebaseError, setFirebaseError] = useState(false);

  // Verificar se Auth está pronto e se o usuário está logado
  useEffect(() => {
    let unsubscribe;
    const checkAuth = () => {
      try {
        if (!auth) {
          console.log("Auth não está disponível na tela de login");
          setFirebaseError(true);
          saveErrorLog(
            "login-check-auth",
            new Error("Auth não está disponível")
          );
          setTimeout(checkAuth, 1000);
          return;
        }

        if (!onAuthStateChanged) {
          console.log("onAuthStateChanged não está disponível");
          setFirebaseError(true);
          saveErrorLog(
            "login-onAuthStateChanged",
            new Error("onAuthStateChanged não está disponível")
          );
          setTimeout(checkAuth, 1000);
          return;
        }

        console.log("Auth está disponível na tela de login");
        setAuthReady(true);
        setFirebaseError(false);

        // Listener de autenticação do Firebase
        unsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            try {
              if (user) {
                // Se o usuário está autenticado, redireciona para Home
                router.replace("/(tabs)/Home");
              } else {
                console.log("Nenhum usuário autenticado");
              }
            } catch (error) {
              console.error("Erro ao verificar estado de login:", error);
              saveErrorLog("login-authstate-check", error);
            }
          },
          (error) => {
            console.error("Erro em onAuthStateChanged:", error);
            saveErrorLog("login-onAuthStateChanged-error", error);
          }
        );
      } catch (error) {
        console.error("Erro no checkAuth:", error);
        saveErrorLog("login-checkAuth", error);
        setFirebaseError(true);
        setTimeout(checkAuth, 1000);
      }
    };

    checkAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Ao sair do app, se "manter conectado" for false, faz signOut
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "inactive" || nextAppState === "background") {
        const manter = await AsyncStorage.getItem("manterConectado");
        if (manter !== "true") {
          try {
            await signOut(auth);
            await AsyncStorage.removeItem("manterConectado");
            console.log("Usuário deslogado por não manter conectado");
          } catch (e) {
            console.error("Erro ao deslogar ao sair do app:", e);
          }
        }
      }
    };
    const subscription =
      Platform.OS !== "web"
        ? require("react-native").AppState.addEventListener(
            "change",
            handleAppStateChange
          )
        : null;
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const realizarLogin = async () => {
    // Verificar se o Firebase está pronto
    if (!auth || !signInWithEmailAndPassword) {
      saveErrorLog(
        "login-attempt",
        new Error("Serviços de autenticação não disponíveis")
      );
      Alert.alert(
        "Erro",
        "O sistema de autenticação não está pronto. Por favor, tente novamente mais tarde ou reinicie o aplicativo."
      );
      return;
    }

    // Validar campos
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Erro", "Por favor, informe um email válido");
      return;
    }

    if (!senha.trim()) {
      Alert.alert("Erro", "Por favor, informe sua senha");
      return;
    }

    setLoading(true);
    try {
      console.log("Tentando fazer login com:", email);

      // Tentar fazer login com Firebase
      await signInWithEmailAndPassword(auth, email, senha);
      console.log("Login bem-sucedido");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      saveErrorLog("login-attempt-failed", error, { email });

      let mensagemErro = "Ocorreu um erro ao fazer login.";
      if (error.code === "auth/invalid-email") {
        mensagemErro = "O email fornecido é inválido.";
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        mensagemErro = "Email ou senha incorretos.";
      } else if (error.code === "auth/too-many-requests") {
        mensagemErro =
          "Muitas tentativas de login. Tente novamente mais tarde.";
      }

      Alert.alert("Erro no login", mensagemErro);
      setLoading(false);
      return;
    }

    // Salvar preferência de manter conectado e deslogar se necessário
    try {
      if (manterConectado) {
        await AsyncStorage.setItem("manterConectado", "true");
        console.log("Preferência de manter conectado salva");
      } else {
        await AsyncStorage.removeItem("manterConectado");
        await signOut(auth);
        console.log(
          "Preferência de manter conectado removida e usuário deslogado"
        );
      }
    } catch (storageError) {
      console.error("Erro ao salvar preferência:", storageError);
      saveErrorLog("login-save-preference", storageError);
    }

    // Login bem-sucedido, redirecionar para a tela principal
    router.replace("/(tabs)/Home");
    setLoading(false);
  };

  const irParaCadastro = () => {
    router.push("/Cadastro");
  };

  const irParaRecuperarSenha = () => {
    // Para implementar futuramente
    Alert.alert(
      "Recuperação de senha",
      "Um email de recuperação será enviado para o endereço informado."
    );
  };

  // Função para diagnosticar problemas de autenticação
  const diagnosticarProblema = async () => {
    try {
      const logs = await getErrorLogs();
      console.log("Logs de erro:", logs);

      Alert.alert(
        "Diagnóstico",
        `Verificando problemas de autenticação. ${
          !auth ? "Auth não está disponível." : "Auth está disponível."
        } ${
          !signInWithEmailAndPassword
            ? "Função de login não está disponível."
            : "Função de login está disponível."
        }`
      );

      // Tentar reinicializar os módulos Firebase
      try {
        const authModule = require("firebase/auth");
        signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
        onAuthStateChanged = authModule.onAuthStateChanged;

        if (signInWithEmailAndPassword && onAuthStateChanged) {
          setAuthReady(true);
          setFirebaseError(false);
          Alert.alert(
            "Sucesso",
            "Módulos de autenticação recarregados com sucesso!"
          );
        }
      } catch (error) {
        console.error("Erro ao recarregar módulos:", error);
        saveErrorLog("login-reload-modules", error);
      }
    } catch (error) {
      console.error("Erro no diagnóstico:", error);
      saveErrorLog("login-diagnostic", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar style="light" />

        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logoBranca.png")}
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Acesse sua conta</Text>

          <View style={styles.formContainer}>
            {/* Campo de Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="exemplo@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Campo de Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Sua senha"
                  placeholderTextColor="#999"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!senhaVisivel}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setSenhaVisivel(!senhaVisivel)}
                >
                  <Ionicons
                    name={senhaVisivel ? "eye-off" : "eye"}
                    size={24}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Link para recuperar senha */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={irParaRecuperarSenha}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            {/* Opção Manter Conectado */}
            <View style={styles.switchContainer}>
              <Switch
                value={manterConectado}
                onValueChange={setManterConectado}
                trackColor={{ false: "#333", true: "#D1AC0077" }}
                thumbColor={manterConectado ? "#D1AC00" : "#f4f3f4"}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.switchLabel}>Manter conectado</Text>
            </View>

            {/* Botão de Login */}
            <TouchableOpacity
              style={styles.buttonEntrar}
              onPress={realizarLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            {/* Link para Cadastro */}
            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerLinkText}>
                Ainda não tem uma conta?{" "}
                <Text style={styles.registerLink} onPress={irParaCadastro}>
                  Cadastre-se!
                </Text>
              </Text>
            </View>

            {/* Link para Diagnóstico do Sistema */}
            <TouchableOpacity
              style={styles.diagnosticLink}
              onPress={() => router.push("/diagnostic")}
            >
              <Text style={styles.diagnosticLinkText}>
                Diagnóstico do Sistema
              </Text>
            </TouchableOpacity>

            {!authReady && (
              <View>
                <Text style={styles.loadingText}>
                  Inicializando serviços...
                </Text>
                <TouchableOpacity
                  style={styles.diagnosticButton}
                  onPress={diagnosticarProblema}
                >
                  <Text style={styles.diagnosticButtonText}>
                    Diagnosticar Problema
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 110,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
    marginTop: 8,
    marginBottom: 30,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#222222",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  eyeIcon: {
    paddingRight: 16,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#D1AC00",
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  switchLabel: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  buttonEntrar: {
    backgroundColor: "#D1AC00",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerLinkContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  registerLinkText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  registerLink: {
    color: "#D1AC00",
    fontWeight: "bold",
  },
  loadingText: {
    color: "#CCCCCC",
    textAlign: "center",
    marginTop: 20,
  },
  diagnosticButton: {
    backgroundColor: "#333333",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    marginTop: 10,
    alignSelf: "center",
  },
  diagnosticButtonText: {
    color: "#D1AC00",
    fontSize: 14,
    fontWeight: "bold",
  },
  diagnosticLink: {
    marginTop: 20,
    alignItems: "center",
  },
  diagnosticLinkText: {
    color: "#888888",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
