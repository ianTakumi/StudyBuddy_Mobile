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
  schedule: string;
  room: string;
  description: string;
  created_at: string;
  teacher?: {
    first_name: string;
    last_name: string;
    email: string;
  };
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
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Successfully joined class!");
        setShowJoinModal(false);
        setClassCode("");
        fetchStudentClasses(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Join class error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to join class. Please check the class code and try again."
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
    router.push({
      pathname: "/students/ClassDetails",
      params: {
        id: classItem.id,
        className: classItem.name,
        subject: classItem.subject, // Fixed: classItem instead of item
        gradeLevel: classItem.grade_level, // Fixed: classItem instead of item
        schedule: classItem.schedule, // Fixed: classItem instead of item
        room: classItem.room, // Fixed: classItem instead of item
        description: classItem.description, // Fixed: classItem instead of item
        classCode: classItem.class_code, // Fixed: classItem instead of item
        teacherName: classItem.teacher
          ? `${classItem.teacher.first_name} ${classItem.teacher.last_name}`
          : "Unknown Teacher", // Fixed: classItem instead of item
      },
    });
  };

  // Helper function to get full teacher name
  const getTeacherName = (
    teacher: { first_name: string; last_name: string } | undefined
  ) => {
    if (!teacher) return "Unknown Teacher";
    return `${teacher.first_name} ${teacher.last_name}`.trim();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-gray-600 mt-4">Loading your classes...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-16 pb-6 px-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-gray-900">My Classes</Text>
            <Text className="text-gray-600 mt-1">
              {classes.length} enrolled class{classes.length !== 1 ? "es" : ""}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-green-500 rounded-xl px-4 py-3 flex-row items-center"
            onPress={openJoinModal}
          >
            <Ionicons name="add" size={20} color="white" />
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
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
        className="flex-1"
        contentContainerClassName="p-4"
        ListEmptyComponent={
          <View className="bg-white rounded-2xl p-8 items-center mt-8 shadow-sm border border-gray-100">
            <Ionicons name="school-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg font-semibold mt-4 text-center">
              No Classes Yet
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Join a class using a class code from your teacher
            </Text>
            <TouchableOpacity
              className="bg-green-500 rounded-xl py-3 px-6 flex-row items-center mt-4"
              onPress={openJoinModal}
            >
              <Ionicons name="enter-outline" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">
                Join Your First Class
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 active:bg-gray-50"
            onPress={() => viewClassDetails(item)}
          >
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-lg">
                  {item.name}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {item.subject} • {item.grade_level}
                </Text>
                {item.teacher && (
                  <Text className="text-gray-500 text-sm mt-1">
                    Teacher: {getTeacherName(item.teacher)}
                  </Text>
                )}
              </View>
              <View className="bg-indigo-100 rounded-lg px-2 py-1">
                <Text className="text-indigo-700 text-xs font-semibold">
                  {item.class_code}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                {item.schedule && (
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {item.schedule}
                    </Text>
                  </View>
                )}
                {item.room && (
                  <View className="flex-row items-center">
                    <Ionicons
                      name="business-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text className="text-gray-600 text-xs ml-1">
                      {item.room}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-center">
                <Text className="text-green-600 text-xs font-medium bg-green-100 rounded-lg px-2 py-1">
                  Enrolled
                </Text>
              </View>
            </View>

            {item.description && (
              <Text className="text-gray-500 text-sm mt-3 leading-5">
                {item.description}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Join Class Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeJoinModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-gray-900">
                Join Class
              </Text>
              <TouchableOpacity onPress={closeJoinModal}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 mb-2">
              Enter the class code provided by your teacher
            </Text>

            <TextInput
              value={classCode}
              onChangeText={setClassCode}
              placeholder="Enter class code (e.g., MATH101)"
              className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white mb-4"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={10}
            />

            <Text className="text-gray-500 text-sm mb-6">
              The class code is usually 6 characters long and contains letters
              and numbers
            </Text>

            <View className="flex-row space-x-3">
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
                className="flex-1 py-3 px-4 bg-green-500 rounded-xl disabled:bg-green-300"
                onPress={handleJoinClass}
                disabled={submitting || !classCode.trim()}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-medium text-center">
                    Join Class
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
