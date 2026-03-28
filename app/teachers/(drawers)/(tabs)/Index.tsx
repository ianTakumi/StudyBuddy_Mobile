import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import client from "@/utils/axiosInstance";

interface Class {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  student_count: number;
  schedule: ScheduleItem[];
  room: string;
  description: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  class_code: string;
  class_students: { count: number }[];
}

interface ScheduleItem {
  day: string;
  startTime: string;
  startApm: "AM" | "PM";
  endTime: string;
  endApm: "AM" | "PM";
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  subject: string;
  class_id?: string;
  user_id: string;
  created_at: string;
  flashcards?: any[];
}

export default function TeacherHomePage() {
  const user = useSelector((state: any) => state.auth.user);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);

  // State for dashboard stats
  const [stats, setStats] = useState({
    activeClasses: 0,
    flashcardSets: 0,
    totalQuizzes: 0,
    totalStudents: 0,
    todayClasses: [] as Class[],
  });

  // Get today's day name
  const getTodayDay = (): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    return days[today.getDay()];
  };

  // Format schedule for display
  const formatScheduleTime = (schedule: ScheduleItem[]): string => {
    if (!schedule || schedule.length === 0) return "No schedule";
    const today = getTodayDay();
    const todaySchedule = schedule.find((s) => s.day === today);
    if (todaySchedule) {
      return `${todaySchedule.startTime}${todaySchedule.startApm} - ${todaySchedule.endTime}${todaySchedule.endApm}`;
    }
    return schedule
      .map(
        (s) => `${s.day} ${s.startTime}${s.startApm} - ${s.endTime}${s.endApm}`,
      )
      .join(", ");
  };

  // Fetch teacher's classes
  const fetchTeacherClasses = async () => {
    try {
      const response = await client.get(`/classes/${user.id}`);
      if (response.data.success) {
        const classesData = response.data.data || [];
        setClasses(classesData);

        // Calculate total students across all classes
        const totalStudents = classesData.reduce(
          (sum: number, classItem: Class) => {
            return sum + (classItem.student_count || 0);
          },
          0,
        );

        // Filter today's classes
        const today = getTodayDay();
        const todayClasses = classesData.filter((classItem: Class) => {
          return classItem.schedule?.some((schedule) => schedule.day === today);
        });

        setStats((prev) => ({
          ...prev,
          activeClasses: classesData.length,
          totalStudents: totalStudents,
          todayClasses: todayClasses,
        }));
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  // Fetch teacher's flashcards count from the class-based flashcards
  const fetchTeacherFlashcardCount = async () => {
    try {
      const response = await client.get(`/flashcards-class/count/${user.id}`);
      if (response.data.success) {
        setStats((prev) => ({
          ...prev,
          flashcardSets: response.data.data.total_flashcard_sets || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching flashcard count:", error);
    }
  };

  // Fetch teacher's flashcards (for display in recent section)
  const fetchFlashcardSets = async () => {
    try {
      // Fetch flashcards sets from the API
      const response = await client.get(`/flashcards-class/teacher/${user.id}`);
      if (response.data.success) {
        const sets = response.data.data || [];
        setFlashcardSets(sets);
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    }
  };

  // Fetch teacher's quizzes count
  const fetchTeacherQuizzes = async () => {
    try {
      const response = await client.get(`/quizzes/teacher/${user.id}/count`);
      if (response.data.success) {
        setStats((prev) => ({
          ...prev,
          totalQuizzes: response.data.data.total_quizzes || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTeacherClasses(),
        fetchTeacherFlashcardCount(),
        fetchFlashcardSets(),
        fetchTeacherQuizzes(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Combined refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } catch (error) {
      console.error("Refresh error:", error);
      Alert.alert(
        "Refresh Failed",
        "Unable to refresh data. Please try again.",
      );
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  // Handle class press navigation
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

  // Handle flashcard press navigation - This is the key function
  const handleFlashcardPress = (flashcardSet: FlashcardSet) => {
    router.push({
      pathname: "/teachers/FlashCardClassDetails",
      params: {
        id: flashcardSet.id,
        title: flashcardSet.title,
        className: flashcardSet.class_id
          ? "Class Flashcard Set"
          : "My Flashcard Set",
      },
    });
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text className="text-gray-600 mt-4">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4A90E2"]}
          tintColor="#4A90E2"
          title="Pull to refresh..."
          titleColor="#6b7280"
        />
      }
    >
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-white">
        <Text className="text-2xl font-bold text-gray-900">
          Teacher Dashboard
        </Text>
        <Text className="text-gray-600 mt-1">
          Welcome back, {user?.first_name || "Teacher"}!
        </Text>
      </View>

      {/* Teaching Performance Metrics */}
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Today&apos;s Overview
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {/* Active Classes */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm border-l-4 border-blue-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  {stats.activeClasses}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Active Classes
                </Text>
              </View>
              <Ionicons name="school-outline" size={28} color="#4A90E2" />
            </View>
            <Text className="text-green-600 text-xs font-medium mt-2">
              {stats.todayClasses.length} classes today
            </Text>
          </View>

          {/* Flashcard Sets */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm border-l-4 border-orange-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  {stats.flashcardSets}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Flashcard Sets
                </Text>
              </View>
              <Ionicons name="copy-outline" size={28} color="#F59E0B" />
            </View>
            <Text className="text-blue-600 text-xs font-medium mt-2">
              Across all classes
            </Text>
          </View>

          {/* Total Quizzes Created */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm border-l-4 border-purple-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  {stats.totalQuizzes}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Quizzes Created
                </Text>
              </View>
              <Ionicons
                name="document-text-outline"
                size={28}
                color="#8B5CF6"
              />
            </View>
            <Text className="text-purple-600 text-xs font-medium mt-2">
              Across all classes
            </Text>
          </View>

          {/* Total Students */}
          <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm border-l-4 border-green-500">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  {stats.totalStudents}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">Students</Text>
              </View>
              <Ionicons name="people-outline" size={28} color="#10B981" />
            </View>
            <Text className="text-blue-600 text-xs font-medium mt-2">
              Across all classes
            </Text>
          </View>
        </View>
      </View>

      {/* Today's Classes */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">
            Today&apos;s Classes
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/teachers/(drawers)/(tabs)/Classes")}
          >
            <Text className="text-blue-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          {stats.todayClasses.length > 0 ? (
            stats.todayClasses.map((classItem, index) => (
              <TouchableOpacity
                key={classItem.id}
                onPress={() => handleClassPress(classItem)}
                className={`py-3 ${index < stats.todayClasses.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">
                      {classItem.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {classItem.subject} • {classItem.grade_level}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {formatScheduleTime(classItem.schedule)} •{" "}
                      {classItem.room}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-800 font-medium">
                      {classItem.student_count}
                    </Text>
                    <Text className="text-gray-500 text-xs">students</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#9CA3AF"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-8 items-center">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-2">
                No classes scheduled for today
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* All Classes */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">All Classes</Text>
          <TouchableOpacity
            onPress={() => router.push("/teachers/(drawers)/(tabs)/Classes")}
          >
            <Text className="text-blue-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          {classes.length > 0 ? (
            classes.slice(0, 3).map((classItem, index) => (
              <TouchableOpacity
                key={classItem.id}
                onPress={() => handleClassPress(classItem)}
                className={`py-3 ${index < Math.min(3, classes.length) - 1 ? "border-b border-gray-100" : ""}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">
                      {classItem.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {classItem.subject} • {classItem.grade_level}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {classItem.room} • {classItem.student_count} students
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-8 items-center">
              <Ionicons name="school-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-2">
                No classes yet
              </Text>
              <TouchableOpacity
                className="mt-4 bg-blue-500 rounded-lg px-4 py-2"
                onPress={() =>
                  router.push("/teachers/(drawers)/(tabs)/Classes")
                }
              >
                <Text className="text-white font-medium">
                  Create Your First Class
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Recent Flashcards - Updated with working navigation */}
      <View className="px-6 mt-6 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">My Flashcards</Text>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          {flashcardSets.length > 0 ? (
            flashcardSets.slice(0, 3).map((flashcard, index) => (
              <TouchableOpacity
                key={flashcard.id}
                onPress={() => handleFlashcardPress(flashcard)}
                className={`py-3 ${index < Math.min(3, flashcardSets.length) - 1 ? "border-b border-gray-100" : ""}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">
                      {flashcard.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {flashcard.subject || "General"} •{" "}
                      {flashcard.flashcards?.length || 0} cards
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      Created:{" "}
                      {new Date(flashcard.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-8 items-center">
              <Ionicons name="copy-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-2">
                No flashcards yet
              </Text>
              {/* <TouchableOpacity
                className="mt-4 bg-blue-500 rounded-lg px-4 py-2"
                onPress={() => router.push("/flashcards/create")}
              >
                <Text className="text-white font-medium">
                  Create Flashcards
                </Text>
              </TouchableOpacity> */}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
