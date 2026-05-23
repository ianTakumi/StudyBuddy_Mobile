import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

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

  const [quizCount, setQuizCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [flashcardCount, setFlashcardCount] = useState<number>(0);
  const [loadingFlashcards, setLoadingFlashcards] = useState(true);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [loadingAverage, setLoadingAverage] = useState(true);

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

  const fetchClassQuizCount = async () => {
    try {
      const response = await client.get(`/quizzes/class/${params.id}/count`);
      if (response.data.success)
        setQuizCount(response.data.data.total_quizzes || 0);
    } catch (error) {
      console.error("Error fetching quiz count:", error);
      setQuizCount(0);
    }
  };

  const fetchClassFlashcardCount = async () => {
    try {
      const response = await client.get(
        `/flashcards-class/class/${params.id}/count`,
      );
      if (response.data.success)
        setFlashcardCount(response.data.data.total_flashcard_sets || 0);
    } catch (error) {
      console.error("Error fetching flashcard count:", error);
      setFlashcardCount(0);
    }
  };

  const fetchClassAverageScore = async () => {
    try {
      setLoadingAverage(true);
      const response = await client.get(`/quizzes/class/${params.id}/average`);
      if (response.data.success)
        setAverageScore(response.data.data.average_score || 0);
    } catch (error) {
      console.error("Error fetching average score:", error);
      setAverageScore(0);
    } finally {
      setLoadingAverage(false);
    }
  };

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
    if (params.id) fetchAllStats();
  }, [params.id]);

  const formatSchedule = (schedule: ScheduleItem[]): string => {
    if (!schedule || schedule.length === 0) return "No schedule set";
    return schedule
      .map(
        (item) =>
          `${item.day} ${item.startTime}${item.startApm} - ${item.endTime}${item.endApm}`,
      )
      .join(", ");
  };

  const validateTimeFormat = (time: string): boolean =>
    /^(1[0-2]|0?[1-9])$/.test(time);

  const validateSchedule = (): boolean => {
    const { startTime, endTime } = currentSchedule;
    let isValid = true;
    if (!startTime) {
      setStartTimeError("Please enter start time");
      isValid = false;
    } else if (!validateTimeFormat(startTime)) {
      setStartTimeError("Invalid time. Use 1-12");
      isValid = false;
    } else setStartTimeError("");
    if (!endTime) {
      setEndTimeError("Please enter end time");
      isValid = false;
    } else if (!validateTimeFormat(endTime)) {
      setEndTimeError("Invalid time. Use 1-12");
      isValid = false;
    } else setEndTimeError("");
    return isValid;
  };

  const addSchedule = () => {
    if (!currentSchedule.day) {
      Alert.alert("Error", "Please select a day");
      return;
    }
    if (!validateSchedule()) return;
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
        Alert.alert("Error", "Schedule already exists");
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
    Alert.alert("Remove Schedule", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          setFormData({
            ...formData,
            schedule: formData.schedule.filter((_, i) => i !== index),
          }),
      },
    ]);
  };

  const handleEditClass = () => setShowEditModal(true);

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
      `Are you sure you want to delete "${params.className}"?`,
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
                Alert.alert("Success", "Class deleted!");
                router.back();
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete class");
            }
          },
        },
      ],
    );
  };

  const formatScheduleDisplay = (schedule: ScheduleItem): string =>
    `${schedule.day} ${schedule.startTime}${schedule.startApm} - ${schedule.endTime}${schedule.endApm}`;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <>
      <ScrollView className="flex-1 bg-emerald-50">
        {/* Header */}
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
          <View className="absolute top-8 left-6 w-16 h-16 bg-emerald-400/30 rounded-full" />
          <View className="absolute top-20 right-10 w-24 h-24 bg-emerald-400/20 rounded-full" />
          <View className="absolute bottom-4 left-20 w-12 h-12 bg-emerald-300/40 rounded-full" />

          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white mb-2">
                {params.className}
              </Text>
              <Text className="text-emerald-100 text-lg font-medium">
                {params.subject}
              </Text>
            </View>
            <View className="bg-white/20 rounded-full px-4 py-2">
              <Text className="text-white font-bold text-sm">
                {params.studentCount} students
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-row items-center bg-white/20 rounded-2xl px-5 py-3 flex-1"
              onPress={handleEditClass}
            >
              <Ionicons name="create-outline" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Edit Class</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center bg-red-400/80 rounded-2xl px-5 py-3"
              onPress={handleDeleteClass}
            >
              <Ionicons name="trash-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Class Details */}
        <View className="px-6 mt-6">
          <View
            className="bg-white rounded-3xl p-6 relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-50 rounded-full" />
            <View className="absolute -bottom-4 -left-4 w-16 h-16 bg-emerald-50 rounded-full opacity-70" />

            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <Text className="text-xl font-bold text-gray-900">
                Class Information
              </Text>
            </View>

            <View className="gap-4 ml-13">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="school-outline" size={18} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs font-medium">
                    Grade Level
                  </Text>
                  <Text className="text-gray-900 font-semibold">
                    {params.gradeLevel}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="time-outline" size={18} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs font-medium">
                    Schedule
                  </Text>
                  <Text className="text-gray-900 font-semibold">
                    {formatSchedule(parseSchedule(params.schedule as string))}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="location-outline" size={18} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs font-medium">
                    Room
                  </Text>
                  <Text className="text-gray-900 font-semibold">
                    {params.room}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="key-outline" size={18} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs font-medium">
                    Class Code
                  </Text>
                  <Text className="text-gray-900 font-semibold font-mono">
                    {params.class_code}
                  </Text>
                </View>
              </View>
            </View>

            {params.description && (
              <View className="mt-4 pt-4 border-t border-emerald-100 ml-13">
                <Text className="text-gray-900 font-bold mb-2">
                  Description
                </Text>
                <View className="bg-emerald-50 rounded-2xl p-4">
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
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="flash-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Quick Actions
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity
              className="w-[48%] mb-3"
              onPress={() =>
                router.push(`/teachers/class-details/${params.id}/quizzes`)
              }
            >
              <View
                className="bg-white rounded-2xl p-5 items-center relative overflow-hidden"
                style={{
                  shadowColor: "#F59E0B",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <View className="absolute -top-2 -right-2 w-10 h-10 bg-amber-100 rounded-full opacity-50" />
                <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center mb-3">
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color="#F59E0B"
                  />
                </View>
                <Text className="text-gray-900 font-bold text-sm">
                  Manage Quizzes
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Create & grade
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] mb-3"
              onPress={() =>
                router.push(`/teachers/class-details/${params.id}/FlashCards`)
              }
            >
              <View
                className="bg-white rounded-2xl p-5 items-center relative overflow-hidden"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <View className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-100 rounded-full opacity-50" />
                <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="flash-outline" size={22} color="#10B981" />
                </View>
                <Text className="text-gray-900 font-bold text-sm">
                  Manage Flashcards
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Create & manage
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Class Overview Stats */}
        <View className="px-6 mt-4 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="stats-chart-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Class Overview
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%] mb-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(`/teachers/class-details/${params.id}/quizzes`)
                }
              >
                <View
                  className="bg-white rounded-2xl p-4 relative overflow-hidden"
                  style={{
                    shadowColor: "#F59E0B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <View className="absolute -top-2 -right-2 w-10 h-10 bg-amber-100 rounded-full opacity-50" />
                  <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mb-3">
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
                  <Text className="text-gray-500 text-sm font-medium">
                    Total Quizzes
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="w-[48%] mb-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(`/teachers/class-details/${params.id}/FlashCards`)
                }
              >
                <View
                  className="bg-white rounded-2xl p-4 relative overflow-hidden"
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <View className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-100 rounded-full opacity-50" />
                  <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mb-3">
                    <Ionicons name="flash-outline" size={20} color="#10B981" />
                  </View>
                  {loadingFlashcards ? (
                    <ActivityIndicator size="small" color="#10B981" />
                  ) : (
                    <Text className="text-2xl font-bold text-gray-900">
                      {flashcardCount}
                    </Text>
                  )}
                  <Text className="text-gray-500 text-sm font-medium">
                    Flashcard Sets
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="w-[48%] mb-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(`/teachers/class-details/${params.id}/students`)
                }
              >
                <View
                  className="bg-white rounded-2xl p-4 relative overflow-hidden"
                  style={{
                    shadowColor: "#059669",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <View className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-50 rounded-full opacity-50" />
                  <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mb-3">
                    <Ionicons name="people-outline" size={20} color="#059669" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900">
                    {params.studentCount}
                  </Text>
                  <Text className="text-gray-500 text-sm font-medium">
                    Enrolled Students
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="w-[48%] mb-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(`/teachers/class-details/${params.id}/quizzes`)
                }
              >
                <View
                  className="bg-white rounded-2xl p-4 relative overflow-hidden"
                  style={{
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <View className="absolute -top-2 -right-2 w-10 h-10 bg-blue-100 rounded-full opacity-50" />
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-3">
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
                      <View className="mt-2 bg-gray-200 rounded-full h-2">
                        <View
                          className={`h-2 rounded-full ${averageScore >= 80 ? "bg-emerald-500" : averageScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${averageScore}%` }}
                        />
                      </View>
                    </>
                  )}
                  <Text className="text-gray-500 text-sm font-medium mt-1">
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
          <View
            className="bg-white rounded-3xl p-6 mx-4 w-11/12 max-h-[85%] relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.2,
              shadowRadius: 40,
              elevation: 15,
            }}
          >
            <View className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-100 rounded-full opacity-50" />
            <View className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-50 rounded-full opacity-50" />

            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="create-outline" size={22} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                Edit Class
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Class Name *
                </Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholder="Enter class name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Subject *
                </Text>
                <TextInput
                  value={formData.subject}
                  onChangeText={(text) =>
                    setFormData({ ...formData, subject: text })
                  }
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholder="Enter subject"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Grade Level *
                </Text>
                <TextInput
                  value={formData.gradeLevel}
                  onChangeText={(text) =>
                    setFormData({ ...formData, gradeLevel: text })
                  }
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholder="Enter grade level"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Schedule *
                </Text>
                {formData.schedule.length > 0 ? (
                  <View className="mb-2">
                    {formData.schedule.map((item, index) => (
                      <View
                        key={index}
                        className="flex-row items-center justify-between bg-emerald-50 rounded-2xl p-3 mb-2"
                      >
                        <Text className="text-emerald-700 text-sm flex-1 font-medium">
                          {formatScheduleDisplay(item)}
                        </Text>
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => editSchedule(index)}
                            className="bg-emerald-500 px-3 py-1.5 rounded-full"
                          >
                            <Text className="text-white text-xs font-semibold">
                              Edit
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => removeSchedule(index)}
                            className="bg-red-500 px-3 py-1.5 rounded-full"
                          >
                            <Text className="text-white text-xs font-semibold">
                              Remove
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-500 text-sm mb-2 ml-1">
                    No schedule added yet
                  </Text>
                )}
                <TouchableOpacity
                  className="bg-emerald-500 rounded-2xl py-3 px-4 flex-row items-center justify-center"
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
                  <Text className="text-white font-semibold ml-2">
                    Add Schedule
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Room Number *
                </Text>
                <TextInput
                  value={formData.room}
                  onChangeText={(text) =>
                    setFormData({ ...formData, room: text })
                  }
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholder="Enter room number"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Description
                </Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  numberOfLines={4}
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholder="Enter class description"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>

              <View className="flex-row gap-3 pb-6">
                <TouchableOpacity
                  className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                  onPress={() => setShowEditModal(false)}
                  disabled={submitting}
                >
                  <Text className="text-gray-700 font-semibold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-4 px-4 rounded-2xl ${formData.schedule.length > 0 ? "bg-emerald-500" : "bg-gray-300"}`}
                  onPress={handleSaveEdit}
                  disabled={submitting || formData.schedule.length === 0}
                  style={
                    formData.schedule.length > 0
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
                    <Text className="text-white font-bold text-center">
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
          <View
            className="bg-white rounded-3xl p-6 mx-4 w-11/12 relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.2,
              shadowRadius: 40,
              elevation: 15,
            }}
          >
            <View className="absolute -top-8 -right-8 w-20 h-20 bg-emerald-100 rounded-full opacity-50" />
            <View className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-50 rounded-full opacity-50" />

            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="time-outline" size={20} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-gray-900">
                {editingIndex !== null ? "Edit Schedule" : "Add Schedule"}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Day
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`px-4 py-2.5 rounded-full ${currentSchedule.day === day ? "bg-emerald-500" : "bg-emerald-50"}`}
                    onPress={() =>
                      setCurrentSchedule({ ...currentSchedule, day })
                    }
                  >
                    <Text
                      className={`font-semibold text-sm ${currentSchedule.day === day ? "text-white" : "text-emerald-700"}`}
                    >
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Start Time
              </Text>
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
                    className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                    placeholderTextColor="#9CA3AF"
                  />
                  {startTimeError ? (
                    <Text className="text-red-500 text-xs mt-1 ml-2">
                      {startTimeError}
                    </Text>
                  ) : (
                    <Text className="text-gray-400 text-xs mt-1 ml-2">
                      Enter hour only (1-12)
                    </Text>
                  )}
                </View>
                <View className="w-28">
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-full ${currentSchedule.startApm === "AM" ? "bg-emerald-500" : "bg-emerald-50"}`}
                      onPress={() =>
                        setCurrentSchedule({
                          ...currentSchedule,
                          startApm: "AM",
                        })
                      }
                    >
                      <Text
                        className={`text-center font-bold ${currentSchedule.startApm === "AM" ? "text-white" : "text-emerald-700"}`}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-full ${currentSchedule.startApm === "PM" ? "bg-emerald-500" : "bg-emerald-50"}`}
                      onPress={() =>
                        setCurrentSchedule({
                          ...currentSchedule,
                          startApm: "PM",
                        })
                      }
                    >
                      <Text
                        className={`text-center font-bold ${currentSchedule.startApm === "PM" ? "text-white" : "text-emerald-700"}`}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                End Time
              </Text>
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
                    className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                    placeholderTextColor="#9CA3AF"
                  />
                  {endTimeError ? (
                    <Text className="text-red-500 text-xs mt-1 ml-2">
                      {endTimeError}
                    </Text>
                  ) : (
                    <Text className="text-gray-400 text-xs mt-1 ml-2">
                      Enter hour only (1-12)
                    </Text>
                  )}
                </View>
                <View className="w-28">
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-full ${currentSchedule.endApm === "AM" ? "bg-emerald-500" : "bg-emerald-50"}`}
                      onPress={() =>
                        setCurrentSchedule({ ...currentSchedule, endApm: "AM" })
                      }
                    >
                      <Text
                        className={`text-center font-bold ${currentSchedule.endApm === "AM" ? "text-white" : "text-emerald-700"}`}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-full ${currentSchedule.endApm === "PM" ? "bg-emerald-500" : "bg-emerald-50"}`}
                      onPress={() =>
                        setCurrentSchedule({ ...currentSchedule, endApm: "PM" })
                      }
                    >
                      <Text
                        className={`text-center font-bold ${currentSchedule.endApm === "PM" ? "text-white" : "text-emerald-700"}`}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                onPress={() => {
                  setShowScheduleModal(false);
                  setEditingIndex(null);
                  setStartTimeError("");
                  setEndTimeError("");
                }}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 px-4 bg-emerald-500 rounded-2xl"
                onPress={addSchedule}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Text className="text-white font-bold text-center">
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
