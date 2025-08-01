import { Tabs } from "expo-router";
import {
  FontAwesomeDashboard,
  FontAwesomeList,
  FontAwesomeUser,
} from "../../../components/Icons";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "red" }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <FontAwesomeDashboard props={{ color: "red" }} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: "Ordenes",
          tabBarIcon: ({ color }) => <FontAwesomeList />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <FontAwesomeUser />,
        }}
      />
    </Tabs>
  );
}
