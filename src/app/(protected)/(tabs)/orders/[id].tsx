import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { getOrder } from "../../../../services/odoo/order";
import { Order } from "../../../../shared.types";
import { OrderForm } from "../../../../components/orders/_Form";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { pushTab } from "../../../../utils/TabHistory";
import { useBackToPreviousTab } from "../../../../utils/useBackToPreviousTab";

type SearchParamsType = {
  id: string;
  reference: string;
};

export default function OrderId() {
  const { id, reference } = useLocalSearchParams<SearchParamsType>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  // Track current tab
  useFocusEffect(
    useCallback(() => {
      pushTab(route.name);
    }, [route.name]),
  );

  // Handle hardware back automatically
  useBackToPreviousTab(navigation);

  useEffect(() => {
    if (reference) {
      navigation.setOptions({ title: `Orden: ${reference}` });
    }
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);
      const loadOrder = async (id: number) => {
        try {
          const order = await getOrder(id);
          if (isActive) setOrder(order);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      loadOrder(parseInt(id));

      return () => {
        isActive = false;
      };
    }, [id]),
  );

  useEffect(() => {
    return () => {
      setOrder(null);
    };
  }, []);

  return (
    <ScrollView nestedScrollEnabled className="bg-secondary h-screen flex p-2">
      {loading || !order ? (
        <ActivityIndicator color={"#fff"} size={"large"} />
      ) : (
        <OrderForm order={order} />
      )}
    </ScrollView>
  );
}
