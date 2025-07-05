import React from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import YouTubeFeed from "../../components/YouTubeFeed";

export default function YouTubeScreen() {
  const goBack = () => {
    router.navigate("/(tabs)/Midia");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <YouTubeFeed />
      </>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backButton: {
    padding: 8,
    marginLeft: -5,
    marginTop: "10%",
  },
});
