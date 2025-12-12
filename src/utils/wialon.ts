import axios from "axios";
import { useState, useCallback } from "react";

// 1. Define the Interface (it was missing in your snippet)
export interface LatLng {
  latitude: number;
  longitude: number;
}

// --- Types for Wialon API Responses ---
interface WialonUnit {
  id: number;
  nm: string;
  pos?: {
    x: number; // Longitude
    y: number; // Latitude
    t: number; // Timestamp
  };
}

interface WialonSearchResponse {
  items: WialonUnit[];
}

interface WialonZoneResponse {
  [resourceId: string]: {
    [geofenceId: string]: number; // Distance (0 if inside)
  };
}

interface UsePlateGeofenceStatusProps {
  sid: string;
  resourceId: string; // ID of the resource containing the geofence
  geofenceId: number; // The specific Geofence ID
}

const WIALON_API_URL =
  process.env.EXPO_PUBLIC_WIALON_API_URL ??
  "https://hst-api.wialon.com/wialon/ajax.html";

// 1. Export the login function
export const login = async (): Promise<string | null> => {
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
    // Wialon returns 200 OK even on errors, check for specific error field
    if (authResponse.data.error) {
      console.error("Wialon Auth Error Code:", authResponse.data.error);
      return null;
    }
    return authResponse.data.eid || null;
  } catch (error) {
    console.error("Login network error:", error);
    return null;
  }
};

// 2. Export getUnitLastPosition
export const getUnitLastPosition = async (
  unitName: string,
): Promise<LatLng | null> => {
  try {
    // Optimization: In a real app, pass the SID as an argument to avoid re-logging in every time
    const sid = await login();
    if (!sid) return null;

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
          flags: 1025, // Basic unit info + location
          from: 0,
          to: 0,
        }),
      },
    });

    const units = searchRes.data.items || [];
    if (!units.length) return null;

    const unit = units[0];

    // Check if unit.pos exists (it might be null if the unit has never sent data)
    return unit?.pos ? { latitude: unit.pos.y, longitude: unit.pos.x } : null;
  } catch (error) {
    console.error("Error fetching unit position:", error);
    return null;
  }
};

// 3. Export getRoute
export const getRoute = async (
  start: LatLng,
  end: LatLng,
): Promise<LatLng[] | null> => {
  try {
    const sid = await login();
    if (!sid) return null;

    // Note: Ensure "gis_get_route" is the correct service for your Wialon plan.
    // Standard Wialon often uses "gis_router" or external GIS services.
    const routeRes = await axios.post(WIALON_API_URL, null, {
      params: {
        sid,
        svc: "gis_get_route",
        params: JSON.stringify({
          points: [
            { lat: start.latitude, lon: start.longitude },
            { lat: end.latitude, lon: end.longitude },
          ],
          transport: 1, // 1 typically implies car/vehicle
          flags: 1,
        }),
      },
    });

    const coords = routeRes.data.route || [];
    // Map Wialon's {lat, lon} to your App's {latitude, longitude}
    return coords.map((p: any) => ({ latitude: p.lat, longitude: p.lon }));
  } catch (error) {
    console.error("Error fetching route:", error);
    return [];
  }
};

// 3. Export getRoute
export const getGeogercaByID = async (
  start: LatLng,
  end: LatLng,
): Promise<LatLng[] | null> => {
  try {
    const sid = await login();
    if (!sid) return null;

    // Note: Ensure "gis_get_route" is the correct service for your Wialon plan.
    // Standard Wialon often uses "gis_router" or external GIS services.
    const routeRes = await axios.post(WIALON_API_URL, null, {
      params: {
        sid,
        svc: "gis_get_route",
        params: JSON.stringify({
          points: [
            { lat: start.latitude, lon: start.longitude },
            { lat: end.latitude, lon: end.longitude },
          ],
          transport: 1, // 1 typically implies car/vehicle
          flags: 1,
        }),
      },
    });

    const coords = routeRes.data.route || [];
    // Map Wialon's {lat, lon} to your App's {latitude, longitude}
    return coords.map((p: any) => ({ latitude: p.lat, longitude: p.lon }));
  } catch (error) {
    console.error("Error fetching route:", error);
    return [];
  }
};

// 4. Export usePlateGeofenceStatus
export const usePlateGeofenceStatus = ({
  sid,
  resourceId,
  geofenceId,
}: UsePlateGeofenceStatusProps) => {
  const [isInside, setIsInside] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to construct Wialon URLs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getUrl = (svc: string, params: object) => {
    const jsonParams = JSON.stringify(params);
    return `${WIALON_API_URL}/wialon/ajax.html?svc=${svc}&params=${encodeURIComponent(jsonParams)}&sid=${sid}`;
  };

  const checkPlate = useCallback(
    async (vehicleName: string) => {
      setLoading(true);
      setError(null);
      setIsInside(null);

      try {
        // --- STEP 1: Find Unit and Coordinates ---
        const searchParams = {
          spec: {
            itemsType: "avl_unit",
            propName: "sys_name",
            propValueMask: vehicleName,
            sortType: "sys_name",
          },
          force: 1,
          flags: 1025, // 1 (Base) + 1024 (Last Position)
          from: 0,
          to: 0,
        };

        const searchRes = await fetch(
          getUrl("core/search_items", searchParams),
        );
        const searchData: WialonSearchResponse =
          (await searchRes.json()) as WialonSearchResponse;

        if (!searchData.items || searchData.items.length === 0) {
          throw new Error(`Unit '${vehicleName}' not found.`);
        }

        const unit = searchData.items[0];

        if (!unit.pos) {
          throw new Error(`Unit '${vehicleName}' has no position data.`);
        }

        // --- STEP 2: Check Geofence ---
        const zoneParams = {
          spec: {
            lat: unit.pos.y,
            lon: unit.pos.x,
            radius: 0, // 0 = Strict check
            zoneId: {
              [resourceId]: [geofenceId],
            },
          },
        };

        const zoneRes = await fetch(
          getUrl("resource/get_zones_by_point", zoneParams),
        );
        const zoneData: WialonZoneResponse =
          (await zoneRes.json()) as WialonZoneResponse;

        // Check if our geofence ID exists in the response
        // Wialon returns { "resID": { "geoID": distance } }
        const resourceZones = zoneData[resourceId.toString()];
        const isGeofencePresent =
          resourceZones && resourceZones.hasOwnProperty(geofenceId.toString());

        setIsInside(isGeofencePresent);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
        setIsInside(null);
      } finally {
        setLoading(false);
      }
    },
    [getUrl, resourceId, geofenceId],
  );

  return { checkPlate, isInside, loading, error };
};
