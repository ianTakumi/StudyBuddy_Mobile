import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";
import * as Clipboard from "expo-clipboard";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id?: string;
  status?: string;
}

interface ScheduleItem {
  day: string;
  startTime: string;
  startApm: "AM" | "PM";
  endTime: string;
  endApm: "AM" | "PM";
}

interface ClassInfo {
  id: string;
  name: string;
  class_code: string;
  subject: string;
  student_count: number;
  description?: string;
  gradeLevel?: string;
  room?: string;
  schedule?: ScheduleItem[];
}

export default function Students() {
  const globalParams = useGlobalSearchParams();
  console.log("📱 Global Params:", globalParams);

  const classId = globalParams.id;
  const user = useSelector((state: any) => state.auth.user);

  const [students, setStudents] = useState<Student[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showClassCode, setShowClassCode] = useState(false);

  const parseSchedule = (scheduleStr: string): ScheduleItem[] => {
    try {
      if (scheduleStr && scheduleStr !== "undefined") {
        const parsed = JSON.parse(scheduleStr);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.error("Error parsing schedule:", error);
      return [];
    }
  };

  const formatSchedule = (schedule: ScheduleItem[]): string => {
    if (!schedule || schedule.length === 0) return "No schedule set";
    return schedule
      .map(
        (item) =>
          `${item.day} ${item.startTime}${item.startApm} - ${item.endTime}${item.endApm}`,
      )
      .join(", ");
  };

  const buildClassInfoFromParams = () => {
    if (!globalParams.id) return null;

    return {
      id: globalParams.id as string,
      name: (globalParams.className as string) || "Class",
      class_code: (globalParams.class_code as string) || "ABC123",
      subject: (globalParams.subject as string) || "Subject",
      student_count: parseInt(globalParams.studentCount as string) || 0,
      description: globalParams.description as string,
      gradeLevel: globalParams.gradeLevel as string,
      room: globalParams.room as string,
      schedule: parseSchedule(globalParams.schedule as string),
    };
  };

  // Fetch students data
  const fetchStudents = async () => {
    if (!classId) {
      Alert.alert("Error", "Class ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Set class info from globalParams first
      const paramsClassInfo = buildClassInfoFromParams();
      setClassInfo(paramsClassInfo);

      // Fetch students from API
      const studentsResponse = await client.get(
        `/classes/${user.id}/${classId}/students`,
      );
      if (studentsResponse.data.success) {
        setStudents(studentsResponse.data.data);
      } else {
        setStudents([]);
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("Copied!", "Class code copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "Failed to copy class code");
    }
  };

  const removeStudent = async (studentId: string, studentName: string) => {
    Alert.alert(
      "Remove Student",
      `Are you sure you want to remove ${studentName} from this class?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await client.delete(
                `/classes/${classId}/students/${studentId}`,
              );
              if (response.data.success) {
                setStudents(
                  students.filter((student) => student.id !== studentId),
                );
                Alert.alert("Success", "Student removed successfully");
              }
            } catch (error) {
              console.error("Error removing student:", error);
              Alert.alert("Error", "Failed to remove student");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading students...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header - Always visible with class code card */}
      <View className="bg-white pt-16 pb-6 px-6 border-b border-gray-200">
        <View className="mb-4">
          <Text className="text-3xl font-bold text-gray-900">
            {classInfo?.name || "Class"}
          </Text>
          <Text className="text-gray-600 mt-1">
            {classInfo?.subject} • {classInfo?.gradeLevel} • {students.length}{" "}
            students
          </Text>
          {(classInfo?.room || classInfo?.schedule) && (
            <Text className="text-gray-500 text-sm mt-1">
              {classInfo?.room && `Room ${classInfo.room}`}
              {classInfo?.room && classInfo?.schedule && " • "}
              {classInfo?.schedule && formatSchedule(classInfo.schedule)}
            </Text>
          )}
        </View>

        {/* Class Code Card - Blue themed, no gradient */}
        <View className="bg-blue-500 rounded-2xl p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-white text-sm font-medium">Class Code</Text>
              <View className="flex-row items-center mt-1">
                {showClassCode ? (
                  <Text className="text-white text-2xl font-bold mr-3">
                    {classInfo?.class_code}
                  </Text>
                ) : (
                  <Text className="text-white text-2xl font-bold mr-3">
                    ••••••
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => setShowClassCode(!showClassCode)}
                  className="bg-white/20 rounded-lg px-2 py-1"
                >
                  <Ionicons
                    name={showClassCode ? "eye-off-outline" : "eye-outline"}
                    size={16}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-white/80 text-xs mt-2">
                Share this code with students to join your class
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(classInfo?.class_code || "")}
              className="bg-white rounded-xl px-4 py-3 ml-4"
            >
              <Ionicons name="copy-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Students List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
      >
        <View className="p-4">
          {/* Stats - Removed Active stats */}
          <View className="mb-6">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <Text className="text-gray-600 text-sm font-medium">
                Total Students
              </Text>
              <Text className="text-2xl font-bold text-gray-900 mt-1">
                {students.length}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                Enrolled in class
              </Text>
            </View>
          </View>

          {/* Students List */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="px-4 py-3 border-b border-gray-100">
              <Text className="font-bold text-gray-900 text-lg">
                Students ({students.length})
              </Text>
            </View>

            {students.length === 0 ? (
              <View className="p-8 items-center">
                <Ionicons name="people-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg font-semibold mt-4">
                  No students yet
                </Text>
                <Text className="text-gray-400 text-center mt-2">
                  Share your class code with students to get started
                </Text>
                <TouchableOpacity
                  className="bg-blue-500 rounded-xl py-3 px-6 flex-row items-center mt-4"
                  onPress={() => copyToClipboard(classInfo?.class_code || "")}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={18}
                    color="white"
                  />
                  <Text className="text-white font-semibold ml-2">
                    Share Class Code
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              students.map((student, index) => (
                <View
                  key={student.id}
                  className={`flex-row items-center justify-between px-4 py-3 ${
                    index !== students.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="bg-blue-100 rounded-xl w-10 h-10 items-center justify-center mr-3">
                      <Ionicons name="person" size={20} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 text-base">
                        {student.first_name} {student.last_name}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        {student.email}
                      </Text>
                      {student.student_id && (
                        <Text className="text-gray-400 text-xs mt-1">
                          ID: {student.student_id}
                        </Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      removeStudent(
                        student.id,
                        `${student.first_name} ${student.last_name}`,
                      )
                    }
                    className="p-2"
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={16}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
