import React from "react";
import { Redirect } from "expo-router";

export default function MidiaRedirect() {
  // Este componente redireciona para a aba Midia
  return <Redirect href="/(tabs)/Midia" />;
}
