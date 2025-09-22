import { View, TextInput } from "react-native";
import { ListOrders } from "../../../../components/orders/_List";
import { getListOrders } from "../../../../services/odoo/order";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../../../utils/authContext";
import { Order } from "../../../../shared.types";
import FilterSelection from "../../../..//components/FilterSelection";
import debounce from "lodash/debounce";

export default function IndexScreen() {
  const { driver } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(true); // track if more pages exist

  const options = [
    { label: "Pendientes", value: "pending" },
    { label: "Finalizados", value: "finished" },
    { label: "Todos", value: "all" },
  ];

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetch = async () => {
        if (!driver?.id || !hasMore) return;

        setLoading(true);
        try {
          const data = await getListOrders({
            page,
            driverId: String(driver.id),
            status,
            query,
          });
          const fetchedOrders = data.results ?? [];
          if (isActive) {
            setOrders((prev) =>
              page === 1 ? fetchedOrders : [...prev, ...fetchedOrders],
            );
            setHasMore(fetchedOrders.length > 0);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetch();

      return () => {
        isActive = false;
      };
    }, [driver?.id, page, status, query, hasMore]),
  );

  const handleFilterChange = (value: string) => {
    setStatus(value);
    setPage(1); // reset page
    setHasMore(true); // reset pagination
  };

  const handleSearch = useRef(
    debounce((text: string) => {
      setQuery(text);
      setPage(1);
      setHasMore(true);
    }, 500),
  ).current;

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    return () => {
      handleSearch.cancel();
    };
  });

  return (
    <View className="bg-secondary h-full flex p-2">
      <FilterSelection options={options} onSelect={handleFilterChange} />
      <TextInput
        placeholder="p.e Número de orden | Cliente | Placa"
        value={query}
        onChangeText={handleSearch}
        placeholderTextColor="#211915"
        className="color-secondary bg-white border-0 w-full outline-none text-sm md:text-base mb-2 px-3 rounded-lg"
      />
      <ListOrders
        orders={orders}
        loading={loading}
        handleLoadMore={handleLoadMore}
      />
    </View>
  );
}
