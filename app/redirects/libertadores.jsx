import React from "react";
import { Redirect } from "expo-router";

export default function LibertadoresRedirect() {
  // Este componente apenas redireciona para a rota de competições/libertadores
  return <Redirect href="/competicoes/libertadores" />;
}
