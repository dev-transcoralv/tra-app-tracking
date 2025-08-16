import { Tabs } from "expo-router";
import {
  FontAwesomeDashboard,
  FontAwesomeList,
  FontAwesomeUser,
} from "../../../components/Icons";
import { useExpoPushNotifications } from "../../../notifications/useExpoPushNotifications";

export default function TabsLayout() {
  // useExpoPushNotifications();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#e10718" }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <FontAwesomeDashboard props={{ color: "#e10718" }} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: "Ordenes",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeList props={{ color: color, size: size }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <FontAwesomeUser />,
        }}
      />
      {/*Review this TAB*/}
      <Tabs.Screen
        name="orders/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
