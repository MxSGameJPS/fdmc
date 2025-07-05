import React from "react";
import { Redirect } from "expo-router";

export default function CompeticesTab() {
  // Este componente apenas redireciona para a rota /competicoes
  return <Redirect href="/competicoes" />;
}
