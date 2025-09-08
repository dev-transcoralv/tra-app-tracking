import { Tabs } from "expo-router";
import { Text } from "react-native";
import {
  FontAwesomeDashboard,
  FontAwesomeList,
  FontAwesomeOperative,
  FontAwesomeUmbrellaBeach,
  FontAwesomeUser,
} from "../../../components/Icons";
import { cssInterop } from "nativewind";

const StyledText = cssInterop(Text, {
  className: "style",
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveBackgroundColor: "#e10718",
        tabBarActiveTintColor: "white",
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeDashboard color={focused ? "white" : "#211915"} />
          ),
          tabBarLabel: ({ focused }) => (
            <StyledText
              className="text-xs font-bold"
              style={{ color: focused ? "white" : "#211915" }}
            >
              Dashboard
            </StyledText>
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: "Ordenes",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeList color={focused ? "white" : "#211915"} />
          ),
          tabBarLabel: ({ focused }) => (
            <StyledText
              className="text-xs font-bold"
              style={{ color: focused ? "white" : "#211915" }}
            >
              Ordenes
            </StyledText>
          ),
        }}
      />
      <Tabs.Screen
        name="operations/index"
        options={{
          title: "Operativos",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeOperative color={focused ? "white" : "#211915"} />
          ),
          tabBarLabel: ({ focused }) => (
            <StyledText
              className="text-xs font-bold"
              style={{ color: focused ? "white" : "#211915" }}
            >
              Operativos
            </StyledText>
          ),
        }}
      />
      <Tabs.Screen
        name="leaves/index"
        options={{
          title: "Ausencias",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeUmbrellaBeach color={focused ? "white" : "#211915"} />
          ),
          tabBarLabel: ({ focused }) => (
            <StyledText
              className="text-xs font-bold"
              style={{ color: focused ? "white" : "#211915" }}
            >
              Ausencias
            </StyledText>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeUser color={focused ? "white" : "#211915"} />
          ),
          tabBarLabel: ({ focused }) => (
            <StyledText
              className="text-xs font-bold"
              style={{ color: focused ? "white" : "#211915" }}
            >
              Perfil
            </StyledText>
          ),
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
