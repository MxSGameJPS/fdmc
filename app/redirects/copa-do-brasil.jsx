import React from "react";
import { Redirect } from "expo-router";

export default function CopaDoBrasilRedirect() {
  // Este componente apenas redireciona para a rota de competições/copa-do-brasil
  return <Redirect href="/competicoes/copa-do-brasil" />;
}
