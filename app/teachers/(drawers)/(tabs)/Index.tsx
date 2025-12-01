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

          {/* Flashcard Sets */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm border-l-4 border-orange-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">12</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Flashcard Sets
                </Text>
              </View>
              <Ionicons name="copy-outline" size={28} color="#F59E0B" />
            </View>
            <Text className="text-blue-600 text-xs font-medium mt-2">
              Created by you
            </Text>
          </View>

          {/* Student Engagement */}
          <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm border-l-4 border-green-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">78%</Text>
                <Text className="text-gray-500 text-sm mt-1">Engagement</Text>
              </View>
              <Ionicons name="trending-up-outline" size={28} color="#10B981" />
            </View>
            <Text className="text-green-600 text-xs font-medium mt-2">
              Active this week
            </Text>
          </View>

          {/* Total Students */}
          <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm border-l-4 border-purple-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">32</Text>
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
            onPress={() => router.push("/teachers/(drawers)/(tabs)/Classes")}
          >
            <View className="bg-blue-100 p-3 rounded-full">
              <Ionicons name="school-outline" size={28} color="#4A90E2" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              Manage Classes
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              View & organize classes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm items-center border border-gray-200"
            onPress={() => router.push("/teachers/(drawers)/(tabs)/FlashCards")}
          >
            <View className="bg-green-100 p-3 rounded-full">
              <Ionicons name="add-circle-outline" size={28} color="#10B981" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              Create Flashcards
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              New study set
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 w-[48%] shadow-sm items-center border border-gray-200"
            onPress={() => router.push("/teachers/(drawers)/(tabs)/FlashCards")}
          >
            <View className="bg-orange-100 p-3 rounded-full">
              <Ionicons name="copy-outline" size={28} color="#F59E0B" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              My Flashcards
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              View all sets
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 w-[48%] shadow-sm items-center border border-gray-200"
            // onPress={() => router.push("/students")}
          >
            <View className="bg-purple-100 p-3 rounded-full">
              <Ionicons name="people-outline" size={28} color="#8B5CF6" />
            </View>
            <Text className="text-gray-800 font-medium mt-2 text-center">
              Student Progress
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              Track learning
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
              topic: "Algebra Basics",
              students: 15,
              room: "Virtual Class",
            },
            {
              subject: "Science",
              time: "11:00 AM - 12:30 PM",
              topic: "Biology Introduction",
              students: 12,
              room: "Virtual Class",
            },
            {
              subject: "History",
              time: "2:00 PM - 3:30 PM",
              topic: "Philippine History",
              students: 18,
              room: "Virtual Class",
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

      {/* Recent Flashcard Activity */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">
            Recent Flashcard Activity
          </Text>
          <TouchableOpacity onPress={() => router.push("/flashcards")}>
            <Text className="text-blue-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          {[
            {
              title: "Algebra Formulas",
              subject: "Mathematics",
              cards: 24,
              lastUpdated: "2 hours ago",
              students: 12,
            },
            {
              title: "Biology Terms",
              subject: "Science",
              cards: 18,
              lastUpdated: "1 day ago",
              students: 8,
            },
            {
              title: "Historical Events",
              subject: "History",
              cards: 32,
              lastUpdated: "2 days ago",
              students: 15,
            },
          ].map((flashcard, index) => (
            <View
              key={index}
              className={`flex-row items-center justify-between py-3 ${index < 2 ? "border-b border-gray-100" : ""}`}
            >
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">
                  {flashcard.title}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {flashcard.subject} • {flashcard.cards} cards
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  Updated {flashcard.lastUpdated} • {flashcard.students}{" "}
                  students using
                </Text>
              </View>
              <TouchableOpacity className="bg-blue-50 p-2 rounded-lg">
                <Ionicons name="play-outline" size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Student Progress Highlights */}
      <View className="px-6 mt-6 mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Student Progress
        </Text>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-semibold text-gray-800">Active Learners</Text>
            <Text className="text-blue-600 text-sm">This Week</Text>
          </View>

          {[
            {
              name: "Maria Santos",
              subject: "Mathematics",
              progress: "85%",
              sessions: 12,
            },
            {
              name: "Juan Dela Cruz",
              subject: "Science",
              progress: "78%",
              sessions: 8,
            },
            {
              name: "Anna Lopez",
              subject: "History",
              progress: "92%",
              sessions: 15,
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
                  {student.progress}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {student.sessions} sessions
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
