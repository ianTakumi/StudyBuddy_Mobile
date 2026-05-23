import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
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

  const [formData, setFormData] = useState<FormData>({
    name: "",
    subject: "",
    gradeLevel: "",
    schedule: [],
    room: "",
    description: "",
  });

  const formatSchedule = (schedule: ScheduleItem[]): string => {
    if (!schedule || schedule.length === 0) return "No schedule set";
    return schedule
      .map((item) => {
        return `${item.day} ${item.startTime}${item.startApm} - ${item.endTime}${item.endApm}`;
      })
      .join(", ");
  };

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
      setRefreshing(false);
    }
  };

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
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading classes...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-emerald-50">
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
        <View className="absolute top-14 right-32 w-8 h-8 bg-emerald-300/50 rounded-full" />

        <Text className="text-3xl font-bold text-white mb-1">Classes</Text>
        <Text className="text-emerald-100 text-base">
          Manage your classes and students
        </Text>
      </View>

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
        {/* Search Bar */}
        <View className="mx-4 mt-6 mb-4">
          <View
            className="flex-row items-center bg-white rounded-2xl px-5 py-4"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Ionicons name="search" size={20} color="#10B981" />
            <TextInput
              placeholder="Search classes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-700"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Add Class Button */}
        <TouchableOpacity
          className="mx-4 mb-6 bg-emerald-500 rounded-2xl py-4 flex-row items-center justify-center"
          onPress={() => setShowAddModal(true)}
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
            <Ionicons name="add" size={20} color="white" />
          </View>
          <Text className="text-white font-bold text-lg">Create New Class</Text>
        </TouchableOpacity>

        {/* Classes List */}
        <View className="mx-4 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="school-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              My Classes ({filteredClasses.length})
            </Text>
          </View>

          {filteredClasses.length > 0 ? (
            filteredClasses.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                className="bg-white rounded-3xl p-5 mb-4 relative overflow-hidden"
                onPress={() => handleClassPress(classItem)}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  elevation: 5,
                }}
              >
                <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full opacity-70" />
                <View className="absolute -bottom-3 -left-3 w-12 h-12 bg-emerald-50 rounded-full opacity-70" />

                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                        <Ionicons
                          name="book-outline"
                          size={20}
                          color="#10B981"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-lg">
                          {classItem.name}
                        </Text>
                        <Text className="text-emerald-600 text-sm font-medium">
                          {classItem.subject} • {classItem.grade_level}
                        </Text>
                      </View>
                    </View>

                    <View className="ml-13 gap-2">
                      <View className="flex-row items-center">
                        <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                          <Ionicons
                            name="people-outline"
                            size={11}
                            color="#10B981"
                          />
                        </View>
                        <Text className="text-gray-500 text-sm">
                          {classItem.student_count} students
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                          <Ionicons
                            name="time-outline"
                            size={11}
                            color="#10B981"
                          />
                        </View>
                        <Text className="text-gray-500 text-sm">
                          {formatSchedule(classItem.schedule)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                          <Ionicons
                            name="location-outline"
                            size={11}
                            color="#10B981"
                          />
                        </View>
                        <Text className="text-gray-500 text-sm">
                          {classItem.room}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="flex-row mt-4 ml-13 gap-2">
                  <TouchableOpacity
                    className="bg-emerald-100 px-4 py-2 rounded-full"
                    onPress={() => openEditModal(classItem)}
                  >
                    <Text className="text-emerald-700 text-xs font-semibold">
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-50 px-4 py-2 rounded-full"
                    onPress={() => handleDeleteClass(classItem)}
                  >
                    <Text className="text-red-600 text-xs font-semibold">
                      Delete
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-emerald-500 px-4 py-2 rounded-full"
                    onPress={() => {
                      router.push({
                        pathname: "/teachers/class-students/[id]",
                        params: { id: classItem.id, className: classItem.name },
                      });
                    }}
                  >
                    <Text className="text-white text-xs font-semibold">
                      Students
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View
              className="bg-white rounded-3xl p-8 items-center relative overflow-hidden"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <View className="absolute -top-8 -right-8 w-20 h-20 bg-emerald-50 rounded-full" />
              <View className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-50 rounded-full" />

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
                <Ionicons name="school-outline" size={36} color="#10B981" />
              </View>
              <Text className="text-gray-800 text-lg font-bold text-center">
                {searchQuery ? "No classes found" : "No classes yet"}
              </Text>
              <Text className="text-gray-500 text-center mt-2 text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first class to get started"}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  className="bg-emerald-500 rounded-2xl py-4 px-8 flex-row items-center justify-center mt-4"
                  onPress={() => setShowAddModal(true)}
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">
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
          <View
            className="bg-white rounded-3xl p-6 mx-4 w-11/12 max-h-[80%] relative overflow-hidden"
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

            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="create-outline" size={20} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-gray-900">{title}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Class Name <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Enter class name"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Subject <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Enter subject"
                  value={formData.subject}
                  onChangeText={(text) =>
                    setFormData({ ...formData, subject: text })
                  }
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Grade Level <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Enter grade level"
                  value={formData.gradeLevel}
                  onChangeText={(text) =>
                    setFormData({ ...formData, gradeLevel: text })
                  }
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Schedule <Text className="text-red-500">*</Text>
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
                  Room Number <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Enter room number"
                  value={formData.room}
                  onChangeText={(text) =>
                    setFormData({ ...formData, room: text })
                  }
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
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
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                  onPress={onClose}
                  disabled={submitting}
                >
                  <Text className="text-gray-700 font-semibold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-4 px-4 rounded-2xl ${isFormValid() ? "bg-emerald-500" : "bg-gray-300"}`}
                  onPress={onSubmit}
                  disabled={!isFormValid() || submitting}
                  style={
                    isFormValid()
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
                      {submitText}
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
                    className={`px-4 py-2.5 rounded-full ${
                      currentSchedule.day === day
                        ? "bg-emerald-500"
                        : "bg-emerald-50"
                    }`}
                    onPress={() =>
                      setCurrentSchedule({ ...currentSchedule, day })
                    }
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        currentSchedule.day === day
                          ? "text-white"
                          : "text-emerald-700"
                      }`}
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
};
