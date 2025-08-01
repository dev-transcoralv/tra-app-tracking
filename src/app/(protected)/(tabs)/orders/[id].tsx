import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { getOrder } from "../../../../services/odoo/order";
import { Order } from "../../../../shared.types";

type SearchParamsType = {
  id: string;
};

export default function OrderId() {
  const { id } = useLocalSearchParams<SearchParamsType>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    getOrder(parseInt(id)).then((order) => {
      setOrder(order);
    });
  }, [id]);

  return (
    <View>
      {order === null ? (
        <ActivityIndicator color={"#fff"} size={"large"} />
      ) : (
        <Text>Orden {order.id}</Text>
      )}
    </View>
  );
}
