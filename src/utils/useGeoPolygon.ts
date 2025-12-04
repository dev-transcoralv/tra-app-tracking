import { useState, useCallback } from "react";
import * as Location from "expo-location";
import { isPointInPolygon } from "geolib";
import { Coordinate, GeoPolygonResult } from "../shared.types";

export const useGeoPolygon = (
  polygonCoordinates: Coordinate[],
): GeoPolygonResult => {
  const [isInside, setIsInside] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);

  const validarZona = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsInside(false);

    try {
      // 1. Solicitar Permisos
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        throw new Error("Permiso de ubicación denegado. Actívalo en ajustes.");
      }

      // 2. Obtener Ubicación (Alta precisión para polígonos)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      // 3. Seguridad Logística: Detectar Mock Locations (Fake GPS)
      // En Android, esto detecta si se está inyectando la ubicación por software.
      if (location.mocked) {
        throw new Error(
          "SEGURIDAD CRÍTICA: Se ha detectado una ubicación simulada.",
        );
      }

      // Mapeamos al tipo Coordinate limpio
      const currentLocation: Coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(currentLocation);

      // 4. Validación Matemática
      // isPointInPolygon acepta {lat, lng} y un array de {lat, lng}
      const estaDentro = isPointInPolygon(currentLocation, polygonCoordinates);

      setIsInside(estaDentro);
    } catch (err) {
      // Manejo seguro del error en TypeScript
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error desconocido al obtener el GPS.");
      }
    } finally {
      setLoading(false);
    }
  }, [polygonCoordinates]);

  return {
    isInside,
    userLocation,
    loading,
    error,
    validarZona,
  };
};
