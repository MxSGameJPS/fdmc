import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Heatmap, LatLng } from "react-native-maps";
import { db } from "../../services/firebase";
import type { Database } from "firebase/database";
import { get, ref, child } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GOOGLE_MAPS_API_KEY = "AIzaSyDKxDwkyacCFIeLxinbBoY5XbAfmyUaMKs";
const INITIAL_REGION = {
  latitude: -14.235,
  longitude: -51.9253,
  latitudeDelta: 25,
  longitudeDelta: 25,
};

type Usuario = {
  cidade: string;
  estado: string;
};

type GeocodeCache = {
  [address: string]: LatLng;
};

const typedDb = db as Database;

export default function Mapa() {
  const [points, setPoints] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeatmapPoints();
  }, []);

  const loadHeatmapPoints = async () => {
    setLoading(true);
    try {
      // 1. Buscar usuários do Realtime Database
      const usuariosSnap = await get(child(ref(typedDb), "usuarios"));
      const usuarios: Usuario[] = [];
      if (usuariosSnap.exists()) {
        const data = usuariosSnap.val();
        Object.values(data).forEach((user: any) => {
          if (user.cidade && user.estado) {
            usuarios.push({ cidade: user.cidade, estado: user.estado });
          }
        });
      }

      // 2. Montar endereços únicos
      const addresses = Array.from(
        new Set(usuarios.map((u) => `${u.cidade}, ${u.estado}, Brasil`))
      );

      // 3. Tentar carregar cache local
      let cache: GeocodeCache = {};
      const cacheStr = await AsyncStorage.getItem("geocode_cache");
      if (cacheStr) {
        cache = JSON.parse(cacheStr);
      }

      // 4. Geocodificar endereços
      const geocodedPoints: LatLng[] = [];
      for (const address of addresses) {
        if (cache[address]) {
          geocodedPoints.push(cache[address]);
        } else {
          try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              address
            )}&key=${GOOGLE_MAPS_API_KEY}`;
            const res = await fetch(url);
            const json = await res.json();
            if (
              json.status === "OK" &&
              json.results &&
              json.results[0] &&
              json.results[0].geometry
            ) {
              const { lat, lng } = json.results[0].geometry.location;
              const point = { latitude: lat, longitude: lng };
              geocodedPoints.push(point);
              cache[address] = point;
              // Pequeno delay para evitar limite da API
              await new Promise((r) => setTimeout(r, 100));
            } else {
              console.warn(`Geocoding falhou para: ${address}`);
            }
          } catch (err) {
            console.warn(`Erro ao geocodificar ${address}:`, err);
          }
        }
      }

      // 5. Salvar cache atualizado
      await AsyncStorage.setItem("geocode_cache", JSON.stringify(cache));

      setPoints(geocodedPoints);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o mapa de calor.");
      setPoints([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#d1ac00" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={INITIAL_REGION}
        >
          {points.length > 0 && (
            <Heatmap
              points={points}
              radius={50}
              opacity={0.7}
              gradient={{
                colors: ["#00BCD4", "#FFC107", "#F44336"],
                startPoints: [0.1, 0.5, 1],
                colorMapSize: 256,
              }}
            />
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
