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
            case "index":
              return <Ionicons name="home-outline" size={22} color={color} />;

            case "Class":
              return <Ionicons name="school-outline" size={22} color={color} />;

            case "Schedule":
              return (
                <Ionicons name="calendar-outline" size={22} color={color} />
              );

            case "Progress":
              return (
                <Ionicons name="stats-chart-outline" size={22} color={color} />
              );
            case "FlashCards":
              return <Ionicons name="copy-outline" size={22} color={color} />;

            case "Profile":
              return <Ionicons name="person-outline" size={22} color={color} />;

            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="Class" options={{ title: "Classes" }} />
      <Tabs.Screen name="Schedule" options={{ title: "Schedule" }} />
      <Tabs.Screen name="Progress" options={{ title: "Progress" }} />
      <Tabs.Screen name="FlashCards" options={{ title: "Flashcards" }} />
      <Tabs.Screen name="Profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
