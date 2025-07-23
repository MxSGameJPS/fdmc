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

  const isPortuguese = Localization.locale.startsWith("pt");

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
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Permissão para notificações não concedida!");
      return;
    }
    try {
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })
      ).data;
      await AsyncStorage.setItem("pushToken", token);
      console.log("Token de notificação:", token);

      // Enviar token para backend Firebase Functions
      try {
        await fetch(
          "https://us-central1-fdmc-d437a.cloudfunctions.net/registerToken",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );
        console.log("Token registrado no backend!");
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
