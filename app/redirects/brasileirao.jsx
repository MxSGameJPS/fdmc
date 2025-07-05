import React from "react";
import { Redirect } from "expo-router";

export default function BrasileiraoRedirect() {
  // Este componente apenas redireciona para a rota de competições/brasileirao
  return <Redirect href="/competicoes/brasileirao" />;
}
