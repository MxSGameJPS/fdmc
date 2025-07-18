import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { checkAllNewContent } from "./contentChecker";
import * as Application from 'expo-application';
import { Platform } from 'react-native';

// Nome da tarefa em segundo plano
const BACKGROUND_FETCH_TASK = "background-content-fetch";

// Registrar a tarefa
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log("Verificando novos conteúdos em segundo plano...");
    const hasNewContent = await checkAllNewContent();

    // Retornar resultado baseado no que encontramos
    if (hasNewContent) {
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (error) {
    console.error("Erro na tarefa em segundo plano:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Função para verificar a periodicidade no Android
export async function checkAndroidBackgroundRestrictions() {
  if (Platform.OS !== 'android') return true;
  
  try {
    // Em versões mais novas do Android podemos verificar as restrições
    const isBackgroundRestricted = await Application.getBackgroundActivityStatusAsync();
    
    console.log('Status de restrição de background no Android:', isBackgroundRestricted);
    
    return !isBackgroundRestricted;
  } catch (error) {
    console.error('Erro ao verificar restrições de background:', error);
    return false;
  }
}

// Registrar a tarefa em segundo plano
export async function registerBackgroundFetchAsync() {
  try {
    // Verificar se já está registrada
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );

    if (isRegistered) {
      console.log("Tarefa em segundo plano já está registrada.");
      return;
    }

    // Registrar a tarefa com intervalo menor (para contornar limitações)
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 900, // 15 minutos em segundos (reduza para testes)
      stopOnTerminate: false, // Continua após o app ser fechado
      startOnBoot: true, // Inicia após o dispositivo ser ligado
    });

    console.log("Tarefa em segundo plano registrada com sucesso!");
    
    // Para Android, verificar restrições de bateria
    if (Platform.OS === 'android') {
      const isNotRestricted = await checkAndroidBackgroundRestrictions();
      if (!isNotRestricted) {
        console.warn("O app pode ter restrições de bateria que limitam as tarefas em segundo plano");
        // Aqui você poderia mostrar uma dialog instruindo o usuário a desativar a otimização de bateria
      }
    }
  } catch (error) {
    console.error("Erro ao registrar tarefa em segundo plano:", error);
  }
}

// Desregistrar a tarefa em segundo plano
export async function unregisterBackgroundFetchAsync() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );

    if (!isRegistered) {
      console.log("Tarefa em segundo plano não está registrada.");
      return;
    }

    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log("Tarefa em segundo plano desregistrada com sucesso!");
  } catch (error) {
    console.error("Erro ao desregistrar tarefa em segundo plano:", error);
  }
}

// Verificar o status da tarefa em segundo plano
export async function checkBackgroundFetchStatusAsync() {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );

    let statusText = "Desconhecido";

    switch (status) {
      case BackgroundFetch.BackgroundFetchStatus.Available:
        statusText = "Disponível";
        break;
      case BackgroundFetch.BackgroundFetchStatus.Denied:
        statusText = "Negado pelo usuário";
        break;
      case BackgroundFetch.BackgroundFetchStatus.Restricted:
        statusText = "Restrito pelo sistema";
        break;
      default:
        statusText = `Status desconhecido: ${status}`;
    }

    console.log(
      `Status da tarefa em segundo plano: ${statusText}, Registrada: ${isRegistered}`
    );

    return { status, statusText, isRegistered };
  } catch (error) {
    console.error(
      "Erro ao verificar status da tarefa em segundo plano:",
      error
    );
    return { error: error.message };
  }
}
