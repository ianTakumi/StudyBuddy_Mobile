import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#4A90E2",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 60,
          borderTopWidth: 0.3,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#fff",
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "Index":
              return <Ionicons name="grid-outline" size={22} color={color} />;

            case "Users":
              return <Ionicons name="people-outline" size={22} color={color} />;

            case "Analytics":
              return (
                <Ionicons name="stats-chart-outline" size={22} color={color} />
              );

            case "Content":
              return (
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={color}
                />
              );

            case "Profile":
              return <Ionicons name="person-outline" size={22} color={color} />;

            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="Index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="Users" options={{ title: "Users" }} />
      <Tabs.Screen name="Analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="Content" options={{ title: "Content" }} />
      <Tabs.Screen name="Profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
