import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Heatmap, LatLng } from "react-native-maps";
import { db } from "../../services/firebase";
import { get, ref, child } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const GOOGLE_MAPS_API_KEY = "AIzaSyDKxDwkyacCFIeLxinbBoY5XbAfmyUaMKs";
const INITIAL_REGION = {
  latitude: -14.235,
  longitude: -51.9253,
  latitudeDelta: 25,
  longitudeDelta: 25,
};

export default function MapaCalor() {
  const router = useRouter();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(INITIAL_REGION);

  useEffect(() => {
    loadHeatmapPoints();
  }, []);

  const handleZoom = (type) => {
    setRegion((prev) => {
      const factor = type === "in" ? 0.5 : 2;
      return {
        ...prev,
        latitudeDelta: Math.max(1, Math.min(50, prev.latitudeDelta * factor)),
        longitudeDelta: Math.max(1, Math.min(50, prev.longitudeDelta * factor)),
      };
    });
  };

  const loadHeatmapPoints = async () => {
    setLoading(true);
    try {
      const usuariosSnap = await get(child(ref(db), "users"));
      const usuarios = [];
      if (usuariosSnap.exists()) {
        const data = usuariosSnap.val();
        Object.values(data).forEach((user) => {
          if (user.cidade && user.estado) {
            usuarios.push({ cidade: user.cidade, estado: user.estado });
          }
        });
      }
      const addresses = Array.from(
        new Set(usuarios.map((u) => `${u.cidade}, ${u.estado}, Brasil`))
      );
      let cache = {};
      const cacheStr = await AsyncStorage.getItem("geocode_cache");
      if (cacheStr) {
        cache = JSON.parse(cacheStr);
      }
      const geocodedPoints = [];
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
              await new Promise((r) => setTimeout(r, 100));
            }
          } catch {}
        }
      }
      await AsyncStorage.setItem("geocode_cache", JSON.stringify(cache));
      setPoints(geocodedPoints);
    } catch (e) {
      setPoints([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <View style={styles.headerRow}>
        <Text style={styles.backButton} onPress={() => router.back()}>
          {"<"} Voltar
        </Text>
        <Text style={styles.title}>Mapa de Calor da Torcida</Text>
      </View>
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          onRegionChangeComplete={setRegion}
          zoomEnabled
          scrollEnabled
        >
          {points.length > 0 && (
            <Heatmap
              points={points}
              radius={40}
              opacity={0.8}
              gradient={{
                colors: ["#00FF00", "#FFFF00", "#FF0000"],
                startPoints: [0.1, 0.5, 1],
                colorMapSize: 256,
              }}
            />
          )}
        </MapView>
        {/* Botões de zoom */}
        <View style={styles.zoomContainer}>
          <View style={styles.zoomButton}>
            <Text style={styles.zoomText} onPress={() => handleZoom("in")}>
              +
            </Text>
          </View>
          <View style={styles.zoomButton}>
            <Text style={styles.zoomText} onPress={() => handleZoom("out")}>
              -
            </Text>
          </View>
        </View>
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#d1ac00" />
          </View>
        )}
      </View>
      <View style={styles.legendContainer}>
        <View style={styles.legendBar}>
          <View style={[styles.legendColor, { backgroundColor: "#00FF00" }]} />
          <View style={[styles.legendColor, { backgroundColor: "#FFFF00" }]} />
          <View style={[styles.legendColor, { backgroundColor: "#FF0000" }]} />
        </View>
        <View style={styles.legendLabels}>
          <Text style={styles.legendText}>Pouca concentração</Text>
          <Text style={styles.legendText}>Alta concentração</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    marginTop: "20%",
    paddingHorizontal: 16,
    justifyContent: "flex-start",
  },
  backButton: {
    color: "#D1AC00",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 0,
  },
  mapWrapper: {
    width: Dimensions.get("window").width - 16,
    height: 480, // mapa mais comprido
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#222",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  zoomContainer: {
    position: "absolute",
    right: 16,
    top: 16,
    flexDirection: "column",
    zIndex: 20,
  },
  zoomButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 2,
  },
  zoomText: {
    fontSize: 24,
    color: "#222",
    fontWeight: "bold",
  },
  legendContainer: {
    width: Dimensions.get("window").width - 64,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  legendBar: {
    flexDirection: "row",
    width: 160,
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 4,
    gap: 2,
  },
  legendColor: {
    flex: 1,
  },
  legendLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: 260,
    gap: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#fff",
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
