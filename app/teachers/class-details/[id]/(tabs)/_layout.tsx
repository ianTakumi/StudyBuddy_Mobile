import { Ionicons } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams } from "expo-router";
import { Platform, View } from "react-native";

export default function ClassDetailsTabsLayout() {
  const { id } = useLocalSearchParams();

  console.log("Layout - Class ID:", id);
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        headerTitle: "Class Details",
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: Platform.OS === "ios" ? 85 : 65,
          borderTopWidth: 0,
          backgroundColor: "#FFFFFF",
          paddingBottom: Platform.OS === "ios" ? 25 : 8,
          paddingTop: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 10,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 3,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 2,
          letterSpacing: 0.2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "information-circle";

          switch (route.name) {
            case "index":
              iconName = focused
                ? "information-circle"
                : "information-circle-outline";
              break;
            case "students":
              iconName = focused ? "people" : "people-outline";
              break;
            case "attendance":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "quizzes":
              iconName = focused ? "document-text" : "document-text-outline";
              break;
            case "FlashCards":
              iconName = focused ? "copy" : "copy-outline";
              break;
            case "assignments":
              iconName = focused ? "create" : "create-outline";
              break;
            case "grades":
              iconName = focused ? "bar-chart" : "bar-chart-outline";
              break;
          }

          return (
            <View className="relative items-center justify-center">
              {focused && (
                <View
                  className="absolute w-10 h-10 bg-emerald-100 rounded-full"
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
                <View className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-300 rounded-full opacity-60" />
              )}

              <Ionicons
                name={iconName}
                size={focused ? 22 : 20}
                color={color}
                style={{ zIndex: 1 }}
              />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Info",
          tabBarLabel: "Info",
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: "Students",
          tabBarLabel: "Students",
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarLabel: "Attendance",
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          title: "Quizzes",
          tabBarLabel: "Quizzes",
        }}
      />
      <Tabs.Screen
        name="FlashCards"
        options={{
          title: "Flashcards",
          tabBarLabel: "Flashcards",
        }}
        initialParams={{ id }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: "Assignments",
          tabBarLabel: "Assignments",
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: "Grades",
          tabBarLabel: "Grades",
        }}
      />
    </Tabs>
  );
}
