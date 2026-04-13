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
        tabBarActiveTintColor: "#e10718",
        tabBarInactiveTintColor: "#94a3b8",
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#f8fafc",
        },
        headerTitleStyle: {
          fontWeight: "900",
          color: "#0f172a",
          textTransform: "uppercase",
          letterSpacing: 2,
          fontSize: 14,
        },
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#f1f5f9",
          borderTopWidth: 1,
          elevation: 10,
          zIndex: 100,
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeDashboard color={focused ? "#e10718" : "#94a3b8"} />
          ),
          tabBarLabel: ({ focused }) => (
            <StyledText
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: focused ? "#e10718" : "#94a3b8" }}
            >
              Inicio
            </StyledText>
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: "Viajes",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeList color={focused ? "#e10718" : "#94a3b8"} />
          ),
          tabBarLabel: ({ focused }) => (
            <StyledText
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: focused ? "#e10718" : "#94a3b8" }}
            >
              Viajes
            </StyledText>
          ),
        }}
      />
      <Tabs.Screen
        name="operations/index"
        options={{
          title: "Cargas",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeOperative color={focused ? "#e10718" : "#94a3b8"} />
          ),
          tabBarLabel: ({ focused }) => (
            <StyledText
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: focused ? "#e10718" : "#94a3b8" }}
            >
              Cargas
            </StyledText>
          ),
        }}
      />
      <Tabs.Screen
        name="leaves/index"
        options={{
          title: "Ausencias",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeUmbrellaBeach color={focused ? "#e10718" : "#94a3b8"} />
          ),
          tabBarLabel: ({ focused }) => (
            <StyledText
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: focused ? "#e10718" : "#94a3b8" }}
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
            <FontAwesomeUser color={focused ? "#e10718" : "#94a3b8"} />
          ),
          tabBarLabel: ({ focused }) => (
            <StyledText
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: focused ? "#e10718" : "#94a3b8" }}
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
          // Optionally hide the header if you don't want it
          headerShown: true,
          href: null, // prevents automatic link generation in Expo Router
        }}
      />
    </Tabs>
  );
}
