// services/firebase-diagnostic.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

// Função para salvar logs em um arquivo
export const saveErrorLog = async (component, error, contextData = {}) => {
  try {
    // Cria um objeto de log com informações detalhadas
    const errorLog = {
      timestamp: new Date().toISOString(),
      component,
      errorMessage: error.message,
      errorCode: error.code,
      errorStack: error.stack,
      platform: Platform.OS,
      version: Platform.Version,
      contextData,
    };

    // Converte para string
    const logString = JSON.stringify(errorLog, null, 2);

    // Salva no AsyncStorage (limite de tamanho, mas funciona em todos os ambientes)
    try {
      // Obter logs existentes
      const existingLogs = await AsyncStorage.getItem("firebase_error_logs");
      const logsArray = existingLogs ? JSON.parse(existingLogs) : [];

      // Adicionar novo log e manter apenas os últimos 10
      logsArray.unshift(errorLog);
      const trimmedLogs = logsArray.slice(0, 10);

      await AsyncStorage.setItem(
        "firebase_error_logs",
        JSON.stringify(trimmedLogs)
      );
    } catch (storageError) {
      console.error("Erro ao salvar log no AsyncStorage:", storageError);
    }

    // Se estiver no ambiente nativo, tenta salvar em arquivo também
    if (Platform.OS !== "web" && FileSystem) {
      const logDir = `${FileSystem.documentDirectory}logs/`;
      const logFile = `${logDir}firebase_error_${Date.now()}.log`;

      try {
        // Cria diretório se não existir
        const dirInfo = await FileSystem.getInfoAsync(logDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(logDir, { intermediates: true });
        }

        // Escreve o arquivo de log
        await FileSystem.writeAsStringAsync(logFile, logString);
        console.log(`Log salvo em ${logFile}`);
      } catch (fileError) {
        console.error("Erro ao salvar log em arquivo:", fileError);
      }
    }

    console.log("Log de erro salvo com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao salvar log de erro:", error);
    return false;
  }
};

// Função para obter os logs salvos
export const getErrorLogs = async () => {
  try {
    const logs = await AsyncStorage.getItem("firebase_error_logs");
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error("Erro ao obter logs:", error);
    return [];
  }
};

// Função para testar a inicialização do Firebase
export const testFirebaseInit = async (firebaseApp, auth, database) => {
  const diagnosticResults = {
    appInitialized: !!firebaseApp,
    authInitialized: !!auth,
    databaseInitialized: !!database,
    authPersistenceAvailable: false,
    asyncStorageWorking: false,
    timestamp: new Date().toISOString(),
  };

  // Testar AsyncStorage
  try {
    await AsyncStorage.setItem("firebase_test_key", "test_value");
    const testValue = await AsyncStorage.getItem("firebase_test_key");
    diagnosticResults.asyncStorageWorking = testValue === "test_value";
  } catch (error) {
    console.error("Erro ao testar AsyncStorage:", error);
    await saveErrorLog("testFirebaseInit-AsyncStorage", error);
  }

  // Salvar resultados do diagnóstico
  try {
    await AsyncStorage.setItem(
      "firebase_diagnostic",
      JSON.stringify(diagnosticResults)
    );
  } catch (error) {
    console.error("Erro ao salvar diagnóstico:", error);
  }

  return diagnosticResults;
};

// Limpar todos os logs
export const clearErrorLogs = async () => {
  try {
    await AsyncStorage.removeItem("firebase_error_logs");
    return true;
  } catch (error) {
    console.error("Erro ao limpar logs:", error);
    return false;
  }
};
