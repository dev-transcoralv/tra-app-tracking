import { View, ActivityIndicator, Text, Dimensions } from "react-native";
import { getDashboard } from "../../../services/odoo/dasbhoard";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../utils/authContext";
import { Dashboard, Driver } from "../../../shared.types";
import DashboardCard from "../../../components/dashboard/_Card";
import DashboardCardInformation from "../../../components/dashboard/_CardInformation";
import FilterSelection from "../../../components/FilterSelection";
import { BarChart } from "react-native-chart-kit";

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

  const data = {
    labels: ["Pendientes", "Realizadas"],
    datasets: [
      {
        data: [20, 40],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#1c3b8a",
    backgroundGradientTo: "#1c3b8a",
    decimalPlaces: 0, // optional, defaults to 2dp
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const loadDashboard = async (
    driverId: number | undefined,
    rangeDate: string,
  ) => {
    try {
      setLoading(true);
      const data = await getDashboard(driverId, rangeDate);
      setDashboard(data);
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(driver?.id, rangeDate);
  }, [driver?.id, rangeDate]);

  return (
    <View className="bg-secondary h-screen flex p-2">
      <FilterSelection
        options={options}
        onSelect={(value) => setRangeDate(value)}
      />
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View>
          <DashboardCard count={dashboard?.finished_trips} status="finished" />
          <DashboardCard count={dashboard?.pending_trips} status="pending" />
          <View className="flex-row justify-between gap-x-2">
            <DashboardCardInformation
              label="Distancia Recorrida"
              title={`${dashboard?.kilometers_traveled} Kms`}
              icon="route"
            />
            <DashboardCardInformation
              label="Horas Trabajadas"
              title={`${dashboard?.hours_worked}`}
              icon="hours"
            />
          </View>

          <Text className="font-extrabold mb-2 text-2xl color-white">
            Productividad
          </Text>

          <View className="px-4 items-center">
            <BarChart
              yAxisSuffix=""
              data={data}
              width={screenWidth - 32}
              height={250}
              yAxisLabel={""}
              chartConfig={chartConfig}
            />
          </View>
        </View>
      )}
    </View>
  );
}
