import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Localization from "expo-localization";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configurar como as notificações devem ser mostradas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Obter token para notificações push
export async function registerForPushNotificationsAsync() {
  let token;

  const locale = Localization.getLocales()[0]?.languageTag || "pt-BR";
  const isPortuguese = locale.startsWith("pt");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("new-content", {
      name: isPortuguese ? "Novos Conteúdos" : "New Content",
      description: isPortuguese
        ? "Notificações sobre novos vídeos, posts e artigos"
        : "Notifications about new videos, posts and articles",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    console.log("Status de permissão inicial:", existingStatus);
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("Status de permissão após request:", finalStatus);
    }
    if (finalStatus !== "granted") {
      console.log("Permissão para notificações não concedida!");
      return;
    }
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      console.log("projectId usado para getExpoPushTokenAsync:", projectId);
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Token de notificação gerado:", token);
      await AsyncStorage.setItem("pushToken", token);

      // Enviar token para backend Firebase Functions
      try {
        const response = await fetch(
          "https://us-central1-fdmc-d437a.cloudfunctions.net/registerToken",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );
        const backendResult = await response.text();
        console.log("Resposta do backend ao registrar token:", backendResult);
      } catch (error) {
        console.error("Erro ao registrar token no backend:", error);
      }
    } catch (error) {
      console.error("Erro ao obter token de notificações:", error);
    }
  } else {
    console.log("Notificações push só funcionam em dispositivos físicos");
  }
  return token;
}

// Enviar notificação local
export async function sendLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Mostrar imediatamente
    });
    console.log("Notificação enviada:", { title, body });
    return true;
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return false;
  }
}

// Configurar ouvintes de notificação
export function setupNotificationListeners(
  onNotificationReceived,
  onNotificationResponse
) {
  const receivedListener = Notifications.addNotificationReceivedListener(
    onNotificationReceived ||
      ((notification) => {
        console.log("Notificação recebida:", notification);
      })
  );

  const responseListener =
    Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse ||
        ((response) => {
          console.log("Resposta de notificação recebida:", response);
        })
    );

  return {
    receivedListener,
    responseListener,
    removeListeners: () => {
      Notifications.removeNotificationSubscription(receivedListener);
      Notifications.removeNotificationSubscription(responseListener);
    },
  };
}
