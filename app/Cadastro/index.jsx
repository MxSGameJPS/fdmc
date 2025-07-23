import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Importar diretamente do arquivo firebase
import { auth, db } from "../../services/firebase";
import { saveErrorLog, getErrorLogs } from "../../services/firebase-diagnostic";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

export default function Cadastro() {
  // Estados para os campos do formulário
  const [nome, setNome] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmaSenhaVisivel, setConfirmaSenhaVisivel] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState(false);

  // Verificar se Auth está pronto
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (!auth || !createUserWithEmailAndPassword) {
          console.log("Auth ou função de cadastro não disponível");
          setFirebaseError(true);
          saveErrorLog(
            "cadastro-check-auth",
            new Error("Auth ou função de cadastro não disponível")
          );
          setTimeout(checkAuth, 1000);
          return;
        }

        if (!db || !ref || !set) {
          console.log("Database ou funções de banco não disponíveis");
          setFirebaseError(true);
          saveErrorLog(
            "cadastro-check-db",
            new Error("Database ou funções de banco não disponíveis")
          );
          setTimeout(checkAuth, 1000);
          return;
        }

        console.log("Auth e Database estão disponíveis na tela de cadastro");
        setAuthReady(true);
        setFirebaseError(false);
      } catch (error) {
        console.error("Erro no checkAuth do cadastro:", error);
        saveErrorLog("cadastro-checkAuth", error);
        setFirebaseError(true);
        setTimeout(checkAuth, 1000);
      }
    };

    checkAuth();
  }, []);

  // Função para formatar número de WhatsApp
  // Aceita qualquer formato internacional, apenas remove espaços extras
  const formatWhatsApp = (text) => text.replace(/\s+/g, "");

  // Validação dos campos do formulário
  const validarFormulario = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, informe seu nome");
      return false;
    }

    if (!estado.trim()) {
      Alert.alert("Erro", "Por favor, informe seu estado");
      return false;
    }

    if (!cidade.trim()) {
      Alert.alert("Erro", "Por favor, informe sua cidade");
      return false;
    }

    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Erro", "Por favor, informe um email válido");
      return false;
    }

    // Aceita números internacionais com pelo menos 10 dígitos
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, "").length < 10) {
      Alert.alert(
        "Erro",
        "Por favor, informe um número de WhatsApp válido (mínimo 10 dígitos)"
      );
      return false;
    }

    if (!senha.trim() || senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return false;
    }

    if (senha !== confirmaSenha) {
      Alert.alert("Erro", "As senhas não coincidem");
      return false;
    }

    if (!aceitaTermos) {
      Alert.alert("Erro", "Você precisa aceitar os termos para continuar");
      return false;
    }

    return true;
  };

  // Função para diagnosticar problemas de autenticação
  const diagnosticarProblema = async () => {
    try {
      const logs = await getErrorLogs();
      console.log("Logs de erro:", logs);

      Alert.alert(
        "Diagnóstico",
        `Verificando problemas de cadastro. ${
          !auth ? "Auth não está disponível." : "Auth está disponível."
        } ${
          !createUserWithEmailAndPassword
            ? "Função de cadastro não está disponível."
            : "Função de cadastro está disponível."
        } ${
          !db ? "Database não está disponível." : "Database está disponível."
        }`
      );
    } catch (error) {
      console.error("Erro no diagnóstico:", error);
      saveErrorLog("cadastro-diagnostic", error);
    }
  };

  // Função para cadastrar usuário com email/senha
  const cadastrarComEmailSenha = async () => {
    if (!validarFormulario()) return;

    // Verificar se auth e database estão disponíveis
    if (!auth || !createUserWithEmailAndPassword) {
      saveErrorLog(
        "cadastro-attempt",
        new Error("Serviços de autenticação não disponíveis")
      );
      Alert.alert(
        "Erro",
        "O sistema de autenticação não está pronto. Por favor, tente novamente mais tarde ou reinicie o aplicativo."
      );
      return;
    }

    if (!db || !ref || !set) {
      saveErrorLog(
        "cadastro-attempt",
        new Error("Serviços de banco de dados não disponíveis")
      );
      Alert.alert(
        "Erro",
        "O banco de dados não está pronto. Por favor, tente novamente mais tarde ou reinicie o aplicativo."
      );
      return;
    }

    setLoading(true);
    try {
      // Criar usuário no Firebase Authentication
      console.log("Tentando criar usuário com:", email);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const user = userCredential.user;
      console.log("Usuário criado com sucesso:", user.uid);

      // Salvar informações adicionais no Realtime Database
      await set(ref(db, `users/${user.uid}`), {
        nome,
        estado,
        cidade,
        email,
        whatsapp: whatsapp.replace(/\D/g, ""),
        dataCadastro: new Date().toISOString(),
      });

      console.log("Dados do usuário salvos com sucesso");
      Alert.alert(
        "Cadastro realizado!",
        "Seu cadastro foi realizado com sucesso!",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/Home") }]
      );
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      saveErrorLog("cadastro-attempt-failed", error, { email });

      let mensagemErro = "Ocorreu um erro ao realizar o cadastro.";

      if (error.code === "auth/email-already-in-use") {
        mensagemErro = "Este e-mail já está em uso por outra conta.";
      } else if (error.code === "auth/invalid-email") {
        mensagemErro = "O e-mail fornecido é inválido.";
      } else if (error.code === "auth/weak-password") {
        mensagemErro = "A senha é muito fraca.";
      } else if (error.message) {
        mensagemErro = error.message;
      }

      Alert.alert("Erro no cadastro", mensagemErro);
    } finally {
      setLoading(false);
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Cadastro</Text>
          <Text style={styles.subtitle}>
            Crie sua conta para acompanhar o Glorioso!
          </Text>

          <View style={styles.formContainer}>
            {/* Campo de Nome */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu nome"
                placeholderTextColor="#999"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            {/* Campos de Estado e Cidade */}
            <View style={styles.rowContainer}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
              >
                <Text style={styles.label}>Estado</Text>
                <TextInput
                  style={styles.input}
                  placeholder="UF"
                  placeholderTextColor="#999"
                  value={estado}
                  onChangeText={setEstado}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 2 }]}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Sua cidade"
                  placeholderTextColor="#999"
                  value={cidade}
                  onChangeText={setCidade}
                />
              </View>
            </View>

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

            {/* Campo de WhatsApp */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>WhatsApp</Text>
              <TextInput
                style={styles.input}
                placeholder="Número com DDI (ex: +351XXXXXXXXX)"
                placeholderTextColor="#999"
                value={whatsapp}
                onChangeText={(text) => setWhatsapp(formatWhatsApp(text))}
                keyboardType="phone-pad"
                maxLength={20}
                autoCapitalize="none"
              />
            </View>

            {/* Campo de Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mínimo 6 caracteres"
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

            {/* Campo de Confirmar Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#999"
                  value={confirmaSenha}
                  onChangeText={setConfirmaSenha}
                  secureTextEntry={!confirmaSenhaVisivel}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setConfirmaSenhaVisivel(!confirmaSenhaVisivel)}
                >
                  <Ionicons
                    name={confirmaSenhaVisivel ? "eye-off" : "eye"}
                    size={24}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Checkbox de Termos (usando Switch em vez de Checkbox) */}
            <View style={styles.checkboxContainer}>
              <Switch
                value={aceitaTermos}
                onValueChange={setAceitaTermos}
                trackColor={{ false: "#333", true: "#D1AC0077" }}
                thumbColor={aceitaTermos ? "#D1AC00" : "#f4f3f4"}
                style={styles.switch}
              />
              <Text style={styles.checkboxLabel}>
                Li e aceito os{" "}
                <Text
                  style={styles.linkText}
                  onPress={() =>
                    Alert.alert(
                      "Termos de Uso",
                      "Aqui seriam exibidos os termos de uso do aplicativo."
                    )
                  }
                >
                  termos de uso
                </Text>{" "}
                e{" "}
                <Text
                  style={styles.linkText}
                  onPress={() =>
                    Alert.alert(
                      "Política de Privacidade",
                      "Aqui seria exibida a política de privacidade do aplicativo."
                    )
                  }
                >
                  política de privacidade
                </Text>
              </Text>
            </View>

            {/* Botão de Cadastrar */}
            <TouchableOpacity
              style={styles.buttonCadastrar}
              onPress={cadastrarComEmailSenha}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            {/* Status do Firebase */}
            <View style={styles.firebaseStatusContainer}>
              {!authReady && (
                <View>
                  <Text style={styles.warningText}>
                    Aguardando inicialização do sistema...
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

            {/* Link para Login */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>
                Já tem uma conta?{" "}
                <Text style={styles.loginLink} onPress={() => router.push("/")}>
                  Fazer Login!
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
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 30,
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
    alignSelf: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  switch: {
    marginRight: 10,
  },
  checkboxLabel: {
    color: "#CCCCCC",
    flex: 1,
  },
  linkText: {
    color: "#D1AC00",
    textDecorationLine: "underline",
  },
  buttonCadastrar: {
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
  loginLinkContainer: {
    marginTop: 24,
    alignItems: "center",
    marginBottom: 40,
  },
  loginLinkText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  loginLink: {
    color: "#D1AC00",
    fontWeight: "bold",
  },
  warningText: {
    color: "#D1AC00",
    textAlign: "center",
    marginBottom: 15,
  },
  diagnosticButton: {
    backgroundColor: "#333333",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    marginBottom: 15,
    alignSelf: "center",
  },
  diagnosticButtonText: {
    color: "#D1AC00",
    fontSize: 14,
    fontWeight: "bold",
  },
  diagnosticLink: {
    marginTop: 5,
    alignItems: "center",
    marginBottom: 40,
  },
  diagnosticLinkText: {
    color: "#888888",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
