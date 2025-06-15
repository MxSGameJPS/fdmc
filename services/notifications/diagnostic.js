import { checkBackgroundFetchStatusAsync } from "./backgroundTasks";
import { checkAllNewContent } from "./contentChecker";

/**
 * Função de diagnóstico para o sistema de notificações
 * Pode ser chamada para verificar o status atual e registrar informações úteis
 */
export async function diagnosticNotificationsSystem() {
  console.log("=== DIAGNÓSTICO DO SISTEMA DE NOTIFICAÇÕES ===");

  try {
    // Verificar status do background fetch
    console.log("Verificando status do background fetch...");
    const status = await checkBackgroundFetchStatusAsync();
    console.log("Status do background fetch:", status);

    // Listar módulos carregados
    console.log("Módulos carregados:");
    console.log(
      "- setup.js:",
      typeof setupNotifications !== "undefined"
        ? "Disponível"
        : "Não disponível"
    );
    console.log(
      "- backgroundTasks.js:",
      typeof checkBackgroundFetchStatusAsync !== "undefined"
        ? "Disponível"
        : "Não disponível"
    );
    console.log(
      "- contentChecker.js:",
      typeof checkAllNewContent !== "undefined"
        ? "Disponível"
        : "Não disponível"
    );

    // Executar verificação de conteúdo
    console.log("Executando verificação de conteúdo de teste...");
    const hasNewContent = await checkAllNewContent(true); // o parâmetro true indica modo de teste
    console.log(
      "Resultado da verificação:",
      hasNewContent ? "Encontrou novo conteúdo" : "Nenhum novo conteúdo"
    );

    console.log("Diagnóstico concluído com sucesso!");
    return {
      success: true,
      backgroundFetchStatus: status,
      contentCheckResult: hasNewContent,
    };
  } catch (error) {
    console.error("Erro durante diagnóstico:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Também exportamos como default para compatibilidade
export default { diagnosticNotificationsSystem };
