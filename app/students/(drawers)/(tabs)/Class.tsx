import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");

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

  // Get subject color based on subject name
  const getSubjectColor = (subject: string) => {
    const subjectColors: { [key: string]: string } = {
      Math: "#10B981",
      Mathematics: "#10B981",
      Science: "#3B82F6",
      English: "#8B5CF6",
      History: "#F59E0B",
      Art: "#EC4899",
      Music: "#06B6D4",
      PE: "#EF4444",
    };
    return subjectColors[subject] || "#10B981";
  };

  if (loading) {
    return (
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading your classes...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-emerald-50">
      {/* Header - Pear Deck Style */}
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
        {/* Decorative Circles */}
        <View className="absolute top-8 left-6 w-16 h-16 bg-emerald-400/30 rounded-full" />
        <View className="absolute top-20 right-10 w-24 h-24 bg-emerald-400/20 rounded-full" />
        <View className="absolute bottom-4 left-20 w-12 h-12 bg-emerald-300/40 rounded-full" />
        <View className="absolute top-14 right-32 w-8 h-8 bg-emerald-300/50 rounded-full" />

        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-1">
              My Classes
            </Text>
            <Text className="text-emerald-100 text-base">
              {classes.length} enrolled class{classes.length !== 1 ? "es" : ""}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white rounded-2xl px-5 py-3 flex-row items-center"
            onPress={openJoinModal}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Ionicons name="add-circle" size={22} color="#10B981" />
            <Text className="text-emerald-600 font-bold ml-2">Join Class</Text>
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
            colors={["#10B981"]}
            tintColor="#10B981"
          />
        }
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 32 }}
        ListEmptyComponent={
          <View className="items-center mt-8">
            {/* Decorative circles for empty state */}
            <View className="relative mb-8">
              <View
                className="w-32 h-32 bg-white rounded-full items-center justify-center"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 24,
                  elevation: 8,
                }}
              >
                <Ionicons name="school-outline" size={64} color="#10B981" />
              </View>
              <View className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-200 rounded-full opacity-60" />
              <View className="absolute -bottom-3 -left-3 w-16 h-16 bg-emerald-300 rounded-full opacity-40" />
              <View className="absolute top-8 -left-8 w-8 h-8 bg-emerald-400 rounded-full opacity-30" />
            </View>

            <Text className="text-gray-800 text-2xl font-bold text-center mb-2">
              No Classes Yet
            </Text>
            <Text className="text-gray-500 text-center mb-8 px-8 leading-5">
              Join a class using a class code from your teacher to get started!
            </Text>
            <TouchableOpacity
              className="bg-emerald-500 rounded-2xl py-4 px-8 flex-row items-center"
              onPress={openJoinModal}
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Ionicons name="enter-outline" size={22} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Join Your First Class
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const formattedSchedule = formatSchedule(item.schedule);
          const subjectColor = getSubjectColor(item.subject);

          return (
            <TouchableOpacity
              className="bg-white rounded-3xl p-6 mb-5 relative overflow-hidden"
              onPress={() => viewClassDetails(item)}
              style={{
                shadowColor: subjectColor,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 5,
              }}
            >
              {/* Decorative circles on card */}
              <View
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10"
                style={{ backgroundColor: subjectColor }}
              />
              <View
                className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
                style={{ backgroundColor: subjectColor }}
              />
              <View
                className="absolute top-12 right-16 w-6 h-6 rounded-full opacity-15"
                style={{ backgroundColor: subjectColor }}
              />

              {/* Header */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                      style={{
                        backgroundColor: `${subjectColor}20`,
                        shadowColor: subjectColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                    >
                      <Ionicons
                        name="book-outline"
                        size={24}
                        color={subjectColor}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 text-xl">
                        {item.name}
                      </Text>
                      <Text
                        className="text-sm font-semibold mt-0.5"
                        style={{ color: subjectColor }}
                      >
                        {item.subject} • {item.grade_level}
                      </Text>
                    </View>
                  </View>

                  {/* Teacher Info */}
                  {item.teacher && (
                    <View className="flex-row items-center ml-15">
                      <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                        <Ionicons
                          name="person-outline"
                          size={12}
                          color="#10B981"
                        />
                      </View>
                      <Text className="text-gray-500 text-sm">
                        {getTeacherName(item.teacher)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Class Code Badge */}
                <View
                  className="rounded-full px-4 py-2"
                  style={{ backgroundColor: `${subjectColor}15` }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: subjectColor }}
                  >
                    {item.class_code}
                  </Text>
                </View>
              </View>

              {/* Schedule and Room Info */}
              <View className="flex-row flex-wrap items-center gap-2 mb-4 ml-15">
                {formattedSchedule !== "No schedule set" && (
                  <View className="flex-row items-center bg-emerald-50 rounded-full px-4 py-2">
                    <View className="w-5 h-5 bg-emerald-200 rounded-full items-center justify-center mr-2">
                      <Ionicons name="time-outline" size={12} color="#10B981" />
                    </View>
                    <Text className="text-gray-600 text-xs font-medium">
                      {formattedSchedule}
                    </Text>
                  </View>
                )}
                {item.room && (
                  <View className="flex-row items-center bg-emerald-50 rounded-full px-4 py-2">
                    <View className="w-5 h-5 bg-emerald-200 rounded-full items-center justify-center mr-2">
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color="#10B981"
                      />
                    </View>
                    <Text className="text-gray-600 text-xs font-medium">
                      {item.room}
                    </Text>
                  </View>
                )}
              </View>

              {/* Description */}
              {item.description && (
                <Text className="text-gray-500 text-sm leading-5 mb-4 ml-15">
                  {item.description}
                </Text>
              )}

              {/* Status Badge */}
              <View className="flex-row justify-between items-center pt-3 border-t border-emerald-100 ml-15">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                    <View className="w-3 h-3 bg-emerald-500 rounded-full" />
                  </View>
                  <Text className="text-emerald-600 text-xs font-semibold">
                    Enrolled
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mr-1">
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-emerald-600 text-xs font-medium">
                    View Details
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Join Class Modal - Pear Deck Style */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeJoinModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View
            className="bg-white rounded-3xl p-8 w-full max-w-md relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.2,
              shadowRadius: 40,
              elevation: 15,
            }}
          >
            {/* Decorative circles on modal */}
            <View className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-200 rounded-full opacity-50" />
            <View className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-300 rounded-full opacity-30" />
            <View className="absolute top-20 right-8 w-8 h-8 bg-emerald-100 rounded-full opacity-60" />

            <View className="items-center mb-6">
              <View className="relative mb-4">
                <View
                  className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center"
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 5,
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={40}
                    color="#10B981"
                  />
                </View>
                <View className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
              </View>

              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Join Class
              </Text>
              <Text className="text-gray-600 text-center leading-5">
                Enter the class code provided by your teacher to join the class
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 text-sm mb-3 font-semibold ml-1">
                Class Code
              </Text>
              <TextInput
                value={classCode}
                onChangeText={setClassCode}
                placeholder="e.g., MATH101"
                className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50 text-lg"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                maxLength={10}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              />
            </View>

            <View className="bg-emerald-50 rounded-2xl p-4 mb-6 flex-row items-start">
              <View className="w-8 h-8 bg-emerald-200 rounded-full items-center justify-center mr-3 mt-0.5">
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#10B981"
                />
              </View>
              <View className="flex-1">
                <Text className="text-emerald-700 text-sm font-semibold mb-1">
                  Need help?
                </Text>
                <Text className="text-gray-600 text-xs leading-4">
                  The class code is usually 6-10 characters long and contains
                  letters and numbers. Ask your teacher if you don't have one.
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                onPress={closeJoinModal}
                disabled={submitting}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 px-4 rounded-2xl flex-row items-center justify-center ${
                  submitting || !classCode.trim()
                    ? "bg-emerald-300"
                    : "bg-emerald-500"
                }`}
                onPress={handleJoinClass}
                disabled={submitting || !classCode.trim()}
                style={
                  !submitting && classCode.trim()
                    ? {
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8,
                      }
                    : {}
                }
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">
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
