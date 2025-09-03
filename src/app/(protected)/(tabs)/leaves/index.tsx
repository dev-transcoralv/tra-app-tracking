import { View, TouchableOpacity, Text } from "react-native";
import { getListLeaves } from "../../../../services/odoo/leave";
import { useContext, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../../../utils/authContext";
import { Leave } from "../../../../shared.types";
import FilterSelection from "../../../../components/FilterSelection";
import { ListLeaves } from "../../../../components/leaves/_List";
import { LeaveModalForm } from "../../../../components/leaves/_ModalForm";

export default function IndexScreen() {
  const { driver } = useContext(AuthContext);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState("confirm");
  const [hasMore, setHasMore] = useState(true); // track if more pages exist
  const [visible, setVisible] = useState(false);

  const options = [
    { label: "Por aprobar", value: "confirm" },
    { label: "Segunda aprobación", value: "validate1" },
    { label: "Aprobado", value: "validate" },
    { label: "Rechazado", value: "refuse" },
    { label: "Todos", value: "all" },
  ];

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetch = async () => {
        if (!driver?.id || !hasMore) return;

        setLoading(true);
        try {
          const data = await getListLeaves({
            page,
            driverId: driver.id,
            state,
          });
          const fetchedLeaves = data.results ?? [];
          if (isActive) {
            setLeaves((prev) =>
              page === 1 ? fetchedLeaves : [...prev, ...fetchedLeaves],
            );
            setHasMore(fetchedLeaves.length > 0);
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
    }, [driver?.id, page, state, hasMore]),
  );
  const handleFilterChange = (value: string) => {
    setState(value);
    setPage(1); // reset page
    setHasMore(true); // reset pagination
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const openModal = () => setVisible(true);
  const closeModal = () => setVisible(false);

  return (
    <View className="bg-secondary h-full flex p-2">
      <View className="flex-row justify-between">
        <View className="flex-1 w-3/4">
          <FilterSelection options={options} onSelect={handleFilterChange} />
        </View>
        <TouchableOpacity
          className="items-center justify-center bg-secondary w-1/4 px-5 py-4 rounded-lg"
          onPress={() => openModal()}
        >
          <Text className="text-white text-lg font-extrabold">Crear</Text>
        </TouchableOpacity>
      </View>
      <ListLeaves
        leaves={leaves}
        loading={loading}
        handleLoadMore={handleLoadMore}
      />

      <LeaveModalForm visible={visible} leave={null} onClose={closeModal} />
    </View>
  );
}
