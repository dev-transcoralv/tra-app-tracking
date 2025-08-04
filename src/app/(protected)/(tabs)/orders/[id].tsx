import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getOrder } from "../../../../services/odoo/order";
import { Order } from "../../../../shared.types";
import { OrderForm } from "../../../../components/orders/_Form";

type SearchParamsType = {
  id: string;
};

export default function OrderId() {
  const { id } = useLocalSearchParams<SearchParamsType>();
  const [order, setOrder] = useState<Order | null>(null);

  const loadOrder = async (id: number) => {
    const order = await getOrder(id);
    setOrder(order);
  };

  useEffect(() => {
    loadOrder(parseInt(id));
  }, [id]);

  return (
    <View className="bg-secondary h-screen flex p-2">
      {order === null ? (
        <ActivityIndicator color={"#fff"} size={"large"} />
      ) : (
        <OrderForm order={order} />
      )}
    </View>
  );
}
