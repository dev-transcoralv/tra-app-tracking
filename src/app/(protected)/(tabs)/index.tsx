/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  View,
  ActivityIndicator,
  Text,
  ScrollView,
  Dimensions,
  Button,
} from "react-native";
import { getDashboard } from "../../../services/odoo/dasbhoard";
import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../../../utils/authContext";
import { Dashboard, Driver } from "../../../shared.types";
import DashboardCard from "../../../components/dashboard/_Card";
import DashboardCardInformation from "../../../components/dashboard/_CardInformation";
import FilterSelection from "../../../components/FilterSelection";
import { useFocusEffect } from "@react-navigation/native";
import { BarChart } from "react-native-gifted-charts";
import { OrderCardSummary } from "../../../components/orders/_CardSummary";

export default function DashboardScreen() {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [rangeDate, setRangeDate] = useState("today");

  const driver: Driver | null = authContext.driver;

  const screenWidth = Dimensions.get("window").width;

  const options = [
    { label: "Hoy", value: "today" },
    { label: "Semana", value: "week" },
    { label: "Mes", value: "month" },
  ];

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadDashboard = async (
        driverId: number | undefined,
        rangeDate: string,
      ) => {
        try {
          setLoading(true);
          const data = await getDashboard(driverId, rangeDate);
          if (isActive) setDashboard(data);
        } catch (error: any) {
          throw error;
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
    <ScrollView className="bg-secondary h-screen flex p-2">
      <FilterSelection
        options={options}
        onSelect={(value) => setRangeDate(value)}
      />
      {loading ? (
        <ActivityIndicator color={"#fff"} size={"large"} />
      ) : (
        <ScrollView>
          <DashboardCard count={dashboard?.finished_trips} status="finished" />
          <DashboardCard count={dashboard?.pending_trips} status="pending" />
          <View className="flex-row justify-between gap-x-2">
            <View className="gap-2">
              <DashboardCardInformation
                label="Distancia Recorrida"
                title={`${dashboard?.kilometers_traveled} Kms`}
                icon="route"
              />
              <DashboardCardInformation
                label="Mantenimientos"
                title={`1`}
                icon="maintenance"
              />
            </View>
            {dashboard?.trip_in_progress && (
              <OrderCardSummary order={dashboard.trip_in_progress} />
            )}
          </View>

          {dashboard && dashboard.road_trips.length > 0 && (
            <View>
              <Text className="font-extrabold my-2 text-2xl color-white">
                Productividad
              </Text>
              <View className="mb-4 items-center bg-secondary-complementary">
                <BarChart
                  data={dashboard.road_trips}
                  barWidth={30}
                  frontColor="#1c3b81"
                  yAxisThickness={0}
                  xAxisThickness={0}
                  showLine
                  width={screenWidth - 34} // adjust for padding/margin if needed
                />
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </ScrollView>
  );
}
