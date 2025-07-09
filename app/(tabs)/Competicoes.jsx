import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

export default function CompeticesTab() {
  const router = useRouter();

  // Em vez de redirecionar, exibimos o conteúdo diretamente
  // Isso evita o conflito de rotas que causava o crash
   return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
  
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.containerTitulo}>
          <TouchableOpacity onPress={() => router.navigate("/(tabs)/Home")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Competições 2025</Text>
          <Text style={styles.subtitle}>
            Acompanhe o Botafogo em todas as competições
          </Text>        
          </View>
  
          {/* Cards para as competições */}
          <View style={styles.cardsContainer}>
            {/* Brasileirão */}
            <Link href="/competicoes/brasileirao" asChild>
              <TouchableOpacity style={styles.competitionCard}>
                <View style={styles.cardIconContainer}>
                  <FontAwesome5 name="trophy" size={32} color="#D1AC00" />
                </View>
                <Text style={styles.cardTitle}>Brasileirão</Text>
                <Text style={styles.cardSubtitle}>Série A • 2025</Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
                </View>
              </TouchableOpacity>
            </Link>
  
            {/* Libertadores */}
            <Link href="/competicoes/libertadores" asChild>
              <TouchableOpacity style={styles.competitionCard}>
                <View style={styles.cardIconContainer}>
                  <FontAwesome5 name="star" size={32} color="#D1AC00" />
                </View>
                <Text style={styles.cardTitle}>Libertadores</Text>
                <Text style={styles.cardSubtitle}>CONMEBOL • 2025</Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
                </View>
              </TouchableOpacity>
            </Link>
  
            {/* Copa do Brasil */}
            <Link href="/competicoes/copa-do-brasil" asChild>
              <TouchableOpacity style={styles.competitionCard}>
                <View style={styles.cardIconContainer}>
                  <FontAwesome5 name="shield-alt" size={32} color="#D1AC00" />
                </View>
                <Text style={styles.cardTitle}>Copa do Brasil</Text>
                <Text style={styles.cardSubtitle}>CBF • 2025</Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
                </View>
              </TouchableOpacity>
            </Link>
  
            {/* Próximos Jogos */}
            <Link href="/Jogos" asChild>
              <TouchableOpacity style={styles.competitionCard}>
                <View style={styles.cardIconContainer}>
                  <FontAwesome5 name="calendar-alt" size={32} color="#D1AC00" />
                </View>
                <Text style={styles.cardTitle}>Calendário</Text>
                <Text style={styles.cardSubtitle}>Próximos Jogos • 2025</Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#D1AC00" />
                </View>
              </TouchableOpacity>
            </Link>
          </View>
  
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Todos os dados são atualizados em tempo real via SofaScore
            </Text>
          </View>
  
          {/* Espaçamento extra no final para evitar que o menu cubra o conteúdo */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#000000",
    },
    backButton: {
      marginLeft: 1,
    },
    container: {
      flex: 1,
      backgroundColor: "#000000",
      padding: 6,
    },
    containerTitulo: {
      marginTop: "30%",
    },
    contentContainer: {
      paddingBottom: 100, // Adiciona espaço na parte inferior para evitar que o menu cubra o conteúdo
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginTop: "0%", // Reduzido para mostrar mais conteúdo
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 16,
      color: "#AAAAAA",
      marginBottom: 25,
    },
    cardsContainer: {
      marginBottom: 20,
    },
    competitionCard: {
      backgroundColor: "#121212",
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    cardIconContainer: {
      width: 60,
      height: 60,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#1A1A1A",
      borderRadius: 30,
      marginRight: 16,
    },
    cardTitle: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
      flex: 1,
    },
    cardSubtitle: {
      color: "#888888",
      fontSize: 14,
      position: "absolute",
      left: 96,
      top: 65,
    },
    cardArrow: {
      marginLeft: 10,
    },
    infoContainer: {
      marginTop: 10,
      marginBottom: 30,
      alignItems: "center",
    },
    infoText: {
      color: "#666666",
      fontSize: 12,
      textAlign: "center",
      fontStyle: "italic",
    },
    bottomSpacer: {
      height: 70, // Altura suficiente para evitar que o conteúdo seja coberto pela tab bar
    },
  });