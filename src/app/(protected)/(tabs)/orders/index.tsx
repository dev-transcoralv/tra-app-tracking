import { View } from "react-native";
import { ListOrders } from "../../../../components/orders/_List";
import { getListOrders } from "../../../../services/odoo/order";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../utils/authContext";
import { Order } from "../../../../shared.types";
import FilterSelection from "../../../../components/FilterSelection";

export default function IndexScreen() {
  const { driver } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("pending");

  const options = [
    { label: "Pendientes", value: "pending" },
    { label: "Finalizados", value: "finished" },
    { label: "Todos", value: "all" },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      if (!driver?.id) return;
      setIsLoading(true);

      try {
        const data = await getListOrders({
          page,
          driverId: driver.id,
          status,
        });

        const fetchedOrders = data.results ?? [];
        setOrders((prev) =>
          page === 1 ? fetchedOrders : [...prev, ...fetchedOrders],
        );
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [driver?.id, page, status]);

  const handleLoadMore = () => {
    if (!isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <View className="bg-secondary h-full flex p-2">
      <FilterSelection
        options={options}
        onSelect={(value) => {
          setStatus(value);
          setPage(1);
        }}
      />
      <ListOrders
        orders={orders}
        isLoading={isLoading}
        handleLoadMore={handleLoadMore}
      />
    </View>
  );
}
