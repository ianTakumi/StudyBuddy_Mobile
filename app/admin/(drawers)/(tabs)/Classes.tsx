import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.class_code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatSchedule = (schedule: ScheduleItem[]): string => {
    if (!schedule || schedule.length === 0) return "No schedule set";
    return schedule
      .map((item) => {
        return `${item.day} ${item.startTime}${item.startApm} - ${item.endTime}${item.endApm}`;
      })
      .join(", ");
  };

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
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading classes...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-emerald-50">
      {/* Header */}
      <View
        className="w-full pt-16 pb-8 px-6 bg-emerald-500"
        style={{
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <View className="absolute top-8 left-6 w-16 h-16 bg-emerald-400/30 rounded-full" />
        <View className="absolute top-20 right-10 w-24 h-24 bg-emerald-400/20 rounded-full" />
        <View className="absolute bottom-4 left-20 w-12 h-12 bg-emerald-300/40 rounded-full" />

        <Text className="text-3xl font-bold text-white mb-2">My Classes</Text>
        <Text className="text-emerald-100 text-base">
          Manage and organize your classes
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
            title="Pull to refresh"
            titleColor="#10B981"
          />
        }
      >
        {/* Search Bar */}
        <View className="px-4 mt-6 mb-4">
          <View
            className="flex-row items-center bg-white rounded-2xl px-5 py-4"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Ionicons name="search" size={20} color="#10B981" />
            <TextInput
              placeholder="Search by class name, subject, or code..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-700"
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
          <View
            className="bg-white rounded-3xl p-5 relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />
            <View className="absolute -bottom-3 -left-3 w-12 h-12 bg-emerald-50 rounded-full opacity-70" />

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 text-sm font-medium">
                  Total Classes
                </Text>
                <Text className="text-3xl font-bold text-emerald-600 mt-1">
                  {filteredClasses.length}
                </Text>
              </View>
              <View
                className="w-14 h-14 bg-emerald-100 rounded-full items-center justify-center"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Ionicons name="school-outline" size={26} color="#10B981" />
              </View>
            </View>
            <View className="mt-4 pt-4 border-t border-emerald-100">
              <Text className="text-gray-400 text-xs">
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
                  className="bg-white rounded-3xl p-5 mb-4 relative overflow-hidden"
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    elevation: 5,
                  }}
                >
                  <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full opacity-70" />
                  <View className="absolute -bottom-3 -left-3 w-12 h-12 bg-emerald-50 rounded-full opacity-70" />

                  {/* Class Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                          <Ionicons
                            name="book-outline"
                            size={20}
                            color="#10B981"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="font-bold text-gray-900 text-lg">
                            {classItem.name}
                          </Text>
                          <Text className="text-emerald-600 text-sm font-medium mt-0.5">
                            {classItem.subject}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="bg-emerald-100 rounded-full px-3 py-1">
                      <Text className="text-emerald-700 text-xs font-bold">
                        {classItem.student_count} students
                      </Text>
                    </View>
                  </View>

                  {/* Class Details */}
                  <View className="gap-2 mb-3 ml-13">
                    <View className="flex-row items-center">
                      <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                        <Ionicons
                          name="school-outline"
                          size={10}
                          color="#10B981"
                        />
                      </View>
                      <Text className="text-gray-600 text-xs">
                        {classItem.grade_level}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                        <Ionicons
                          name="time-outline"
                          size={10}
                          color="#10B981"
                        />
                      </View>
                      <Text className="text-gray-600 text-xs flex-1">
                        {formatSchedule(classItem.schedule)}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                        <Ionicons
                          name="location-outline"
                          size={10}
                          color="#10B981"
                        />
                      </View>
                      <Text className="text-gray-600 text-xs">
                        Room {classItem.room}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                        <Ionicons
                          name="key-outline"
                          size={10}
                          color="#10B981"
                        />
                      </View>
                      <Text className="text-gray-600 text-xs font-mono">
                        Code: {classItem.class_code}
                      </Text>
                    </View>
                  </View>

                  {/* Next Class Badge */}
                  {nextClass && (
                    <View className="flex-row items-center mt-3 pt-3 border-t border-emerald-100 ml-13">
                      <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mr-2">
                        <Ionicons name="calendar" size={12} color="#10B981" />
                      </View>
                      <Text className="text-emerald-700 text-xs font-semibold">
                        Next class: {nextClass}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View
              className="bg-white rounded-3xl p-8 items-center relative overflow-hidden"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <View className="absolute -top-8 -right-8 w-20 h-20 bg-emerald-50 rounded-full" />
              <View className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-50 rounded-full" />

              <View
                className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Ionicons name="school-outline" size={36} color="#10B981" />
              </View>
              <Text className="text-gray-800 text-lg font-bold text-center">
                {searchQuery ? "No classes found" : "No classes yet"}
              </Text>
              <Text className="text-gray-500 text-center text-sm mt-2">
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
