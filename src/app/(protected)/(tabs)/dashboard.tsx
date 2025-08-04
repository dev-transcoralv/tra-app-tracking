import { View } from "react-native";
import { getDashboard } from "../../../services/odoo/dasbhoard";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../utils/authContext";
import { Dashboard, Driver } from "../../../shared.types";
import DashboardCard from "../../../components/dashboard/_Card";

export default function DashboardScreen() {
  const authContext = useContext(AuthContext);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  const driver: Driver | null = authContext.driver;

  const loadDashboard = async () => {
    const data = await getDashboard(driver?.id);
    setDashboard(data);
  };

  useEffect(() => {
    loadDashboard();
  });

  return (
    <View className="bg-secondary h-screen flex p-2">
      <DashboardCard count={dashboard?.finished_trips} status="finished" />
      <DashboardCard count={dashboard?.pending_trips} status="pending" />
    </View>
  );
}
