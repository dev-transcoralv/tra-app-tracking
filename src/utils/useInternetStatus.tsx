import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useInternetStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
}
