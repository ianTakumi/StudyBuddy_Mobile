import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

interface Class {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  class_code: string;
  teacher_id: string;
  schedule: ScheduleItem[] | string;
  room: string;
  description: string;
  created_at: string;
  enrolled_at?: string;
  teacher?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface ScheduleItem {
  day: string;
  startTime: string;
  startApm: "AM" | "PM";
  endTime: string;
  endApm: "AM" | "PM";
}

export default function StudentClasses() {
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Parse schedule - handles both string and object/array formats
  const getScheduleArray = (
    schedule: ScheduleItem[] | string,
  ): ScheduleItem[] => {
    try {
      if (Array.isArray(schedule)) {
        return schedule;
      }
      if (
        typeof schedule === "string" &&
        schedule &&
        schedule !== "undefined" &&
        schedule !== ""
      ) {
        const parsed = JSON.parse(schedule);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.error("Error parsing schedule:", error);
      return [];
    }
  };

  // Helper function to format schedule for display
  const formatSchedule = (schedule: ScheduleItem[] | string): string => {
    const scheduleArray = getScheduleArray(schedule);
    if (!scheduleArray || scheduleArray.length === 0) {
      return "No schedule set";
    }
    return scheduleArray
      .map((item) => {
        return `${item.day} ${item.startTime}${item.startApm} - ${item.endTime}${item.endApm}`;
      })
      .join(", ");
  };

  // Fetch student's classes
  const fetchStudentClasses = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await client.get(`/classes/students/${user.id}/classes`);

      if (response.data.success) {
        setClasses(response.data.data);
      } else {
        setClasses([]);
      }
    } catch (error: any) {
      console.error("Error fetching classes:", error);
      Alert.alert("Info", "Using sample data. Check your API connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudentClasses();
  };

  useEffect(() => {
    fetchStudentClasses();
  }, [user?.id]);

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      Alert.alert("Error", "Please enter a class code");
      return;
    }

    try {
      setSubmitting(true);
      const response = await client.post(
        `/classes/students/${user.id}/join-class`,
        {
          classCode: classCode.trim().toUpperCase(),
        },
      );

      if (response.data.success) {
        Alert.alert("Success", "Successfully joined class!");
        setShowJoinModal(false);
        setClassCode("");
        fetchStudentClasses();
      }
    } catch (error: any) {
      console.error("Join class error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to join class. Please check the class code and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openJoinModal = () => {
    setShowJoinModal(true);
    setClassCode("");
  };

  const closeJoinModal = () => {
    setShowJoinModal(false);
    setClassCode("");
    setSubmitting(false);
  };

  const viewClassDetails = (classItem: Class) => {
    const scheduleParam = Array.isArray(classItem.schedule)
      ? JSON.stringify(classItem.schedule)
      : classItem.schedule;

    router.push({
      pathname: "/students/ClassDetails",
      params: {
        id: classItem.id,
        className: classItem.name,
        subject: classItem.subject,
        gradeLevel: classItem.grade_level,
        schedule: scheduleParam,
        room: classItem.room,
        description: classItem.description,
        classCode: classItem.class_code,
        teacherName: classItem.teacher
          ? `${classItem.teacher.first_name} ${classItem.teacher.last_name}`.trim()
          : "Unknown Teacher",
      },
    });
  };

  const getTeacherName = (
    teacher: { first_name: string; last_name: string } | undefined,
  ) => {
    if (!teacher) return "Unknown Teacher";
    return `${teacher.first_name} ${teacher.last_name}`.trim();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-blue-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-blue-600 mt-4">Loading your classes...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-50">
      {/* Header - Blue themed */}
      <View className="bg-blue-500 pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white mb-1">
              My Classes
            </Text>
            <Text className="text-blue-100">
              {classes.length} enrolled class{classes.length !== 1 ? "es" : ""}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white/20 rounded-xl px-4 py-3 flex-row items-center"
            onPress={openJoinModal}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Join Class</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Classes List */}
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        ListEmptyComponent={
          <View className="bg-white rounded-2xl p-8 items-center mt-8 shadow-lg border border-blue-100">
            <View className="bg-blue-100 rounded-full p-6 mb-4">
              <Ionicons name="school-outline" size={64} color="#3B82F6" />
            </View>
            <Text className="text-gray-800 text-xl font-bold mt-4 text-center">
              No Classes Yet
            </Text>
            <Text className="text-gray-500 text-center mt-2 mb-6">
              Join a class using a class code from your teacher
            </Text>
            <TouchableOpacity
              className="bg-blue-500 rounded-xl py-3 px-6 flex-row items-center shadow-md"
              onPress={openJoinModal}
            >
              <Ionicons name="enter-outline" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Join Your First Class
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const formattedSchedule = formatSchedule(item.schedule);

          return (
            <TouchableOpacity
              className="bg-white rounded-2xl p-6 mb-4 shadow-lg border border-blue-100 active:bg-blue-50"
              onPress={() => viewClassDetails(item)}
            >
              {/* Header */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View className="bg-blue-100 rounded-lg p-2 mr-3">
                      <Ionicons name="book-outline" size={20} color="#3B82F6" />
                    </View>
                    <Text className="font-bold text-gray-900 text-xl">
                      {item.name}
                    </Text>
                  </View>
                  <Text className="text-blue-600 text-sm font-medium mb-2">
                    {item.subject} • {item.grade_level}
                  </Text>

                  {/* Teacher Info */}
                  {item.teacher && (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="person-outline"
                        size={14}
                        color="#6B7280"
                      />
                      <Text className="text-gray-500 text-sm ml-1">
                        {getTeacherName(item.teacher)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Class Code Badge */}
                <View className="bg-blue-100 rounded-lg px-3 py-1">
                  <Text className="text-blue-700 text-xs font-bold">
                    {item.class_code}
                  </Text>
                </View>
              </View>

              {/* Schedule and Room Info */}
              <View className="flex-row flex-wrap items-center gap-3 mb-4">
                {formattedSchedule !== "No schedule set" && (
                  <View className="flex-row items-center bg-blue-50 rounded-lg px-3 py-2">
                    <Ionicons name="time-outline" size={16} color="#3B82F6" />
                    <Text className="text-gray-600 text-sm ml-2">
                      {formattedSchedule}
                    </Text>
                  </View>
                )}
                {item.room && (
                  <View className="flex-row items-center bg-blue-50 rounded-lg px-3 py-2">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#3B82F6"
                    />
                    <Text className="text-gray-600 text-sm ml-2">
                      {item.room}
                    </Text>
                  </View>
                )}
              </View>

              {/* Description */}
              {item.description && (
                <Text className="text-gray-500 text-sm leading-5 mb-4">
                  {item.description}
                </Text>
              )}

              {/* Status Badge */}
              <View className="flex-row justify-between items-center pt-2 border-t border-blue-100">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="text-green-600 text-xs ml-1 font-medium">
                    Enrolled
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  <Text className="text-blue-500 text-xs ml-1">
                    View Details
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Join Class Modal - Blue themed */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeJoinModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 max-w-md shadow-xl">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="add-circle-outline" size={32} color="#3B82F6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Join Class
              </Text>
              <Text className="text-gray-600 text-center">
                Enter the class code provided by your teacher to join the class
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 text-sm mb-2 font-medium">
                Class Code
              </Text>
              <TextInput
                value={classCode}
                onChangeText={setClassCode}
                placeholder="e.g., MATH101"
                className="border border-blue-200 rounded-xl px-4 py-3 text-gray-900 bg-blue-50"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                maxLength={10}
              />
            </View>

            <View className="bg-blue-50 rounded-xl p-3 mb-6">
              <View className="flex-row items-center mb-1">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#3B82F6"
                />
                <Text className="text-blue-700 text-xs font-medium ml-1">
                  Need help?
                </Text>
              </View>
              <Text className="text-gray-600 text-xs">
                The class code is usually 6-10 characters long and contains
                letters and numbers. Ask your teacher if you don't have one.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                onPress={closeJoinModal}
                disabled={submitting}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center ${
                  submitting || !classCode.trim()
                    ? "bg-blue-300"
                    : "bg-blue-500"
                }`}
                onPress={handleJoinClass}
                disabled={submitting || !classCode.trim()}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={18} color="white" />
                    <Text className="text-white font-medium text-center ml-2">
                      Join Class
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
