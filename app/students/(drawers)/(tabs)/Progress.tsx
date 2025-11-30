import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressChart } from "react-native-chart-kit";

export default function Progress() {
  const progressData = {
    labels: ["Math", "Science", "History", "English"],
    data: [0.7, 0.5, 0.8, 0.6],
  };

  const weeklyStats = [
    { day: "Mon", hours: 3, completed: true },
    { day: "Tue", hours: 2, completed: true },
    { day: "Wed", hours: 4, completed: true },
    { day: "Thu", hours: 1, completed: false },
    { day: "Fri", hours: 0, completed: false },
    { day: "Sat", hours: 0, completed: false },
    { day: "Sun", hours: 0, completed: false },
  ];

  const achievements = [
    {
      id: 1,
      title: "Math Master",
      description: "Complete 10 math quizzes",
      completed: true,
    },
    {
      id: 2,
      title: "Science Whiz",
      description: "Study science for 5 hours",
      completed: false,
    },
    {
      id: 3,
      title: "History Buff",
      description: "Read 3 history chapters",
      completed: true,
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Study Progress</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Overall Progress */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Overall Progress
            </Text>
            <View className="items-center">
              <ProgressChart
                data={progressData}
                width={200}
                height={200}
                strokeWidth={16}
                radius={80}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                }}
                hideLegend={false}
              />
            </View>
            <View className="mt-4">
              <Text className="text-center text-gray-600">
                You've completed <Text className="font-bold">65%</Text> of your
                weekly goals
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Study Hours */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              This Week's Study Hours
            </Text>
            <View className="flex-row justify-between items-end h-32">
              {weeklyStats.map((day, index) => (
                <View key={index} className="items-center">
                  <View
                    className={`w-8 rounded-t-lg ${
                      day.completed ? "bg-blue-500" : "bg-gray-200"
                    }`}
                    style={{ height: day.hours * 8 }}
                  />
                  <Text className="text-gray-600 text-xs mt-2">{day.day}</Text>
                  <Text className="text-gray-900 text-xs font-medium">
                    {day.hours}h
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-gray-600">Total: 10/20 hours</Text>
              <TouchableOpacity className="bg-blue-100 px-3 py-1 rounded-lg">
                <Text className="text-blue-600 text-sm">View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Study Stats */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Study Statistics
            </Text>
            <View className="flex-row justify-between mb-4">
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-500">12</Text>
                <Text className="text-gray-600 text-sm">Sessions</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-500">8</Text>
                <Text className="text-gray-600 text-sm">Quizzes</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-500">15</Text>
                <Text className="text-gray-600 text-sm">Flashcards</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-orange-500">85%</Text>
                <Text className="text-gray-600 text-sm">Average</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View className="mx-4 mb-8">
          <View className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Achievements
            </Text>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                className="flex-row items-center mb-4 last:mb-0"
              >
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                    achievement.completed ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <Ionicons
                    name={achievement.completed ? "trophy" : "trophy-outline"}
                    size={24}
                    color={achievement.completed ? "#10B981" : "#9CA3AF"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {achievement.title}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {achievement.description}
                  </Text>
                </View>
                {achievement.completed && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
