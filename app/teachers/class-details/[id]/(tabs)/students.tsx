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

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id?: string;
  status?: string;
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
  schedule?: string;
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

  // Build class info from globalParams
  const buildClassInfoFromParams = () => {
    if (!globalParams.id) return null;

    return {
      id: globalParams.id as string,
      name: (globalParams.className as string) || "Class",
      class_code: (globalParams.class_code as string) || "ABC123", // Fallback if no class_code
      subject: (globalParams.subject as string) || "Subject",
      student_count: parseInt(globalParams.studentCount as string) || 0,
      description: globalParams.description as string,
      gradeLevel: globalParams.gradeLevel as string,
      room: globalParams.room as string,
      schedule: globalParams.schedule as string,
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
        `/classes/${user.id}/${classId}/students`
      );
      if (studentsResponse.data.success) {
        setStudents(studentsResponse.data.data);
      } else {
        // Fallback sample data if API fails
        setStudents([
          {
            id: "1",
            name: "Juan Dela Cruz",
            email: "juan@email.com",
            student_id: "20230001",
            status: "active",
          },
          {
            id: "2",
            name: "Maria Santos",
            email: "maria@email.com",
            student_id: "20230002",
            status: "active",
          },
          {
            id: "3",
            name: "Pedro Reyes",
            email: "pedro@email.com",
            student_id: "20230003",
            status: "active",
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);

      // Fallback sample data if API completely fails
      setStudents([
        {
          id: "1",
          name: "Juan Dela Cruz",
          email: "juan@email.com",
          student_id: "20230001",
          status: "active",
        },
        {
          id: "2",
          name: "Maria Santos",
          email: "maria@email.com",
          student_id: "20230002",
          status: "active",
        },
      ]);

      Alert.alert("Info", "Using sample data. Check your API connection.");
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

  const copyToClipboard = (text: string) => {
    // For React Native, you can use @react-native-clipboard/clipboard
    // For web: navigator.clipboard.writeText(text);
    Alert.alert("Copied!", "Class code copied to clipboard");
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
                `/classes/${classId}/students/${studentId}`
              );
              if (response.data.success) {
                setStudents(
                  students.filter((student) => student.id !== studentId)
                );
                Alert.alert("Success", "Student removed successfully");
              }
            } catch (error) {
              console.error("Error removing student:", error);
              Alert.alert("Error", "Failed to remove student");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-gray-600 mt-4">Loading students...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
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
              {classInfo?.schedule}
            </Text>
          )}
        </View>

        {/* Class Code Card */}
        <View className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-white text-sm font-medium">Class Code</Text>
              <View className="flex-row items-center mt-1">
                {showClassCode ? (
                  <Text className="text-black text-2xl font-bold mr-3">
                    {classInfo?.class_code}
                  </Text>
                ) : (
                  <Text className="text-black text-2xl font-bold mr-3">
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
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-black/80 text-xs mt-2">
                Share this code with students to join your class
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(classInfo?.class_code)}
              className="bg-white rounded-xl px-4 py-3 ml-4"
            >
              <Ionicons name="copy-outline" size={20} color="#6366F1" />
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
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
      >
        <View className="p-4">
          {/* Stats */}
          <View className="flex-row justify-between mb-6">
            <View className="bg-white rounded-2xl p-4 flex-1 mr-2 shadow-sm border border-gray-100">
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
            <View className="bg-white rounded-2xl p-4 flex-1 ml-2 shadow-sm border border-gray-100">
              <Text className="text-gray-600 text-sm font-medium">Active</Text>
              <Text className="text-2xl font-bold text-green-600 mt-1">
                {students.length}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                All students active
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
                  className="bg-indigo-500 rounded-xl py-3 px-6 flex-row items-center mt-4"
                  onPress={() =>
                    Alert.alert("Share Class", "Share class code with students")
                  }
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
                    <View className="bg-indigo-100 rounded-xl w-10 h-10 items-center justify-center mr-3">
                      <Ionicons name="person" size={20} color="#6366F1" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 text-base">
                        {student.first_name + " " + student.last_name}
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

                  <View className="flex-row items-center space-x-2">
                    <View className="bg-green-100 rounded-lg px-2 py-1">
                      <Text className="text-green-700 text-xs font-medium">
                        Active
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeStudent(student.id, student.name)}
                      className="p-2"
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={16}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Quick Actions */}
          {/* <View className="mt-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="font-bold text-gray-900 text-lg mb-3">
              Quick Actions
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="bg-indigo-50 flex-1 rounded-xl p-3 flex-row items-center justify-center"
                onPress={() =>
                  Alert.alert(
                    "Email All",
                    "This will email all students in the class"
                  )
                }
              >
                <Ionicons name="mail-outline" size={18} color="#6366F1" />
                <Text className="text-indigo-600 font-medium ml-2">
                  Email All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-50 flex-1 rounded-xl p-3 flex-row items-center justify-center"
                onPress={() =>
                  Alert.alert("Export List", "Export student list as CSV")
                }
              >
                <Ionicons name="download-outline" size={18} color="#10B981" />
                <Text className="text-green-600 font-medium ml-2">
                  Export List
                </Text>
              </TouchableOpacity>
            </View>
          </View> */}
        </View>
      </ScrollView>

      {/* Add Student FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-indigo-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        onPress={() => Alert.alert("Add Student", "Feature coming soon!")}
      >
        <Ionicons name="person-add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
