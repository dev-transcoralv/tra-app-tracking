import { View } from "react-native";
import { ListOrders } from "../../../../components/orders/_List";
import { getListOrders } from "../../../../services/odoo/order";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../utils/authContext";
import { Driver, Order } from "../../../../shared.types";
import FilterSelection from "../../../../components/FilterSelection";

const PAGE_SIZE = 5;

export default function IndexScreen() {
  const authContext = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState(null);

  const options = [
    { label: "Todos", value: null },
    { label: "Pendientes", value: "active" },
    { label: "Finalizados", value: "inactive" },
  ];

  const driver: Driver | null = authContext.driver;

  const loadOrders = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const data = await getListOrders({
      page: page,
      driverId: driver?.id,
      status: filter || undefined,
    });
    const orders = data.results;
    setOrders((previousPage) =>
      page === 1 ? orders : [...previousPage, ...orders],
    );
    setHasMore(data.total === PAGE_SIZE);
    setIsLoading(false);
  };

  // TODO: Review multiple useEffect
  useEffect(() => {
    loadOrders();
  });

  const handleEndReached = () => {
    if (!isLoading && hasMore) {
      setPage((previousPage) => previousPage + 1);
    }
  };

  return (
    <View className="bg-secondary h-screen flex p-2">
      <FilterSelection options={options} onSelect={setFilter} />
      <ListOrders
        orders={orders}
        isLoading={isLoading}
        onEndReached={handleEndReached}
      />
    </View>
  );
}
