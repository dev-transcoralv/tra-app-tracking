import { ActivityIndicator, FlatList, View } from "react-native";
import { OrderCard } from "./_Card";
import { Order } from "../../shared.types";

interface Props {
  isLoading: boolean;
  orders: Order[];
  handleLoadMore: () => void;
}

export function ListOrders({ isLoading, orders, handleLoadMore }: Props) {
  const renderItem = ({ item }: { item: Order }) => {
    return <OrderCard order={item} />;
  };

  return (
    <FlatList
      data={orders}
      keyExtractor={(order: Order) => order.id.toString()}
      renderItem={renderItem}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoading ? <ActivityIndicator className="my-4" /> : null
      }
    />
  );
}
