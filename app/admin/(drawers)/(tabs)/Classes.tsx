import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import client from "@/utils/axiosInstance";

interface ScheduleItem {
  day: string;
  startTime: string;
  startApm: "AM" | "PM";
  endTime: string;
  endApm: "AM" | "PM";
}

interface Class {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  student_count: number;
  schedule: ScheduleItem[];
  room: string;
  description?: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  class_code: string;
}

export default function Classes() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch classes
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await client.get("/classes");
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      Alert.alert("Error", "Failed to fetch classes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchClasses();
  }, []);

  // Filter classes based on search
  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.class_code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Format schedule for display
  const formatSchedule = (schedule: ScheduleItem[]): string => {
    if (!schedule || schedule.length === 0) return "No schedule set";
    return schedule
      .map((item) => {
        return `${item.day} ${item.startTime}${item.startApm} - ${item.endTime}${item.endApm}`;
      })
      .join(", ");
  };

  // Get days until next class
  const getNextClassDate = (schedule: ScheduleItem[]) => {
    if (!schedule || schedule.length === 0) return null;

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const todayDay = daysOfWeek[today.getDay()];

    const todaySchedule = schedule.find((s) => s.day === todayDay);
    if (todaySchedule) return "Today";

    // Find the next class day
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const nextDay = daysOfWeek[nextDate.getDay()];
      const nextSchedule = schedule.find((s) => s.day === nextDay);
      if (nextSchedule) {
        if (i === 1) return "Tomorrow";
        return `In ${i} days`;
      }
    }
    return null;
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-blue-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-blue-600 mt-4 font-medium">
          Loading classes...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-50">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-6">
        <Text className="text-3xl font-bold text-white mb-2">My Classes</Text>
        <Text className="text-blue-100 text-base">
          Manage and organize your classes
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
            title="Pull to refresh"
            titleColor="#3B82F6"
          />
        }
      >
        {/* Search Bar */}
        <View className="px-4 mt-4 mb-4">
          <View className="flex-row items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-blue-100">
            <Ionicons name="search" size={20} color="#3B82F6" />
            <TextInput
              placeholder="Search by class name, subject, or code..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-gray-700"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Summary */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-600 text-sm font-medium">
                  Total Classes
                </Text>
                <Text className="text-3xl font-bold text-blue-600 mt-1">
                  {filteredClasses.length}
                </Text>
              </View>
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="school-outline" size={24} color="#3B82F6" />
              </View>
            </View>
            <View className="mt-3 pt-3 border-t border-blue-100">
              <Text className="text-gray-500 text-xs">
                {classes.length} total classes available
              </Text>
            </View>
          </View>
        </View>

        {/* Classes List */}
        <View className="px-4 mb-8">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((classItem) => {
              const nextClass = getNextClassDate(classItem.schedule);

              return (
                <View
                  key={classItem.id}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-blue-100"
                >
                  {/* Class Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 text-lg">
                        {classItem.name}
                      </Text>
                      <Text className="text-blue-600 text-sm font-medium mt-0.5">
                        {classItem.subject}
                      </Text>
                    </View>
                    <View className="bg-blue-100 rounded-lg px-3 py-1">
                      <Text className="text-blue-700 text-xs font-semibold">
                        {classItem.student_count} students
                      </Text>
                    </View>
                  </View>

                  {/* Class Details */}
                  <View className="gap-2 mb-3">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="school-outline"
                        size={14}
                        color="#6B7280"
                      />
                      <Text className="text-gray-600 text-xs ml-2">
                        {classItem.grade_level}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-xs ml-2 flex-1">
                        {formatSchedule(classItem.schedule)}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#6B7280"
                      />
                      <Text className="text-gray-600 text-xs ml-2">
                        Room {classItem.room}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons name="code-outline" size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-xs ml-2 font-mono">
                        Code: {classItem.class_code}
                      </Text>
                    </View>
                  </View>

                  {/* Next Class Badge */}
                  {nextClass && (
                    <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-blue-100">
                      <View className="flex-row items-center">
                        <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center">
                          <Ionicons name="calendar" size={12} color="#10B981" />
                        </View>
                        <Text className="text-green-700 text-xs ml-2 font-medium">
                          Next class: {nextClass}
                        </Text>
                      </View>
                      {/* Removed chevron icon since it's not clickable */}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-blue-100">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="school-outline" size={40} color="#3B82F6" />
              </View>
              <Text className="text-gray-700 text-lg font-semibold text-center">
                {searchQuery ? "No classes found" : "No classes yet"}
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-2">
                {searchQuery
                  ? "Try a different search term"
                  : "You haven't created any classes yet"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
