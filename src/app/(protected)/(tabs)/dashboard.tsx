import { View, ActivityIndicator, Text, ScrollView } from "react-native";
import { getDashboard } from "../../../services/odoo/dasbhoard";
import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../../../utils/authContext";
import { Dashboard, Driver } from "../../../shared.types";
import DashboardCard from "../../../components/dashboard/_Card";
import DashboardCardInformation from "../../../components/dashboard/_CardInformation";
import FilterSelection from "../../../components/FilterSelection";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-charts-wrapper";

export default function DashboardScreen() {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [rangeDate, setRangeDate] = useState("today");

  const driver: Driver | null = authContext.driver;

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
    <View className="bg-secondary h-screen flex p-2">
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
            <DashboardCardInformation
              label="Distancia Recorrida"
              title={`${dashboard?.kilometers_traveled} Kms`}
              icon="route"
            />
            <DashboardCardInformation
              label="Tiempo de Manejo"
              title={`${dashboard?.hours_worked}`}
              icon="hours"
            />
          </View>

          <Text className="font-extrabold mb-2 text-2xl color-white">
            Productividad
          </Text>
          <View className="px-2 items-center"></View>
        </ScrollView>
      )}
    </View>
  );
}
