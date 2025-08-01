import { ActivityIndicator, FlatList, View } from "react-native";
import { OrderCard } from "./_Card";
import { Order } from "../../shared.types";

interface Props {
  isLoading: boolean;
  orders: Order[];
  onEndReached: () => void;
}

export function ListOrders({ isLoading, orders, onEndReached }: Props) {
  const renderItem = ({ item }: { item: Order }) => {
    return <OrderCard order={item} />;
  };

  return (
    <View>
      <FlatList
        data={orders}
        keyExtractor={(order: Order) => order.id.toString()}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isLoading ? <ActivityIndicator className="my-4" /> : null
        }
      />
    </View>
  );
}
