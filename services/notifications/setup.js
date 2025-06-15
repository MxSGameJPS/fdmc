import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { Platform } from "react-native";
import {
  registerBackgroundFetchAsync,
  checkBackgroundFetchStatusAsync,
} from "./backgroundTasks";
import { checkAllNewContent } from "./contentChecker";

/**
 * Inicializa o sistema de notificações e tarefas em segundo plano
 * Chamar esta função no componente principal do app
 */
// Exportar como função nomeada
export async function setupNotifications() {
  try {
    console.log("Inicializando sistema de notificações...");

    // Verificar status atual
    const status = await checkBackgroundFetchStatusAsync();
    console.log("Status inicial de background fetch:", status);

    // Registrar tarefa em segundo plano se ainda não estiver
    if (!status.isRegistered) {
      await registerBackgroundFetchAsync();
      console.log("Tarefa em segundo plano registrada!");
    } else {
      console.log("Tarefa já registrada, pulando registro.");
    }

    // Executar verificação inicial de conteúdo
    console.log("Executando verificação inicial de conteúdo...");
    await checkAllNewContent();

    console.log("Sistema de notificações inicializado com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao inicializar sistema de notificações:", error);
    return false;
  }
}

// Exportar também como default para compatibilidade
export default { setupNotifications };
