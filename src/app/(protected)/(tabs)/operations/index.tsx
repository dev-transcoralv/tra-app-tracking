import { View, Text, TouchableOpacity } from "react-native";
import { getListGrainOperations } from "../../../../services/odoo/operation";
import { useContext, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../../../utils/authContext";
import { GrainOperation } from "../../../../shared.types";
import { ListGrainOperations } from "../../../../components/operations/_List";
import { GrainOperationModalForm } from "../../../../components/operations/_ModalForm";

export default function IndexScreen() {
  const { driver } = useContext(AuthContext);
  const [grainOperations, setGrainOperations] = useState<GrainOperation[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // track if more pages exist
  const [visible, setVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetch = async () => {
        if (!driver?.id || !hasMore) return;

        setLoading(true);
        try {
          const data = await getListGrainOperations({
            page,
            driverId: driver.id,
            state: "processed",
          });
          const fetchedGrainOperations = data.results ?? [];
          if (isActive) {
            setGrainOperations((prev) =>
              page === 1
                ? fetchedGrainOperations
                : [...prev, ...fetchedGrainOperations],
            );
            setHasMore(fetchedGrainOperations.length > 0);
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
    }, [driver?.id, page, hasMore]),
  );

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Modal
  const openModal = () => setVisible(true);
  const closeModal = () => setVisible(false);

  return (
    <View className="bg-slate-50 h-full flex pt-4 px-2">
      <TouchableOpacity
        className="flex-row items-center justify-center bg-blue-600 px-5 py-4 rounded-2xl shadow-sm active:bg-blue-700 mb-3 mx-1"
        onPress={() => openModal()}
      >
        <Text className="text-white text-sm font-extrabold uppercase tracking-widest">+ Procesar Operación</Text>
      </TouchableOpacity>
      
      <View className="flex-1 mt-1">
        <ListGrainOperations
          grainOperations={grainOperations}
          loading={loading}
          handleLoadMore={handleLoadMore}
        />
      </View>

      <GrainOperationModalForm visible={visible} onClose={closeModal} />
    </View>
  );
}
