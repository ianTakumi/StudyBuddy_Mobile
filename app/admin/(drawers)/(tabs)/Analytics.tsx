// app/Analytics.tsx - Analytics Screen
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState("week"); // week, month, year

  // Realistic analytics data for 8 users with October-November timeframe
  const analyticsData = {
    week: {
      overview: {
        totalUsers: 8,
        activeUsers: 5,
        newRegistrations: 2,
        studySessions: 47,
        averageSession: "12m 45s",
        retentionRate: "62%",
      },
      userGrowth: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        data: [6, 7, 5, 8, 6, 7, 8],
      },
      engagement: {
        dailyActive: [3, 4, 2, 5, 3, 4, 3],
        studyTime: [10, 12, 8, 15, 11, 14, 9],
        flashcardsCreated: [8, 6, 4, 10, 7, 9, 5],
      },
      contentStats: {
        totalFlashcards: 127,
        totalSets: 23,
        averageRating: 4.2,
        popularSubjects: [
          { subject: "Mathematics", count: 34, growth: "+3%" },
          { subject: "Science", count: 28, growth: "+2%" },
          { subject: "History", count: 22, growth: "+5%" },
          { subject: "Languages", count: 18, growth: "+1%" },
        ],
      },
    },
    month: {
      overview: {
        totalUsers: 8,
        activeUsers: 6,
        newRegistrations: 2,
        studySessions: 156,
        averageSession: "14m 20s",
        retentionRate: "68%",
      },
      userGrowth: {
        labels: ["Oct W1", "Oct W2", "Oct W3", "Oct W4", "Nov W1"],
        data: [2, 3, 5, 6, 8],
      },
      engagement: {
        dailyActive: [4, 3, 5, 4, 3, 4, 5],
        studyTime: [12, 14, 16, 13, 11, 15, 14],
        flashcardsCreated: [15, 12, 18, 14, 10, 16, 13],
      },
      contentStats: {
        totalFlashcards: 156,
        totalSets: 28,
        averageRating: 4.3,
        popularSubjects: [
          { subject: "Mathematics", count: 45, growth: "+8%" },
          { subject: "Science", count: 38, growth: "+6%" },
          { subject: "History", count: 32, growth: "+10%" },
          { subject: "Languages", count: 25, growth: "+4%" },
        ],
      },
    },
    year: {
      overview: {
        totalUsers: 8,
        activeUsers: 7,
        newRegistrations: 8,
        studySessions: 289,
        averageSession: "15m 30s",
        retentionRate: "72%",
      },
      userGrowth: {
        labels: ["Oct", "Nov"],
        data: [3, 8],
      },
      engagement: {
        dailyActive: [5, 4, 6, 5, 4, 5, 6],
        studyTime: [15, 16, 18, 17, 14, 19, 16],
        flashcardsCreated: [20, 18, 22, 19, 16, 21, 18],
      },
      contentStats: {
        totalFlashcards: 289,
        totalSets: 45,
        averageRating: 4.4,
        popularSubjects: [
          { subject: "Mathematics", count: 78, growth: "+25%" },
          { subject: "Science", count: 65, growth: "+20%" },
          { subject: "History", count: 52, growth: "+30%" },
          { subject: "Languages", count: 38, growth: "+15%" },
        ],
      },
    },
  };

  // Get current data based on selected time range
  const currentData = analyticsData[timeRange];

  const StatCard = ({ title, value, change, icon, color = "#4A90E2" }) => (
    <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-gray-600 text-sm mb-1">{title}</Text>
          <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
          {change && (
            <Text
              className={`text-sm ${change.includes("+") ? "text-green-500" : "text-red-500"}`}
            >
              {change} from last {timeRange}
            </Text>
          )}
        </View>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
      </View>
    </View>
  );

  const SimpleBarChart = ({ data, labels, color = "#4A90E2" }) => {
    const maxValue = Math.max(...data);

    return (
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <View className="flex-row justify-between items-end h-32">
          {data.map((value, index) => (
            <View key={index} className="items-center flex-1">
              <View
                className="w-6 rounded-t-lg"
                style={{
                  height: (value / maxValue) * 80,
                  backgroundColor: color,
                }}
              />
              <Text className="text-gray-600 text-xs mt-2">
                {labels[index]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">Analytics</Text>
        <Text className="text-gray-600 mt-1">
          Platform performance since October 2024
        </Text>
      </View>

      {/* Time Range Selector */}
      <View className="bg-white px-4 py-3 shadow-sm">
        <View className="flex-row justify-center space-x-2">
          {["week", "month", "year"].map((range) => (
            <TouchableOpacity
              key={range}
              className={`px-4 py-2 rounded-full ${
                timeRange === range ? "bg-blue-500" : "bg-gray-200"
              }`}
              onPress={() => setTimeRange(range)}
            >
              <Text
                className={`font-medium ${
                  timeRange === range ? "text-white" : "text-gray-700"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Overview Stats */}
      <View className="px-4 pt-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Overview - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%]">
            <StatCard
              title="Total Users"
              value={currentData.overview.totalUsers.toLocaleString()}
              change={
                timeRange === "week"
                  ? "+2%"
                  : timeRange === "month"
                    ? "+25%"
                    : "+167%"
              }
              icon="people-outline"
              color="#4A90E2"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Active Users"
              value={currentData.overview.activeUsers.toLocaleString()}
              change={
                timeRange === "week"
                  ? "+1%"
                  : timeRange === "month"
                    ? "+20%"
                    : "+133%"
              }
              icon="flash-outline"
              color="#34C759"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="New Registrations"
              value={currentData.overview.newRegistrations.toString()}
              change={
                timeRange === "week"
                  ? "+1"
                  : timeRange === "month"
                    ? "+2"
                    : "+8"
              }
              icon="person-add-outline"
              color="#FF9500"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Study Sessions"
              value={currentData.overview.studySessions.toLocaleString()}
              change={
                timeRange === "week"
                  ? "+8%"
                  : timeRange === "month"
                    ? "+85%"
                    : "+288%"
              }
              icon="school-outline"
              color="#AF52DE"
            />
          </View>
        </View>
      </View>

      {/* Charts Section */}
      <View className="px-4 mt-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          User Growth
        </Text>
        <SimpleBarChart
          data={currentData.userGrowth.data}
          labels={currentData.userGrowth.labels}
          color="#4A90E2"
        />
      </View>

      {/* Engagement Metrics */}
      <View className="px-4 mt-6">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Engagement Metrics
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%]">
            <StatCard
              title="Avg. Session Time"
              value={currentData.overview.averageSession}
              change={
                timeRange === "week"
                  ? "+2%"
                  : timeRange === "month"
                    ? "+12%"
                    : "+23%"
              }
              icon="time-outline"
              color="#34C759"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Retention Rate"
              value={currentData.overview.retentionRate}
              change={
                timeRange === "week"
                  ? "+3%"
                  : timeRange === "month"
                    ? "+10%"
                    : "+16%"
              }
              icon="trending-up-outline"
              color="#FF9500"
            />
          </View>
        </View>
      </View>

      {/* Content Statistics */}
      <View className="px-4 mt-6 mb-8">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Content Statistics
        </Text>
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {currentData.contentStats.totalFlashcards.toLocaleString()}
              </Text>
              <Text className="text-gray-600">Total Flashcards</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {currentData.contentStats.totalSets}
              </Text>
              <Text className="text-gray-600">Flashcard Sets</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {currentData.contentStats.averageRating}
              </Text>
              <Text className="text-gray-600">Avg. Rating</Text>
            </View>
          </View>

          <Text className="font-semibold text-gray-900 mb-3">
            Popular Subjects
          </Text>
          {currentData.contentStats.popularSubjects.map((subject, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
            >
              <Text className="text-gray-700 flex-1">{subject.subject}</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-900 font-semibold mr-2">
                  {subject.count.toLocaleString()}
                </Text>
                <Text className="text-green-500 text-sm">{subject.growth}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
