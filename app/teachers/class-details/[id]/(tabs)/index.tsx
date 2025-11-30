import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

export default function ClassInfo() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: params.className || "",
    subject: params.subject || "",
    gradeLevel: params.gradeLevel || "",
    schedule: params.schedule || "",
    room: params.room || "",
    description: params.description || "",
  });

  const handleEditClass = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!formData.name || !formData.subject || !formData.gradeLevel) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await client.put(
        `/classes/${user?.id}/${params.id}`,
        formData
      );

      if (response.data.success) {
        Alert.alert("Success", "Class updated successfully!");
        setShowEditModal(false);

        router.setParams({
          ...params,
          className: formData.name,
          subject: formData.subject,
          gradeLevel: formData.gradeLevel,
          schedule: formData.schedule,
          room: formData.room,
          description: formData.description,
        });
      }
    } catch (error) {
      console.error("Error updating class:", error);
      Alert.alert("Error", "Failed to update class");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = () => {
    Alert.alert(
      "Delete Class",
      `Are you sure you want to delete "${params.className}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("Delete class:", params.id);
            Alert.alert("Success", "Class deleted successfully!");
            router.back();
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        {/* Header Section */}
        <View className="bg-gradient-to-r from-indigo-500 to-purple-600 pt-16 pb-6 px-6">
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-black mb-2">
                {params.className}
              </Text>
              <Text className="text-indigo-400 text-lg font-medium">
                {params.subject}
              </Text>
            </View>
            <View className="bg-white/20 rounded-xl px-3 py-2">
              <Text className="text-white font-bold text-sm">
                {params.studentCount} students
              </Text>
            </View>
          </View>

          {/* Edit & Delete Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-row items-center bg-blue-300 rounded-xl px-4 py-3 flex-1"
              onPress={handleEditClass}
            >
              <Ionicons name="create-outline" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Edit Class</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-red-500/80 rounded-xl px-4 py-3 flex-1"
              onPress={handleDeleteClass}
            >
              <Ionicons name="trash-outline" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Class Details Grid */}
        <View className="px-6 mt-6">
          <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            {/* Basic Info Section */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Class Information
              </Text>

              <View className="space-y-4">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-indigo-100 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="school-outline" size={24} color="#6366F1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 text-sm font-medium">
                      Grade Level
                    </Text>
                    <Text className="text-gray-900 font-semibold text-base">
                      {params.gradeLevel}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-purple-100 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="time-outline" size={24} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 text-sm font-medium">
                      Schedule
                    </Text>
                    <Text className="text-gray-900 font-semibold text-base">
                      {params.schedule}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-cyan-100 rounded-xl items-center justify-center mr-4">
                    <Ionicons
                      name="location-outline"
                      size={24}
                      color="#06B6D4"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 text-sm font-medium">
                      Room
                    </Text>
                    <Text className="text-gray-900 font-semibold text-base">
                      {params.room}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Description Section */}
            {params.description && (
              <View>
                <Text className="text-xl font-bold text-gray-900 mb-3">
                  Description
                </Text>
                <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <Text className="text-gray-800 leading-6">
                    {params.description}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap justify-between -mx-1">
            <TouchableOpacity
              className="w-[48%] px-1 mb-3"
              onPress={() =>
                router.push(`/teachers/class-details/${params.id}/quizzes`)
              }
            >
              <View className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 items-center">
                <View className="w-12 h-12 bg-amber-100 rounded-xl items-center justify-center mb-3">
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color="#F59E0B"
                  />
                </View>
                <Text className="text-gray-900 font-bold text-center text-sm">
                  Manage Quizzes
                </Text>
                <Text className="text-gray-600 text-xs text-center mt-1">
                  Create & grade quizzes
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] px-1 mb-3"
              onPress={() =>
                router.push(`/teachers/class-details/${params.id}/assignments`)
              }
            >
              <View className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="create-outline" size={24} color="#3B82F6" />
                </View>
                <Text className="text-gray-900 font-bold text-center text-sm">
                  Manage Assignments
                </Text>
                <Text className="text-gray-600 text-xs text-center mt-1">
                  Assign & review work
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-6 mt-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Class Overview
          </Text>
          <View className="flex-row flex-wrap justify-between -mx-1">
            <View className="w-[48%] px-1 mb-3">
              <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                <View className="w-10 h-10 bg-amber-100 rounded-lg items-center justify-center mb-2">
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#F59E0B"
                  />
                </View>
                <Text className="text-2xl font-bold text-gray-900">3</Text>
                <Text className="text-gray-600 text-sm font-medium">
                  Active Quizzes
                </Text>
              </View>
            </View>

            <View className="w-[48%] px-1 mb-3">
              <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mb-2">
                  <Ionicons name="create-outline" size={20} color="#3B82F6" />
                </View>
                <Text className="text-2xl font-bold text-gray-900">5</Text>
                <Text className="text-gray-600 text-sm font-medium">
                  Pending Assignments
                </Text>
              </View>
            </View>

            <View className="w-[48%] px-1">
              <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                <View className="w-10 h-10 bg-emerald-100 rounded-lg items-center justify-center mb-2">
                  <Ionicons
                    name="checkmark-done-outline"
                    size={20}
                    color="#10B981"
                  />
                </View>
                <Text className="text-2xl font-bold text-gray-900">78%</Text>
                <Text className="text-gray-600 text-sm font-medium">
                  Avg. Score
                </Text>
              </View>
            </View>

            <View className="w-[48%] px-1">
              <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mb-2">
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#EF4444"
                  />
                </View>
                <Text className="text-2xl font-bold text-gray-900">2</Text>
                <Text className="text-gray-600 text-sm font-medium">
                  Need Grading
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-6 mt-6 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Recent Activity
          </Text>
          <View className="bg-white rounded-2xl p-1 shadow-lg border border-gray-200">
            {[
              {
                type: "quiz",
                title: "Algebra Quiz Created",
                time: "2 hours ago",
                icon: "document-text-outline",
                color: "#F59E0B",
              },
              {
                type: "assignment",
                title: "Science Project Assigned",
                time: "5 hours ago",
                icon: "create-outline",
                color: "#3B82F6",
              },
              {
                type: "quiz",
                title: "Math Test Grades Released",
                time: "1 day ago",
                icon: "bar-chart-outline",
                color: "#10B981",
              },
            ].map((activity, index) => (
              <View
                key={index}
                className={`flex-row items-center p-4 ${index < 2 ? "border-b border-gray-200" : ""}`}
              >
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: `${activity.color}15` }}
                >
                  <Ionicons
                    name={activity.icon}
                    size={20}
                    color={activity.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-base">
                    {activity.title}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {activity.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Edit Class Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 max-h-[80%]">
            <Text className="text-2xl font-bold text-gray-900 mb-6">
              Edit Class
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="space-y-4"
            >
              {/* Class Name */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Class Name *
                </Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  placeholder="Enter class name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Subject */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Subject *
                </Text>
                <TextInput
                  value={formData.subject}
                  onChangeText={(text) =>
                    setFormData({ ...formData, subject: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  placeholder="Enter subject"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Grade Level */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Grade Level *
                </Text>
                <TextInput
                  value={formData.gradeLevel}
                  onChangeText={(text) =>
                    setFormData({ ...formData, gradeLevel: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  placeholder="Enter grade level"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Schedule */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">Schedule</Text>
                <TextInput
                  value={formData.schedule}
                  onChangeText={(text) =>
                    setFormData({ ...formData, schedule: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  placeholder="e.g., Mon, Wed, Fri 9:00-10:30 AM"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Room */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Room Number
                </Text>
                <TextInput
                  value={formData.room}
                  onChangeText={(text) =>
                    setFormData({ ...formData, room: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  placeholder="Enter room number"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Description */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Description
                </Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  placeholder="Enter class description"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row justify-between space-x-3 pt-4">
                <TouchableOpacity
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl disabled:bg-gray-100"
                  onPress={() => setShowEditModal(false)}
                  disabled={submitting}
                >
                  <Text className="text-gray-700 font-medium text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 px-4 bg-indigo-500 rounded-xl"
                  onPress={handleSaveEdit}
                >
                  <Text className="text-white font-medium text-center">
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
