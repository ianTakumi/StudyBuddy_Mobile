import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useSelector } from "react-redux";

export default function TabLayout() {
  const user = useSelector((state) => state.auth.user);
  const isTeacher = user?.role === "teacher";

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
              return <Ionicons name="home-outline" size={22} color={color} />;

            case "Classes":
              return <Ionicons name="school-outline" size={22} color={color} />;

            case "FlashCards":
              return <Ionicons name="copy-outline" size={22} color={color} />;
            case "Assignments":
              return (
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={color}
                />
              );

            case "Analytics":
              return (
                <Ionicons name="bar-chart-outline" size={22} color={color} />
              );
            case "Resources":
              return (
                <Ionicons name="library-outline" size={22} color={color} />
              );
            case "Profile":
              return <Ionicons name="person-outline" size={22} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="Index" options={{ title: "Home" }} />

      <Tabs.Screen
        name="Classes"
        options={{
          title: "Classes",
          tabBarButton: isTeacher ? undefined : () => null,
        }}
      />

      <Tabs.Screen
        name="Assignments"
        options={{
          title: "Assignments",
          tabBarButton: isTeacher ? undefined : () => null,
        }}
      />

      <Tabs.Screen name="FlashCards" options={{ title: "Flashcards" }} />

      <Tabs.Screen
        name="Analytics"
        options={{
          title: "Analytics",
          tabBarButton: isTeacher ? undefined : () => null,
        }}
      />

      <Tabs.Screen
        name="Resources"
        options={{
          title: "Resources",
          tabBarButton: isTeacher ? undefined : () => null,
        }}
      />

      <Tabs.Screen name="Profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
