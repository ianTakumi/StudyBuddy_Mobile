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
import { useSelector } from "react-redux";

// Updated interface for schedule items - MATCHING API RESPONSE
interface ScheduleItem {
  day: string;
  startTime: string;
  startApm: "AM" | "PM"; // Changed from startAmpm to startApm
  endTime: string;
  endApm: "AM" | "PM"; // Changed from endAmpm to endApm
}

// Updated Class interface with proper schedule type
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

// Form data interface with schedule as array
interface FormData {
  name: string;
  subject: string;
  gradeLevel: string;
  schedule: ScheduleItem[];
  room: string;
  description: string;
}

export default function Classes() {
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state with schedule as array
  const [formData, setFormData] = useState<FormData>({
    name: "",
    subject: "",
    gradeLevel: "",
    schedule: [],
    room: "",
    description: "",
  });

  // Helper function to format schedule for display
  const formatSchedule = (schedule: ScheduleItem[]): string => {
    if (!schedule || schedule.length === 0) return "No schedule set";

    return schedule
      .map((item) => {
        return `${item.day} ${item.startTime}${item.startApm} - ${item.endTime}${item.endApm}`;
      })
      .join(", ");
  };

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/classes/${user?.id}`);
      if (response.data.success) {
        console.log("Fetched classes:", response.data.data); // Debug log
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

  // Refresh handler for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClasses();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user?.id]);

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateClass = async () => {
    if (!formData.name || !formData.subject || !formData.gradeLevel) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.schedule.length === 0) {
      Alert.alert("Error", "Please add at least one schedule");
      return;
    }

    try {
      setSubmitting(true);
      // Convert schedule to match API expected format (startApm/endApm)
      const dataToSend = {
        ...formData,
        schedule: formData.schedule.map((item) => ({
          day: item.day,
          startTime: item.startTime,
          startApm: item.startApm,
          endTime: item.endTime,
          endApm: item.endApm,
        })),
      };

      const response = await client.post(`/classes/${user?.id}`, dataToSend);

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

    if (formData.schedule.length === 0) {
      Alert.alert("Error", "Please add at least one schedule");
      return;
    }

    try {
      setSubmitting(true);
      // Convert schedule to match API expected format
      const dataToSend = {
        ...formData,
        schedule: formData.schedule.map((item) => ({
          day: item.day,
          startTime: item.startTime,
          startApm: item.startApm,
          endTime: item.endTime,
          endApm: item.endApm,
        })),
      };

      const response = await client.put(
        `/classes/${user?.id}/${selectedClass.id}`,
        dataToSend,
      );

      if (response.data.success) {
        const updatedClasses = classes.map((classItem) =>
          classItem.id === selectedClass.id ? response.data.data : classItem,
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
                `/classes/${user?.id}/${classItem.id}`,
              );

              if (response.data.success) {
                const updatedClasses = classes.filter(
                  (c) => c.id !== classItem.id,
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
      ],
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      gradeLevel: "",
      schedule: [],
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
      schedule: classItem.schedule || [],
      room: classItem.room,
      description: classItem.description || "",
    });
    setShowEditModal(true);
  };

  const handleClassPress = (classItem: Class) => {
    router.push({
      pathname: "/teachers/class-details/[id]",
      params: {
        id: classItem.id,
        className: classItem.name,
        subject: classItem.subject,
        gradeLevel: classItem.grade_level,
        studentCount: classItem.student_count.toString(),
        schedule: JSON.stringify(classItem.schedule),
        room: classItem.room,
        description: classItem.description || "",
        class_code: classItem.class_code,
      },
    });
  };

  if (loading && !refreshing) {
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
      <View className="pt-12 pb-4 px-6 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Classes</Text>
        <Text className="text-gray-600 mt-1">
          Manage your classes and students
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4A90E2"]}
            tintColor="#4A90E2"
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
      >
        {/* Search Bar */}
        <View className="mx-4 mt-4 mb-4">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              placeholder="Search classes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-gray-700"
              placeholderTextColor="#9CA3AF"
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
                    </View>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-500 text-sm ml-1">
                        {formatSchedule(classItem.schedule)}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-sm mt-1">
                      📍 {classItem.room}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row mt-3 gap-2">
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
                  <TouchableOpacity
                    className="bg-green-100 px-3 py-1 rounded-lg"
                    onPress={() => {
                      router.push({
                        pathname: "/teachers/class-students/[id]",
                        params: { id: classItem.id, className: classItem.name },
                      });
                    }}
                  >
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

// ClassModal Component
interface ClassModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleItem>({
    day: "Monday",
    startTime: "8",
    startApm: "AM",
    endTime: "10",
    endApm: "AM",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [startTimeError, setStartTimeError] = useState<string>("");
  const [endTimeError, setEndTimeError] = useState<string>("");

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Time validation function (12-hour format)
  const validateTimeFormat = (time: string): boolean => {
    // Regular expression for 12-hour format (1-12, optional leading zero)
    const timeRegex = /^(1[0-2]|0?[1-9])$/;
    return timeRegex.test(time);
  };

  const validateSchedule = (): boolean => {
    const { startTime, endTime } = currentSchedule;
    let isValid = true;

    // Validate start time
    if (!startTime) {
      setStartTimeError("Please enter start time");
      isValid = false;
    } else if (!validateTimeFormat(startTime)) {
      setStartTimeError("Invalid time. Use 1-12 (e.g., 8, 08, 10, 12)");
      isValid = false;
    } else {
      setStartTimeError("");
    }

    // Validate end time
    if (!endTime) {
      setEndTimeError("Please enter end time");
      isValid = false;
    } else if (!validateTimeFormat(endTime)) {
      setEndTimeError("Invalid time. Use 1-12 (e.g., 8, 08, 10, 12)");
      isValid = false;
    } else {
      setEndTimeError("");
    }

    return isValid;
  };

  const addSchedule = () => {
    if (!currentSchedule.day) {
      Alert.alert("Error", "Please select a day");
      return;
    }

    if (!validateSchedule()) {
      return;
    }

    if (editingIndex !== null) {
      // Update existing schedule
      const updatedSchedules = [...formData.schedule];
      updatedSchedules[editingIndex] = currentSchedule;
      setFormData({ ...formData, schedule: updatedSchedules });
      setEditingIndex(null);
    } else {
      // Check for duplicate schedule
      const isDuplicate = formData.schedule.some(
        (item) =>
          item.day === currentSchedule.day &&
          item.startTime === currentSchedule.startTime &&
          item.startApm === currentSchedule.startApm &&
          item.endTime === currentSchedule.endTime &&
          item.endApm === currentSchedule.endApm,
      );

      if (isDuplicate) {
        Alert.alert("Error", "Schedule already exists for this day and time");
        return;
      }

      // Add new schedule
      setFormData({
        ...formData,
        schedule: [...formData.schedule, currentSchedule],
      });
    }

    // Reset current schedule
    setCurrentSchedule({
      day: "Monday",
      startTime: "8",
      startApm: "AM",
      endTime: "10",
      endApm: "AM",
    });
    setShowScheduleModal(false);
    setStartTimeError("");
    setEndTimeError("");
  };

  const editSchedule = (index: number) => {
    setCurrentSchedule(formData.schedule[index]);
    setEditingIndex(index);
    setShowScheduleModal(true);
    setStartTimeError("");
    setEndTimeError("");
  };

  const removeSchedule = (index: number) => {
    Alert.alert(
      "Remove Schedule",
      "Are you sure you want to remove this schedule?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updatedSchedules = formData.schedule.filter(
              (_, i) => i !== index,
            );
            setFormData({ ...formData, schedule: updatedSchedules });
          },
        },
      ],
    );
  };

  const formatScheduleDisplay = (schedule: ScheduleItem): string => {
    return `${schedule.day} ${schedule.startTime}${schedule.startApm} - ${schedule.endTime}${schedule.endApm}`;
  };

  const isFormValid = () => {
    return (
      formData.name?.trim() !== "" &&
      formData.subject?.trim() !== "" &&
      formData.gradeLevel?.trim() !== "" &&
      formData.schedule.length > 0 &&
      formData.room?.trim() !== ""
    );
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 max-h-[80%]">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              {title}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Class Name */}
              <View className="mb-3">
                <Text className="text-gray-700 font-medium mb-1">
                  <Text className="text-red-500">* </Text> Class Name
                </Text>
                <TextInput
                  placeholder="Enter class name"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3"
                />
              </View>

              {/* Subject */}
              <View className="mb-3">
                <Text className="text-gray-700 font-medium mb-1">
                  <Text className="text-red-500">* </Text> Subject
                </Text>
                <TextInput
                  placeholder="Enter subject"
                  value={formData.subject}
                  onChangeText={(text) =>
                    setFormData({ ...formData, subject: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3"
                />
              </View>

              {/* Grade Level */}
              <View className="mb-3">
                <Text className="text-gray-700 font-medium mb-1">
                  <Text className="text-red-500">* </Text> Grade Level
                </Text>
                <TextInput
                  placeholder="Enter grade level (e.g., Grade 10, College 1st Year)"
                  value={formData.gradeLevel}
                  onChangeText={(text) =>
                    setFormData({ ...formData, gradeLevel: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3"
                />
              </View>

              {/* Schedule Section */}
              <View className="mb-3">
                <Text className="text-gray-700 font-medium mb-1">
                  <Text className="text-red-500">* </Text> Schedule
                </Text>

                {/* Schedule List */}
                {formData.schedule.length > 0 ? (
                  <View className="mb-2">
                    {formData.schedule.map((item, index) => (
                      <View
                        key={index}
                        className="flex-row items-center justify-between bg-gray-50 rounded-xl p-3 mb-2"
                      >
                        <Text className="text-gray-700 text-sm flex-1">
                          {formatScheduleDisplay(item)}
                        </Text>
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => editSchedule(index)}
                            className="bg-blue-500 px-3 py-1 rounded-lg"
                          >
                            <Text className="text-white text-xs">Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => removeSchedule(index)}
                            className="bg-red-500 px-3 py-1 rounded-lg"
                          >
                            <Text className="text-white text-xs">Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-500 text-sm mb-2">
                    No schedule added yet
                  </Text>
                )}

                {/* Add Schedule Button */}
                <TouchableOpacity
                  className="bg-blue-500 rounded-xl py-2 px-4 flex-row items-center justify-center"
                  onPress={() => {
                    setEditingIndex(null);
                    setCurrentSchedule({
                      day: "Monday",
                      startTime: "8",
                      startApm: "AM",
                      endTime: "10",
                      endApm: "AM",
                    });
                    setStartTimeError("");
                    setEndTimeError("");
                    setShowScheduleModal(true);
                  }}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Add Schedule
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Room Number */}
              <View className="mb-3">
                <Text className="text-gray-700 font-medium mb-1">
                  <Text className="text-red-500">* </Text> Room Number
                </Text>
                <TextInput
                  placeholder="Enter room number"
                  value={formData.room}
                  onChangeText={(text) =>
                    setFormData({ ...formData, room: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3"
                />
              </View>

              {/* Description */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-1">
                  Description
                </Text>
                <TextInput
                  placeholder="Optional - add class description"
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  numberOfLines={3}
                  className="border border-gray-300 rounded-xl px-4 py-3"
                />
              </View>

              {/* Buttons */}
              <View className="flex-row justify-between gap-3">
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
                  className={`flex-1 py-3 px-4 rounded-xl ${
                    isFormValid() ? "bg-blue-500" : "bg-gray-300"
                  }`}
                  onPress={onSubmit}
                  disabled={!isFormValid() || submitting}
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

      {/* Schedule Input Modal with Start Time, End Time, and AM/PM */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              {editingIndex !== null ? "Edit Schedule" : "Add Schedule"}
            </Text>

            {/* Day Selection */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Day</Text>
              <View className="flex-row flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`px-3 py-2 rounded-lg ${
                      currentSchedule.day === day
                        ? "bg-blue-500"
                        : "bg-gray-200"
                    }`}
                    onPress={() =>
                      setCurrentSchedule({ ...currentSchedule, day })
                    }
                  >
                    <Text
                      className={`${
                        currentSchedule.day === day
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Start Time with AM/PM */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Start Time</Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextInput
                    placeholder="Hour (1-12)"
                    value={currentSchedule.startTime}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, "");
                      setCurrentSchedule({
                        ...currentSchedule,
                        startTime: cleaned,
                      });
                      if (startTimeError) setStartTimeError("");
                    }}
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />
                  {startTimeError ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {startTimeError}
                    </Text>
                  ) : (
                    <Text className="text-gray-400 text-xs mt-1">
                      Enter hour only (1-12)
                    </Text>
                  )}
                </View>
                <View className="w-28">
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-xl ${
                        currentSchedule.startApm === "AM"
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                      onPress={() =>
                        setCurrentSchedule({
                          ...currentSchedule,
                          startApm: "AM",
                        })
                      }
                    >
                      <Text
                        className={`text-center font-medium ${
                          currentSchedule.startApm === "AM"
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-xl ${
                        currentSchedule.startApm === "PM"
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                      onPress={() =>
                        setCurrentSchedule({
                          ...currentSchedule,
                          startApm: "PM",
                        })
                      }
                    >
                      <Text
                        className={`text-center font-medium ${
                          currentSchedule.startApm === "PM"
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* End Time with AM/PM */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">End Time</Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextInput
                    placeholder="Hour (1-12)"
                    value={currentSchedule.endTime}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, "");
                      setCurrentSchedule({
                        ...currentSchedule,
                        endTime: cleaned,
                      });
                      if (endTimeError) setEndTimeError("");
                    }}
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />
                  {endTimeError ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {endTimeError}
                    </Text>
                  ) : (
                    <Text className="text-gray-400 text-xs mt-1">
                      Enter hour only (1-12)
                    </Text>
                  )}
                </View>
                <View className="w-28">
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-xl ${
                        currentSchedule.endApm === "AM"
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                      onPress={() =>
                        setCurrentSchedule({
                          ...currentSchedule,
                          endApm: "AM",
                        })
                      }
                    >
                      <Text
                        className={`text-center font-medium ${
                          currentSchedule.endApm === "AM"
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-xl ${
                        currentSchedule.endApm === "PM"
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                      onPress={() =>
                        setCurrentSchedule({
                          ...currentSchedule,
                          endApm: "PM",
                        })
                      }
                    >
                      <Text
                        className={`text-center font-medium ${
                          currentSchedule.endApm === "PM"
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                onPress={() => {
                  setShowScheduleModal(false);
                  setEditingIndex(null);
                  setStartTimeError("");
                  setEndTimeError("");
                }}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 px-4 bg-blue-500 rounded-xl"
                onPress={addSchedule}
              >
                <Text className="text-white font-medium text-center">
                  {editingIndex !== null ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
