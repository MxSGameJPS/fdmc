import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  registerBackgroundFetchAsync,
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from "../services/notifications";

export default function RootLayout() {
  const router = useRouter();
  const notificationListeners = useRef(null);

  useEffect(() => {
    // Inicializar notificações
    const setupNotifications = async () => {
      // Registrar para notificações push
      await registerForPushNotificationsAsync();

      // Configurar listeners de notificações
      notificationListeners.current = setupNotificationListeners(
        // Quando uma notificação é recebida com o app aberto
        (notification) => {
        
        },
        // Quando o usuário toca em uma notificação
        (response) => {
          const data = response.notification.request.content.data;

          // Navegar para a página apropriada com base no tipo de notificação
          if (data.type === "youtube") {
            router.push("/(tabs)/YouTube");
          } else if (data.type === "instagram") {
            router.push("/(tabs)/Instagram");
          } else if (data.type === "blog") {
            router.push("/(tabs)/Blog");
          }
        }
      );

      // Registrar tarefa em segundo plano
      await registerBackgroundFetchAsync();
    };

    setupNotifications();

    // Limpar listeners quando o componente for desmontado
    return () => {
      if (notificationListeners.current) {
        notificationListeners.current.removeListeners();
      }
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
