/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { Text, Animated, StyleSheet } from "react-native";
import { useInternetStatus } from "../utils/useInternetStatus";

export default function BannerGlobalWithoutInternet() {
  const isConnected = useInternetStatus();
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const [bannerColor, setBannerColor] = useState("red");
  const [bannerText, setBannerText] = useState("");

  useEffect(() => {
    if (isConnected === false) {
      setBannerColor("red");
      setBannerText("Sin conexión a internet");
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }

    if (isConnected === true) {
      setBannerColor("green");
      setBannerText("Conexión a internet restaurada");
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();

      const timeout = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isConnected]);

  if (isConnected === null) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: bannerColor,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.text}>{bannerText}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    zIndex: 9999,
  },
  text: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
