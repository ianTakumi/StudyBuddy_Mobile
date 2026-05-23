import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: Platform.OS === "ios" ? 85 : 70,
          borderTopWidth: 0,
          backgroundColor: "#FFFFFF",
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 10,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 15,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

          switch (route.name) {
            case "index":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Class":
              iconName = focused ? "school" : "school-outline";
              break;
            case "Schedule":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "Progress":
              iconName = focused ? "stats-chart" : "stats-chart-outline";
              break;
            case "FlashCards":
              iconName = focused ? "copy" : "copy-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return (
            <View className="relative items-center justify-center">
              {/* Decorative circle behind active icon */}
              {focused && (
                <View
                  className="absolute w-12 h-12 bg-emerald-100 rounded-full"
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                />
              )}

              {/* Small accent circle */}
              {focused && (
                <View className="absolute -top-1 -right-0.5 w-3.5 h-3.5 bg-emerald-300 rounded-full opacity-60" />
              )}

              <Ionicons
                name={iconName}
                size={focused ? 23 : 21}
                color={color}
                style={{
                  zIndex: 1,
                }}
              />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="Class"
        options={{
          title: "Classes",
          tabBarLabel: "Classes",
        }}
      />
      <Tabs.Screen
        name="Schedule"
        options={{
          title: "Schedule",
          tabBarLabel: "Schedule",
        }}
      />
      <Tabs.Screen
        name="Progress"
        options={{
          title: "Progress",
          tabBarLabel: "Progress",
        }}
      />
      <Tabs.Screen
        name="FlashCards"
        options={{
          title: "Flashcards",
          tabBarLabel: "Flashcards",
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}
