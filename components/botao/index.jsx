import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text } from "react-native";

export default function Botao({onPress}) {
  const [imageError, setImageError] = useState(false);

  

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <LinearGradient
        colors={["#d1ac00", "#6e5a19"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {!imageError ? (
          <Image
            source={require("../../assets/images/logoBranca.png")}
            style={styles.buttonImage}
            onError={() => {
           
              setImageError(true);
            }}
          />
        ) : (
          <Text style={styles.fallbackText}>Botão</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 280,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    borderRadius: 10,
  },
  buttonImage: {
    width: 270,
    height: 170,
    resizeMode: "contain",
  },
  fallbackText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
