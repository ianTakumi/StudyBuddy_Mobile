import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useGlobalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

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

  const fetchStudents = async () => {
    if (!classId) {
      Alert.alert("Error", "Class ID not found");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const paramsClassInfo = buildClassInfoFromParams();
      setClassInfo(paramsClassInfo);
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
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading students...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-emerald-50">
      {/* Header */}
      <View
        className="w-full pt-16 pb-6 px-6 bg-emerald-500"
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

        <View className="mb-4">
          <Text className="text-3xl font-bold text-white">
            {classInfo?.name || "Class"}
          </Text>
          <Text className="text-emerald-100 text-base mt-1">
            {classInfo?.subject} • {classInfo?.gradeLevel} • {students.length}{" "}
            students
          </Text>
          {(classInfo?.room || classInfo?.schedule) && (
            <View className="flex-row items-center mt-2 gap-3">
              {classInfo?.room && (
                <View className="flex-row items-center">
                  <View className="w-5 h-5 bg-white/20 rounded-full items-center justify-center mr-1.5">
                    <Ionicons name="location-outline" size={11} color="white" />
                  </View>
                  <Text className="text-emerald-100 text-sm">
                    Room {classInfo.room}
                  </Text>
                </View>
              )}
              {classInfo?.schedule && (
                <View className="flex-row items-center">
                  <View className="w-5 h-5 bg-white/20 rounded-full items-center justify-center mr-1.5">
                    <Ionicons name="time-outline" size={11} color="white" />
                  </View>
                  <Text className="text-emerald-100 text-sm">
                    {formatSchedule(classInfo.schedule)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Class Code Card */}
        <View className="bg-white/20 rounded-2xl p-5">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-white text-sm font-medium opacity-80">
                Class Code
              </Text>
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
                  className="bg-white/20 rounded-full w-8 h-8 items-center justify-center"
                >
                  <Ionicons
                    name={showClassCode ? "eye-off-outline" : "eye-outline"}
                    size={16}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-white/70 text-xs mt-2">
                Share this code with students to join your class
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(classInfo?.class_code || "")}
              className="bg-white rounded-2xl px-4 py-3 ml-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Ionicons name="copy-outline" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Students List */}
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
            titleColor="#6B7280"
          />
        }
      >
        <View className="p-4">
          {/* Stats Card */}
          <View className="mb-6">
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

              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="people-outline" size={20} color="#10B981" />
                </View>
                <Text className="text-gray-500 text-sm font-medium">
                  Total Students
                </Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900 ml-13">
                {students.length}
              </Text>
              <Text className="text-gray-400 text-xs mt-1 ml-13">
                Enrolled in class
              </Text>
            </View>
          </View>

          {/* Students List */}
          <View
            className="bg-white rounded-3xl overflow-hidden relative"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full opacity-70" />

            <View className="px-5 py-4 border-b border-emerald-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
                  <Ionicons name="people-outline" size={16} color="#10B981" />
                </View>
                <Text className="font-bold text-gray-900 text-lg">
                  Students ({students.length})
                </Text>
              </View>
            </View>

            {students.length === 0 ? (
              <View className="p-8 items-center">
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
                  <Ionicons name="people-outline" size={36} color="#10B981" />
                </View>
                <Text className="text-gray-800 text-lg font-bold">
                  No students yet
                </Text>
                <Text className="text-gray-500 text-center mt-2 text-sm">
                  Share your class code with students to get started
                </Text>
                <TouchableOpacity
                  className="bg-emerald-500 rounded-2xl py-4 px-8 flex-row items-center mt-4"
                  onPress={() => copyToClipboard(classInfo?.class_code || "")}
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={18}
                    color="white"
                  />
                  <Text className="text-white font-bold ml-2">
                    Share Class Code
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              students.map((student, index) => (
                <View
                  key={student.id}
                  className={`flex-row items-center justify-between px-5 py-4 ${
                    index !== students.length - 1
                      ? "border-b border-emerald-100"
                      : ""
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="bg-emerald-100 rounded-full w-11 h-11 items-center justify-center mr-3">
                      <Text className="text-emerald-600 font-bold text-base">
                        {student.first_name?.[0]}
                        {student.last_name?.[0]}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 text-base">
                        {student.first_name} {student.last_name}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-0.5">
                        {student.email}
                      </Text>
                      {student.student_id && (
                        <Text className="text-gray-400 text-xs mt-0.5">
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
                    className="w-9 h-9 bg-emerald-50 rounded-full items-center justify-center"
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={16}
                      color="#10B981"
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
