import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { getOrder } from "../../../../services/odoo/order";
import { Order } from "../../../../shared.types";
import { OrderForm } from "../../../../components/orders/_Form";

type SearchParamsType = {
  id: string;
  reference: string;
};

export default function OrderId() {
  const { id, reference } = useLocalSearchParams<SearchParamsType>();
  const [order, setOrder] = useState<Order | null>(null);

  const navigation = useNavigation();

  useEffect(() => {
    if (reference) {
      navigation.setOptions({ title: `Orden: ${reference}` });
    }
  });

  const loadOrder = async (id: number) => {
    const order = await getOrder(id);
    setOrder(order);
  };

  useEffect(() => {
    loadOrder(parseInt(id));
  }, [id]);

  return (
    <ScrollView className="bg-secondary h-screen flex p-2">
      {order === null ? (
        <ActivityIndicator color={"#fff"} size={"large"} />
      ) : (
        <OrderForm order={order} />
      )}
    </ScrollView>
  );
}
