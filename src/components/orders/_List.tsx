import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { OrderCard } from "./_Card";
import { Order } from "../../shared.types";

export function ListOrders({ orders }: { orders: Order[] }) {
  const renderItem = ({ item }: { item: Order }) => {
    return <OrderCard order={item} />;
  };

  return (
    <View>
      <Text>Ordenes de Transporte</Text>
      {orders.length === 0 ? (
        <ActivityIndicator color={"#fff"} size={"large"} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(order: Order) => order.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
