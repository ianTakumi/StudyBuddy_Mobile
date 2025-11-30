import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import client from "@/utils/axiosInstance";
import { useSelector } from "react-redux";

interface Class {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  student_count: number;
  schedule: string;
  room: string;
  description?: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  class_code: string;
}

export default function Classes() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    gradeLevel: "",
    schedule: "",
    room: "",
    description: "",
  });

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/classes/${user?.id}`);
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      Alert.alert("Error", "Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user?.id]);

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClass = async () => {
    if (!formData.name || !formData.subject || !formData.gradeLevel) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await client.post(`/classes/${user?.id}`, formData);

      if (response.data.success) {
        setClasses([response.data.data, ...classes]);
        setShowAddModal(false);
        resetForm();
        Alert.alert("Success", "Class created successfully!");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      Alert.alert("Error", "Failed to create class");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateClass = async () => {
    if (
      !selectedClass ||
      !formData.name ||
      !formData.subject ||
      !formData.gradeLevel
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await client.put(
        `/classes/${user?.id}/${selectedClass.id}`,
        formData
      );

      if (response.data.success) {
        const updatedClasses = classes.map((classItem) =>
          classItem.id === selectedClass.id ? response.data.data : classItem
        );
        setClasses(updatedClasses);
        setShowEditModal(false);
        resetForm();
        Alert.alert("Success", "Class updated successfully!");
      }
    } catch (error) {
      console.error("Error updating class:", error);
      Alert.alert("Error", "Failed to update class");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (classItem: Class) => {
    Alert.alert(
      "Delete Class",
      `Are you sure you want to delete "${classItem.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await client.delete(
                `/classes/${user?.id}/${classItem.id}`
              );

              if (response.data.success) {
                const updatedClasses = classes.filter(
                  (c) => c.id !== classItem.id
                );
                setClasses(updatedClasses);
                Alert.alert("Success", "Class deleted successfully!");
              }
            } catch (error) {
              console.error("Error deleting class:", error);
              Alert.alert("Error", "Failed to delete class");
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      gradeLevel: "",
      schedule: "",
      room: "",
      description: "",
    });
    setSelectedClass(null);
  };

  const openEditModal = (classItem: Class) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      subject: classItem.subject,
      gradeLevel: classItem.grade_level,
      schedule: classItem.schedule,
      room: classItem.room,
      description: classItem.description || "",
    });
    setShowEditModal(true);
  };

  const handleClassPress = (classItem: Class) => {
    router.push({
      pathname: "/teachers/class-details/[id]",
      params: {
        id: classItem.id, // IMPORTANTE: 'id' ang expected ng dynamic route
        className: classItem.name,
        subject: classItem.subject,
        gradeLevel: classItem.grade_level,
        studentCount: classItem.student_count.toString(),
        schedule: classItem.schedule,
        room: classItem.room,
        description: classItem.description || "",
        class_code: classItem.class_code,
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text className="text-gray-600 mt-4">Loading classes...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Classes</Text>
        <Text className="text-gray-600 mt-1">
          Manage your classes and students
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Search Bar */}
        <View className="mx-4 mb-4">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              placeholder="Search classes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-gray-700"
            />
          </View>
        </View>

        {/* Add Class Button */}
        <TouchableOpacity
          className="mx-4 mb-6 bg-blue-500 rounded-xl py-4 flex-row items-center justify-center"
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">
            Create New Class
          </Text>
        </TouchableOpacity>

        {/* Classes List */}
        <View className="mx-4 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            My Classes ({filteredClasses.length})
          </Text>

          {filteredClasses.length > 0 ? (
            filteredClasses.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm"
                onPress={() => handleClassPress(classItem)}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-lg">
                      {classItem.name}
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      {classItem.subject} • {classItem.grade_level}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color="#6B7280"
                      />
                      <Text className="text-gray-500 text-sm ml-1">
                        {classItem.student_count} students
                      </Text>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color="#6B7280"
                        className="ml-4"
                      />
                      <Text className="text-gray-500 text-sm ml-1">
                        {classItem.schedule}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-sm mt-1">
                      📍 {classItem.room}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row mt-3 space-x-2">
                  <TouchableOpacity
                    className="bg-blue-100 px-3 py-1 rounded-lg"
                    onPress={() => openEditModal(classItem)}
                  >
                    <Text className="text-blue-600 text-xs">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-100 px-3 py-1 rounded-lg"
                    onPress={() => handleDeleteClass(classItem)}
                  >
                    <Text className="text-red-600 text-xs">Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-green-100 px-3 py-1 rounded-lg">
                    <Text className="text-green-600 text-xs">Students</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-gray-50 rounded-xl p-8 items-center">
              <Ionicons name="school-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4 text-lg font-semibold">
                {searchQuery ? "No classes found" : "No classes yet"}
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-2">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first class to get started"}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  className="bg-blue-500 rounded-xl py-3 px-6 flex-row items-center justify-center mt-4"
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Create Your First Class
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Class Modal */}
      <ClassModal
        visible={showAddModal}
        title="Create New Class"
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        onSubmit={handleCreateClass}
        formData={formData}
        setFormData={setFormData}
        submitText="Create Class"
        submitting={submitting}
      />

      {/* Edit Class Modal */}
      <ClassModal
        visible={showEditModal}
        title="Edit Class"
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        onSubmit={handleUpdateClass}
        formData={formData}
        setFormData={setFormData}
        submitText="Update Class"
        submitting={submitting}
      />
    </View>
  );
}

// Reusable Modal Component
interface ClassModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  formData: any;
  setFormData: (data: any) => void;
  submitText: string;
  submitting?: boolean;
}

const ClassModal: React.FC<ClassModalProps> = ({
  visible,
  title,
  onClose,
  onSubmit,
  formData,
  setFormData,
  submitText,
  submitting = false,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 max-h-[80%]">
          <Text className="text-xl font-bold text-gray-900 mb-4">{title}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              placeholder="Class Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
            />
            <TextInput
              placeholder="Subject *"
              value={formData.subject}
              onChangeText={(text) =>
                setFormData({ ...formData, subject: text })
              }
              className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
            />
            <TextInput
              placeholder="Grade Level *"
              value={formData.gradeLevel}
              onChangeText={(text) =>
                setFormData({ ...formData, gradeLevel: text })
              }
              className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
            />
            <TextInput
              placeholder="Schedule (e.g., Mon, Wed, Fri 9:00-10:30 AM)"
              value={formData.schedule}
              onChangeText={(text) =>
                setFormData({ ...formData, schedule: text })
              }
              className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
            />
            <TextInput
              placeholder="Room Number"
              value={formData.room}
              onChangeText={(text) => setFormData({ ...formData, room: text })}
              className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
            />
            <TextInput
              placeholder="Description (optional)"
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={3}
              className="border border-gray-300 rounded-xl px-4 py-3 mb-6"
            />

            <View className="flex-row justify-between space-x-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                onPress={onClose}
                disabled={submitting}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 px-4 bg-blue-500 rounded-xl disabled:bg-blue-300"
                onPress={onSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-medium text-center">
                    {submitText}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
