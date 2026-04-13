import Toast from "react-native-toast-message";
import {
  View,
  ActivityIndicator,
  Text,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { getDashboard } from "../../../services/odoo/dashboard";
import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../../../utils/authContext";
import { Dashboard, Driver } from "../../../shared.types";
import DashboardCard from "../../../components/dashboard/_Card";
import DashboardCardInformation from "../../../components/dashboard/_CardInformation";
import FilterSelection from "../../../components/FilterSelection";
import { useFocusEffect } from "@react-navigation/native";
import { BarChart } from "react-native-gifted-charts";
import { OrderCardSummary } from "../../../components/orders/_CardSummary";

type RangeDate = "today" | "week" | "month";

export default function DashboardScreen() {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [rangeDate, setRangeDate] = useState<RangeDate>("today");

  const driver: Driver | null = authContext.driver;
  const { width: screenWidth } = useWindowDimensions();

  const options = [
    { label: "Hoy", value: "today" },
    { label: "Semana", value: "week" },
    { label: "Mes", value: "month" },
    { label: "Año", value: "year" },
  ];

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadDashboard = async (
        driverId: number | undefined,
        currentRange: RangeDate,
      ) => {
        try {
          setLoading(true);
          const data = await getDashboard(driverId, currentRange);
          if (isActive) setDashboard(data);
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: error?.message || String(error),
          });
        } finally {
          if (isActive) setLoading(false);
        }
      };
      loadDashboard(driver?.id, rangeDate);
      return () => {
        isActive = false;
      };
    }, [driver?.id, rangeDate]),
  );

  useEffect(() => {
    return () => {
      setDashboard(null);
    };
  }, []);

  return (
    <View className="bg-secondary flex-1 p-2">
      <FilterSelection
        options={options}
        onSelect={(value: string) => setRangeDate(value as RangeDate)}
      />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={"#fff"} size={"large"} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <DashboardCard count={dashboard?.finished_trips} status="finished" />
          <DashboardCard count={dashboard?.pending_trips} status="pending" />
          <View className="flex-row justify-between gap-x-2">
            <DashboardCardInformation
              label="Distancia Recorrida"
              title={`${dashboard?.kilometers_traveled ?? 0} Kms`}
              icon="route"
            />
            <DashboardCardInformation
              label="Mantenimientos"
              title={`1`}
              icon="maintenance"
            />
          </View>

          {dashboard?.trip_in_progress && (
            <View className="flex-1 mt-4">
              <OrderCardSummary order={dashboard.trip_in_progress} />
            </View>
          )}

          {!!dashboard?.road_trips?.length && (
            <View>
              <Text className="font-extrabold my-2 text-2xl color-white">
                Productividad
              </Text>
              <View className="mb-4 items-center bg-secondary-complementary rounded-xl py-2">
                <BarChart
                  data={dashboard.road_trips}
                  barWidth={30}
                  frontColor="#1c3b81"
                  yAxisThickness={0}
                  xAxisThickness={0}
                  showLine
                  width={screenWidth - 50}
                />
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
