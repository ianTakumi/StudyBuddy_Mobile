// app/index.tsx - Dashboard Screen
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Dashboard() {
  // Realistic Data for 8 Users (October-November timeframe)
  const dashboardData = {
    overview: {
      totalUsers: 8,
      activeToday: 5,
      newThisWeek: 2,
      totalFlashcards: 289,
    },
    userStats: {
      byType: [
        { type: "Students", count: 6, percentage: 75 },
        { type: "Teachers", count: 1, percentage: 12.5 },
        { type: "Admins", count: 1, percentage: 12.5 },
      ],
    },
    recentActivity: [
      {
        id: 1,
        user: "Juan Dela Cruz",
        action: "created flashcard set",
        target: "Mathematics Basics",
        time: "2 hours ago",
        type: "flashcard",
      },
      {
        id: 2,
        user: "Maria Santos",
        action: "completed study session",
        target: "Science Terms",
        time: "4 hours ago",
        type: "study",
      },
      {
        id: 3,
        user: "Pedro Reyes",
        action: "created flashcard set",
        target: "History Timeline",
        time: "1 day ago",
        type: "flashcard",
      },
      {
        id: 4,
        user: "Anna Lopez",
        action: "completed study session",
        target: "Language Vocabulary",
        time: "1 day ago",
        type: "study",
      },
      {
        id: 5,
        user: "Michael Tan",
        action: "created flashcard set",
        target: "Physics Formulas",
        time: "2 days ago",
        type: "flashcard",
      },
    ],
    systemStats: {
      storageUsed: "156 MB",
      storageTotal: "1 GB",
      activeSessions: 5,
      averageSessionTime: "15 mins",
    },
    quickActions: [
      { icon: "person-add", title: "Add User", color: "#4A90E2" },
      { icon: "document-text", title: "Review Content", color: "#34C759" },
      { icon: "stats-chart", title: "View Reports", color: "#FF9500" },
      { icon: "settings", title: "System Settings", color: "#8E8E93" },
    ],
  };

  const StatCard = ({ title, value, subtitle, icon, color = "#4A90E2" }) => (
    <View
      className="bg-white rounded-lg p-4 shadow-sm border-l-4 mb-4"
      style={{ borderLeftColor: color }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Ionicons name={icon} size={24} color={color} />
        <Text className="text-2xl font-bold text-gray-800">{value}</Text>
      </View>
      <Text className="text-lg font-semibold text-gray-700">{title}</Text>
      {subtitle && (
        <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
      )}
    </View>
  );

  const ActivityItem = ({ item }) => {
    const getIcon = (type) => {
      switch (type) {
        case "flashcard":
          return "copy-outline";
        case "study":
          return "school-outline";
        case "report":
          return "flag-outline";
        case "upload":
          return "cloud-upload-outline";
        default:
          return "notifications-outline";
      }
    };

    const getIconColor = (type) => {
      switch (type) {
        case "flashcard":
          return "#4A90E2";
        case "study":
          return "#34C759";
        case "report":
          return "#FF3B30";
        case "upload":
          return "#FF9500";
        default:
          return "#8E8E93";
      }
    };

    return (
      <View className="flex-row items-center bg-white p-3 rounded-lg mb-2 shadow-sm">
        <Ionicons
          name={getIcon(item.type)}
          size={20}
          color={getIconColor(item.type)}
        />
        <View className="ml-3 flex-1">
          <Text className="text-gray-800">
            <Text className="font-semibold">{item.user}</Text> {item.action}{" "}
            <Text className="text-blue-600">{item.target}</Text>
          </Text>
          <Text className="text-gray-500 text-xs mt-1">{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 pt-14">
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </Text>
        <Text className="text-gray-600 mt-1">
          Welcome back! Since October 2024
        </Text>
      </View>

      {/* Quick Stats Grid */}
      <View className="px-4 pt-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-lg font-semibold text-gray-800">Overview</Text>
          <Text className="text-blue-500">This Week</Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%]">
            <StatCard
              title="Total Users"
              value={dashboardData.overview.totalUsers}
              subtitle="+2 this week"
              icon="people-outline"
              color="#4A90E2"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Active Today"
              value={dashboardData.overview.activeToday}
              subtitle="62% of total"
              icon="trending-up-outline"
              color="#34C759"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="New This Week"
              value={dashboardData.overview.newThisWeek}
              subtitle="Since Nov 1"
              icon="person-add-outline"
              color="#FF9500"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Total Flashcards"
              value={dashboardData.overview.totalFlashcards}
              subtitle="45 sets"
              icon="copy-outline"
              color="#AF52DE"
            />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mt-2">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Quick Actions
        </Text>
        <View className="flex-row justify-between">
          {dashboardData.quickActions.map((action, index) => (
            <TouchableOpacity key={index} className="items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${action.color}20` }}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text className="text-xs text-gray-700 text-center">
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View className="px-4 mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-800">
            Recent Activity
          </Text>
          <TouchableOpacity>
            <Text className="text-blue-500 text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          {dashboardData.recentActivity.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </View>
      </View>

      {/* User Distribution */}
      <View className="px-4 mt-2 mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          User Distribution
        </Text>
        <View className="bg-white rounded-lg p-4 shadow-sm">
          {dashboardData.userStats.byType.map((stat, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center py-2"
            >
              <View className="flex-row items-center">
                <View
                  className="w-3 h-3 rounded-full mr-3"
                  style={{
                    backgroundColor:
                      stat.type === "Students"
                        ? "#4A90E2"
                        : stat.type === "Teachers"
                          ? "#34C759"
                          : "#FF9500",
                  }}
                />
                <Text className="text-gray-700">{stat.type}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-800 font-semibold mr-2">
                  {stat.count}
                </Text>
                <Text className="text-gray-500 text-sm">
                  ({stat.percentage}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* System Stats */}
      <View className="px-4 mt-2 mb-8">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          System Status
        </Text>
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-700">Storage Used</Text>
            <Text className="text-gray-800 font-semibold">
              {dashboardData.systemStats.storageUsed} /{" "}
              {dashboardData.systemStats.storageTotal}
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-700">Active Sessions</Text>
            <Text className="text-gray-800 font-semibold">
              {dashboardData.systemStats.activeSessions}
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-700">Avg. Session Time</Text>
            <Text className="text-gray-800 font-semibold">
              {dashboardData.systemStats.averageSessionTime}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
