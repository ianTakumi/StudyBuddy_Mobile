import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { useSelector } from "react-redux";

export default function TabLayout() {
  const user = useSelector((state) => state.auth.user);
  const isTeacher = user?.role === "teacher";

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
            case "Index":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Classes":
              iconName = focused ? "school" : "school-outline";
              break;
            case "Assignments":
              iconName = focused ? "document-text" : "document-text-outline";
              break;
            case "FlashCards":
              iconName = focused ? "copy" : "copy-outline";
              break;
            case "Analytics":
              iconName = focused ? "bar-chart" : "bar-chart-outline";
              break;
            case "Resources":
              iconName = focused ? "library" : "library-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return (
            <View className="relative items-center justify-center">
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

              {focused && (
                <View className="absolute -top-1 -right-0.5 w-3.5 h-3.5 bg-emerald-300 rounded-full opacity-60" />
              )}

              <Ionicons
                name={iconName}
                size={focused ? 23 : 21}
                color={color}
                style={{ zIndex: 1 }}
              />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen
        name="Index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
        }}
      />

      <Tabs.Screen
        name="Classes"
        options={{
          title: "Classes",
          tabBarLabel: "Classes",
          tabBarButton: isTeacher ? undefined : () => null,
        }}
      />

      <Tabs.Screen
        name="Assignments"
        options={{
          title: "Assignments",
          tabBarLabel: "Assignments",
          tabBarButton: isTeacher ? undefined : () => null,
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
        name="Analytics"
        options={{
          title: "Analytics",
          tabBarLabel: "Analytics",
          tabBarButton: isTeacher ? undefined : () => null,
        }}
      />

      <Tabs.Screen
        name="Resources"
        options={{
          title: "Resources",
          tabBarLabel: "Resources",
          tabBarButton: isTeacher ? undefined : () => null,
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
