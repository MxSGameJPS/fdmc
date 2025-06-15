// Exportar tudo de notificationService
export {
  registerForPushNotificationsAsync,
  sendLocalNotification,
  setupNotificationListeners,
} from "./notificationService";

// Exportar tudo de contentChecker
export {
  checkAllNewContent,
  checkBlogContent,
  checkInstagramContent,
  checkYouTubeContent,
} from "./contentChecker";

// Exportar tudo de backgroundTasks
export {
  checkBackgroundFetchStatusAsync,
  registerBackgroundFetchAsync,
  unregisterBackgroundFetchAsync,
} from "./backgroundTasks";

// Exportar função de setup
export { setupNotifications } from "./setup";
