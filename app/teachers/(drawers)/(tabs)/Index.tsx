import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";

export default function TeacherHomePage() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Teacher Dashboard
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-white">
        <Text className="text-2xl font-bold text-gray-900">
          Teacher Dashboard
        </Text>
        <Text className="text-gray-600 mt-1">
          Welcome back, {user?.first_name || "Teacher"}!
        </Text>
      </View>

      {/* Teaching Performance Metrics */}
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Today's Overview
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {/* Active Classes */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm border-l-4 border-blue-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">4</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Active Classes
                </Text>
              </View>
              <Ionicons name="school-outline" size={28} color="#4A90E2" />
            </View>
            <Text className="text-green-600 text-xs font-medium mt-2">
              2 classes today
            </Text>
          </View>

          {/* Assignments to Grade */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm border-l-4 border-orange-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">12</Text>
                <Text className="text-gray-500 text-sm mt-1">To Grade</Text>
              </View>
              <Ionicons
                name="document-text-outline"
                size={28}
                color="#F59E0B"
              />
            </View>
            <Text className="text-red-600 text-xs font-medium mt-2">
              Due tomorrow
            </Text>
          </View>

          {/* Student Performance */}
          <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm border-l-4 border-green-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">87%</Text>
                <Text className="text-gray-500 text-sm mt-1">Avg. Score</Text>
              </View>
              <Ionicons name="trending-up-outline" size={28} color="#10B981" />
            </View>
            <Text className="text-green-600 text-xs font-medium mt-2">
              ↑ 5% from last week
            </Text>
          </View>

          {/* Total Students */}
          <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm border-l-4 border-purple-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">156</Text>
                <Text className="text-gray-500 text-sm mt-1">Students</Text>
              </View>
              <Ionicons name="people-outline" size={28} color="#8B5CF6" />
            </View>
            <Text className="text-blue-600 text-xs font-medium mt-2">
              Across all classes
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Teaching Actions */}
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Quick Actions
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm items-center border border-gray-200"
            onPress={() => router.push("/Classes")}
          >
            <View className="bg-blue-100 p-3 rounded-full">
              <Ionicons name="school-outline" size={28} color="#4A90E2" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              Manage Classes
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              View & edit classes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm items-center border border-gray-200"
            onPress={() => router.push("/Assignments")}
          >
            <View className="bg-green-100 p-3 rounded-full">
              <Ionicons name="create-outline" size={28} color="#10B981" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              Create Assignment
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              New quiz or test
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 w-[48%] shadow-sm items-center border border-gray-200"
            onPress={() => router.push("/Analytics")}
          >
            <View className="bg-orange-100 p-3 rounded-full">
              <Ionicons name="bar-chart-outline" size={28} color="#F59E0B" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              View Analytics
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              Student progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 w-[48%] shadow-sm items-center border border-gray-200"
            onPress={() => router.push("/Resources")}
          >
            <View className="bg-purple-100 p-3 rounded-full">
              <Ionicons name="library-outline" size={28} color="#8B5CF6" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              Teaching Resources
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              Materials & files
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Classes */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">
            Today's Classes
          </Text>
          <TouchableOpacity onPress={() => router.push("/Classes")}>
            <Text className="text-blue-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          {[
            {
              subject: "Mathematics",
              time: "9:00 AM - 10:30 AM",
              topic: "Algebra Review",
              students: 32,
              room: "Room 201",
            },
            {
              subject: "Science",
              time: "11:00 AM - 12:30 PM",
              topic: "Biology Lab",
              students: 28,
              room: "Lab 3",
            },
            {
              subject: "History",
              time: "2:00 PM - 3:30 PM",
              topic: "World War II",
              students: 35,
              room: "Room 105",
            },
          ].map((classItem, index) => (
            <View
              key={index}
              className={`flex-row items-center justify-between py-3 ${index < 2 ? "border-b border-gray-100" : ""}`}
            >
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">
                  {classItem.subject}
                </Text>
                <Text className="text-gray-500 text-sm">{classItem.topic}</Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {classItem.time} • {classItem.room}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-800 font-medium">
                  {classItem.students}
                </Text>
                <Text className="text-gray-500 text-xs">students</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Pending Grading Alert */}
      <View className="px-6 mt-6 mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Grading Attention
        </Text>

        <View className="bg-red-50 rounded-xl p-4 border border-red-200">
          <View className="flex-row items-start">
            <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
            <Text className="text-red-800 font-bold ml-2">
              ASSIGNMENTS NEED GRADING
            </Text>
          </View>
          <Text className="text-gray-800 font-medium mt-2">
            12 assignments pending review
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            Math Quiz and Science Report due tomorrow
          </Text>
          <TouchableOpacity
            className="bg-red-500 rounded-lg px-4 py-2 mt-3 self-start"
            onPress={() => router.push("/Assignments")}
          >
            <Text className="text-white font-medium">Grade Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Student Performance Highlights */}
      <View className="px-6 mt-4 mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Student Highlights
        </Text>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-semibold text-gray-800">Top Performers</Text>
            <Text className="text-blue-600 text-sm">This Week</Text>
          </View>

          {[
            {
              name: "Sarah Johnson",
              subject: "Mathematics",
              score: "98%",
              improvement: "+12%",
            },
            {
              name: "Michael Chen",
              subject: "Science",
              score: "95%",
              improvement: "+8%",
            },
            {
              name: "Emily Davis",
              subject: "History",
              score: "92%",
              improvement: "+15%",
            },
          ].map((student, index) => (
            <View
              key={index}
              className={`flex-row items-center justify-between py-2 ${index < 2 ? "border-b border-gray-100" : ""}`}
            >
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">
                  {student.name}
                </Text>
                <Text className="text-gray-500 text-sm">{student.subject}</Text>
              </View>
              <View className="items-end">
                <Text className="text-green-600 font-bold">
                  {student.score}
                </Text>
                <Text className="text-green-500 text-xs">
                  {student.improvement}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
