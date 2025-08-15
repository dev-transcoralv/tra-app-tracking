import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { popTab } from "./TabHistory";

export const useBackToPreviousTab = (navigation: any) => {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const previousTab = popTab();
        if (previousTab) {
          navigation.navigate(previousTab); // automatically switch to previous tab
          return true; // prevent default behavior
        }
        return false; // exit app if no previous tab
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );
};
