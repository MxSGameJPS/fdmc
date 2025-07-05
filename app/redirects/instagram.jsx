import React from "react";
import { Redirect } from "expo-router";

export default function InstagramRedirect() {
  // Este componente apenas redireciona para a aba Midia
  return <Redirect href="/(tabs)/Midia" />;
}
