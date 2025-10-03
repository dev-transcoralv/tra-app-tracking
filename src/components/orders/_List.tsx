import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { OrderCard } from "./_Card";
import { Order } from "../../shared.types";
import { useCallback } from "react";

interface Props {
  loading: boolean;
  orders: Order[];
  handleLoadMore: () => void;
}

export function ListOrders({ loading, orders, handleLoadMore }: Props) {
  const renderItem = useCallback(({ item }: { item: Order }) => {
    return <OrderCard order={item} />;
  }, []);

  return (
    <FlatList
      data={orders}
      keyExtractor={(order, index) => `${order.id}-${index}`}
      renderItem={renderItem}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
      removeClippedSubviews
      windowSize={5}
      maxToRenderPerBatch={10}
      ListEmptyComponent={
        !loading ? (
          <View className="py-8 items-center">
            <Text className="color-white">No se encontraron ordenes.</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        loading ? (
          <View className="my-4 items-center">
            <ActivityIndicator color={"#fff"} size={"large"} />
          </View>
        ) : null
      }
    />
  );
}
