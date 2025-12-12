import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Text, Animated } from "react-native";
import MapView, { Marker, Polyline, LatLng } from "react-native-maps";
import axios from "axios";

const WIALON_API_URL =
  process.env.EXPO_PUBLIC_WIALON_API_URL ??
  "https://hst-api.wialon.com/wialon/ajax.html";
const REFRESH_INTERVAL = 300000;

interface WialonLiveProps {
  unitName: string;
  destination: LatLng;
}

const WialonLiveMap: React.FC<WialonLiveProps> = ({
  unitName,
  destination,
}) => {
  const [loading, setLoading] = useState(true);
  const [routeData, setRouteData] = useState<LatLng[]>([]);
  const sidRef = useRef<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const mapRef = useRef<MapView>(null);

  // 1️⃣ Animación de marcador
  const latitude = useRef(new Animated.Value(0)).current;
  const longitude = useRef(new Animated.Value(0)).current;

  // --- Funciones Wialon (login, posición, ruta) ---
  const wialonLogin = async (): Promise<string | null> => {
    try {
      const authResponse = await axios.post(WIALON_API_URL, null, {
        params: {
          svc: "token/login",
          params: JSON.stringify({
            token: process.env.EXPO_PUBLIC_WIALON_API_TOKEN,
            fl: 1,
          }),
        },
      });
      return authResponse.data.eid || null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  const getUnitLastPosition = async (
    sid: string,
    unitName: string,
  ): Promise<LatLng | null> => {
    try {
      const searchRes = await axios.post(WIALON_API_URL, null, {
        params: {
          sid,
          svc: "core/search_items",
          params: JSON.stringify({
            spec: {
              itemsType: "avl_unit",
              propName: "sys_name",
              propValueMask: unitName,
              sortType: "sys_name",
            },
            force: 1,
            flags: 1025,
            from: 0,
            to: 0,
          }),
        },
      });
      const units = searchRes.data.items || [];
      if (!units.length) return null;
      const unit = units[0];
      console.log(unit?.pos);
      return unit?.pos ? { latitude: unit.pos.y, longitude: unit.pos.x } : null;
    } catch (error) {
      console.error("Error fetching unit position:", error);
      return null;
    }
  };

  const getRoute = async (
    sid: string,
    start: LatLng,
    end: LatLng,
  ): Promise<LatLng[]> => {
    try {
      const routeRes = await axios.post(WIALON_API_URL, null, {
        params: {
          sid,
          svc: "gis_get_route",
          params: JSON.stringify({
            points: [
              { lat: start.latitude, lon: start.longitude },
              { lat: end.latitude, lon: end.longitude },
            ],
            transport: 1,
            flags: 1,
          }),
        },
      });

      const coords = routeRes.data.route || [];
      console.log(coords);
      return coords.map((p: any) => ({ latitude: p.lat, longitude: p.lon }));
    } catch (error) {
      console.error("Error fetching route:", error);
      return [];
    }
  };

  // --- Inicialización ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const sid = await wialonLogin();
      if (!sid) {
        console.error("No se pudo autenticar en Wialon.");
        setLoading(false);
        return;
      }
      sidRef.current = sid;

      await updatePositionAndRoute(true);
      setLoading(false);

      intervalRef.current = setInterval(() => {
        // tu función de actualización
      }, REFRESH_INTERVAL);

      const cleanupRef = intervalRef.current; // copiar a variable local
      return () => {
        if (cleanupRef !== null) {
          clearInterval(cleanupRef);
        }
      };
    };

    init();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  });

  const updatePositionAndRoute = async (firstLoad = false) => {
    if (!sidRef.current) return;
    const pos = await getUnitLastPosition(sidRef.current, unitName);
    if (!pos) return;

    // Animar coordenadas
    if (firstLoad) {
      latitude.setValue(pos.latitude);
      longitude.setValue(pos.longitude);
    } else {
      Animated.timing(latitude, {
        toValue: pos.latitude,
        duration: REFRESH_INTERVAL - 500,
        useNativeDriver: false,
      }).start();
      Animated.timing(longitude, {
        toValue: pos.longitude,
        duration: REFRESH_INTERVAL - 500,
        useNativeDriver: false,
      }).start();
    }

    const route = await getRoute(sidRef.current, pos, destination);
    setRouteData(route);
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: pos,
          zoom: 15,
        },
        { duration: REFRESH_INTERVAL / 2 },
      );
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#000" />;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker.Animated coordinate={destination}>
          <Text>Última posición</Text>
        </Marker.Animated>

        <Marker coordinate={destination}>
          <Text>Destino</Text>
        </Marker>

        {routeData.length > 0 && (
          <Polyline
            coordinates={routeData}
            strokeColor="#000"
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
};

export default WialonLiveMap;
