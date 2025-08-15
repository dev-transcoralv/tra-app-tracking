/* eslint-disable react-hooks/exhaustive-deps */
import { View } from "react-native";
import { ListOrders } from "../../../../components/orders/_List";
import { getListOrders } from "../../../../services/odoo/order";
import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../../../../utils/authContext";
import { Driver, Order } from "../../../../shared.types";
import FilterSelection from "../../../../components/FilterSelection";

export default function IndexScreen() {
  const authContext = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("pending");

  const options = [
    { label: "Pendientes", value: "pending" },
    { label: "Finalizados", value: "finished" },
    { label: "Todos", value: "all" },
  ];

  const driver: Driver | null = authContext.driver;

  const loadOrders = useCallback(
    async (pageNumber: number, filterStatus: string) => {
      setIsLoading(true);
      const data = await getListOrders({
        page: pageNumber,
        driverId: driver?.id,
        status: filterStatus,
      });
      const orders = data.results;
      setOrders((previousPage) =>
        pageNumber === 1 ? orders : [...previousPage, ...orders],
      );
      setIsLoading(false);
    },
    [driver?.id],
  );

  useEffect(() => {
    loadOrders(page, status);
  }, [page, status]);

  const handleLoadMore = () => {
    if (!isLoading) {
      setPage((previousPage) => previousPage + 1);
    }
  };

  return (
    <View className="bg-secondary h-screen flex p-2">
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
