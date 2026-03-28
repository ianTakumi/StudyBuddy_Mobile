import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

// Schedule item interface matching API response
interface ScheduleItem {
  day: string;
  startTime: string;
  startApm: "AM" | "PM";
  endTime: string;
  endApm: "AM" | "PM";
}

export default function ClassInfo() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  // State for class stats
  const [quizCount, setQuizCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [flashcardCount, setFlashcardCount] = useState<number>(0);
  const [loadingFlashcards, setLoadingFlashcards] = useState(true);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [loadingAverage, setLoadingAverage] = useState(true);

  // Parse schedule from params (it's a JSON string)
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

  const [formData, setFormData] = useState({
    name: params.className || "",
    subject: params.subject || "",
    gradeLevel: params.gradeLevel || "",
    schedule: parseSchedule(params.schedule as string),
    room: params.room || "",
    description: params.description || "",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch class quiz count
  const fetchClassQuizCount = async () => {
    try {
      const response = await client.get(`/quizzes/class/${params.id}/count`);
      if (response.data.success) {
        setQuizCount(response.data.data.total_quizzes || 0);
      }
    } catch (error) {
      console.error("Error fetching quiz count:", error);
      setQuizCount(0);
    }
  };

  // Fetch class flashcard count
  const fetchClassFlashcardCount = async () => {
    try {
      const response = await client.get(
        `/flashcards-class/class/${params.id}/count`,
      );
      if (response.data.success) {
        setFlashcardCount(response.data.data.total_flashcard_sets || 0);
      }
    } catch (error) {
      console.error("Error fetching flashcard count:", error);
      setFlashcardCount(0);
    }
  };

  // Fetch class average score
  const fetchClassAverageScore = async () => {
    try {
      setLoadingAverage(true);
      const response = await client.get(`/quizzes/class/${params.id}/average`);
      if (response.data.success) {
        setAverageScore(response.data.data.average_score || 0);
      }
    } catch (error) {
      console.error("Error fetching average score:", error);
      setAverageScore(0);
    } finally {
      setLoadingAverage(false);
    }
  };

  // Combined loading function
  const fetchAllStats = async () => {
    setLoadingStats(true);
    setLoadingFlashcards(true);
    setLoadingAverage(true);

    await Promise.all([
      fetchClassQuizCount(),
      fetchClassFlashcardCount(),
      fetchClassAverageScore(),
    ]);

    setLoadingStats(false);
    setLoadingFlashcards(false);
    setLoadingAverage(false);
  };

  useEffect(() => {
    if (params.id) {
      fetchAllStats();
    }
  }, [params.id]);

  // Helper function to format schedule for display
  const formatSchedule = (schedule: ScheduleItem[]): string => {
    if (!schedule || schedule.length === 0) return "No schedule set";

    return schedule
      .map((item) => {
        return `${item.day} ${item.startTime}${item.startApm} - ${item.endTime}${item.endApm}`;
      })
      .join(", ");
  };

  // Time validation function (12-hour format)
  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^(1[0-2]|0?[1-9])$/;
    return timeRegex.test(time);
  };

  const validateSchedule = (): boolean => {
    const { startTime, endTime } = currentSchedule;
    let isValid = true;

    if (!startTime) {
      setStartTimeError("Please enter start time");
      isValid = false;
    } else if (!validateTimeFormat(startTime)) {
      setStartTimeError("Invalid time. Use 1-12 (e.g., 8, 08, 10, 12)");
      isValid = false;
    } else {
      setStartTimeError("");
    }

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
      const updatedSchedules = [...formData.schedule];
      updatedSchedules[editingIndex] = currentSchedule;
      setFormData({ ...formData, schedule: updatedSchedules });
      setEditingIndex(null);
    } else {
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

      setFormData({
        ...formData,
        schedule: [...formData.schedule, currentSchedule],
      });
    }

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

  const handleEditClass = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
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
      const response = await client.put(
        `/classes/${user?.id}/${params.id}`,
        formData,
      );

      if (response.data.success) {
        Alert.alert("Success", "Class updated successfully!");
        setShowEditModal(false);

        // Update params with new data
        router.setParams({
          ...params,
          className: formData.name,
          subject: formData.subject,
          gradeLevel: formData.gradeLevel,
          schedule: JSON.stringify(formData.schedule),
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

  const handleDeleteClass = async () => {
    Alert.alert(
      "Delete Class",
      `Are you sure you want to delete "${params.className}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await client.delete(
                `/classes/${user?.id}/${params.id}`,
              );

              if (response.data.success) {
                Alert.alert("Success", "Class deleted successfully!");
                router.back();
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

  const formatScheduleDisplay = (schedule: ScheduleItem): string => {
    return `${schedule.day} ${schedule.startTime}${schedule.startApm} - ${schedule.endTime}${schedule.endApm}`;
  };

  // Helper function to get score color based on percentage
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        {/* Header Section */}
        <View className="bg-indigo-500 pt-16 pb-6 px-6">
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white mb-2">
                {params.className}
              </Text>
              <Text className="text-indigo-200 text-lg font-medium">
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
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-row items-center bg-blue-500 rounded-xl px-4 py-3 flex-1"
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

              <View className="gap-4">
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
                      {formatSchedule(parseSchedule(params.schedule as string))}
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

                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-emerald-100 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="code-outline" size={24} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 text-sm font-medium">
                      Class Code
                    </Text>
                    <Text className="text-gray-900 font-semibold text-base font-mono">
                      {params.class_code}
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

        {/* Quick Actions - Only Quizzes and Flashcards */}
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
                router.push(`/teachers/class-details/${params.id}/FlashCards`)
              }
            >
              <View className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 items-center">
                <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="flash-outline" size={24} color="#10B981" />
                </View>
                <Text className="text-gray-900 font-bold text-center text-sm">
                  Manage Flashcards
                </Text>
                <Text className="text-gray-600 text-xs text-center mt-1">
                  Create & manage flashcards
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats - Updated with real data including average score */}
        <View className="px-6 mt-4 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Class Overview
          </Text>
          <View className="flex-row flex-wrap justify-between -mx-1">
            <View className="w-[48%] px-1 mb-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(`/teachers/class-details/${params.id}/quizzes`)
                }
              >
                <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                  <View className="w-10 h-10 bg-amber-100 rounded-lg items-center justify-center mb-2">
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#F59E0B"
                    />
                  </View>
                  {loadingStats ? (
                    <ActivityIndicator size="small" color="#F59E0B" />
                  ) : (
                    <Text className="text-2xl font-bold text-gray-900">
                      {quizCount}
                    </Text>
                  )}
                  <Text className="text-gray-600 text-sm font-medium">
                    Total Quizzes
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="w-[48%] px-1 mb-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(`/teachers/class-details/${params.id}/FlashCards`)
                }
              >
                <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                  <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mb-2">
                    <Ionicons name="flash-outline" size={20} color="#10B981" />
                  </View>
                  {loadingFlashcards ? (
                    <ActivityIndicator size="small" color="#10B981" />
                  ) : (
                    <Text className="text-2xl font-bold text-gray-900">
                      {flashcardCount}
                    </Text>
                  )}
                  <Text className="text-gray-600 text-sm font-medium">
                    Flashcard Sets
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="w-[48%] px-1 mb-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(`/teachers/class-details/${params.id}/students`)
                }
              >
                <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                  <View className="w-10 h-10 bg-emerald-100 rounded-lg items-center justify-center mb-2">
                    <Ionicons name="people-outline" size={20} color="#10B981" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900">
                    {params.studentCount}
                  </Text>
                  <Text className="text-gray-600 text-sm font-medium">
                    Enrolled Students
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="w-[48%] px-1 mb-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(`/teachers/class-details/${params.id}/quizzes`)
                }
              >
                <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                  <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mb-2">
                    <Ionicons
                      name="analytics-outline"
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                  {loadingAverage ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <>
                      <Text
                        className={`text-2xl font-bold ${getScoreColor(averageScore)}`}
                      >
                        {Math.round(averageScore)}%
                      </Text>
                      <View className="mt-1">
                        <View className="bg-gray-200 rounded-full h-1.5 w-full">
                          <View
                            className={`h-1.5 rounded-full ${
                              averageScore >= 80
                                ? "bg-green-500"
                                : averageScore >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${averageScore}%` }}
                          />
                        </View>
                      </View>
                    </>
                  )}
                  <Text className="text-gray-600 text-sm font-medium mt-1">
                    Avg. Score
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Class Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 max-h-[85%]">
            <Text className="text-2xl font-bold text-gray-900 mb-6">
              Edit Class
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Class Name */}
              <View className="mb-4">
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
              <View className="mb-4">
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
              <View className="mb-4">
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

              {/* Schedule Section */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">
                  Schedule *
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
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">
                  Room Number *
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
              <View className="mb-6">
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
              <View className="flex-row justify-between gap-3 pt-4 pb-6">
                <TouchableOpacity
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                  onPress={() => setShowEditModal(false)}
                  disabled={submitting}
                >
                  <Text className="text-gray-700 font-medium text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-xl ${
                    formData.schedule.length > 0
                      ? "bg-indigo-500"
                      : "bg-gray-300"
                  }`}
                  onPress={handleSaveEdit}
                  disabled={submitting || formData.schedule.length === 0}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-medium text-center">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Schedule Input Modal */}
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
}
