import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

  const [stats, setStats] = useState({
    activeClasses: 0,
    flashcardSets: 0,
    totalQuizzes: 0,
    totalStudents: 0,
    todayClasses: [] as Class[],
  });

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

  const fetchTeacherClasses = async () => {
    try {
      const response = await client.get(`/classes/${user?.id}`);
      if (response.data.success) {
        const classesData = response.data.data || [];
        setClasses(classesData);

        const totalStudents = classesData.reduce(
          (sum: number, classItem: Class) =>
            sum + (classItem.student_count || 0),
          0,
        );

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

  const fetchTeacherFlashcardCount = async () => {
    try {
      const response = await client.get(`/flashcards-class/count/${user?.id}`);
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

  const fetchFlashcardSets = async () => {
    try {
      const response = await client.get(
        `/flashcards-class/teacher/${user?.id}`,
      );
      if (response.data.success) {
        const sets = response.data.data || [];
        setFlashcardSets(sets);
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    }
  };

  const fetchTeacherQuizzes = async () => {
    try {
      const response = await client.get(`/quizzes/teacher/${user?.id}/count`);
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
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-emerald-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#10B981"]}
          tintColor="#10B981"
          title="Pull to refresh..."
          titleColor="#6b7280"
        />
      }
    >
      {/* Header - Pear Deck Style */}
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

        <Text className="text-3xl font-bold text-white mb-1">
          Teacher Dashboard
        </Text>
        <Text className="text-emerald-100 text-base">
          Welcome back, {user?.first_name || "Teacher"}!
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="px-6 mt-6">
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
            <Ionicons name="stats-chart-outline" size={16} color="#10B981" />
          </View>
          <Text className="text-xl font-bold text-gray-900">
            Today's Overview
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {/* Active Classes */}
          <View
            className="bg-white rounded-2xl p-4 w-[48%] mb-4 relative overflow-hidden"
            style={{
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute -top-2 -right-2 w-12 h-12 bg-blue-100 rounded-full opacity-50" />
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="school-outline" size={20} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {stats.activeClasses}
            </Text>
            <Text className="text-gray-500 text-sm font-medium">
              Active Classes
            </Text>
            <View className="bg-blue-50 rounded-full px-2 py-0.5 mt-2 self-start">
              <Text className="text-blue-600 text-xs font-semibold">
                {stats.todayClasses.length} today
              </Text>
            </View>
          </View>

          {/* Flashcard Sets */}
          <View
            className="bg-white rounded-2xl p-4 w-[48%] mb-4 relative overflow-hidden"
            style={{
              shadowColor: "#F59E0B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute -top-2 -right-2 w-12 h-12 bg-amber-100 rounded-full opacity-50" />
            <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="copy-outline" size={20} color="#F59E0B" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {stats.flashcardSets}
            </Text>
            <Text className="text-gray-500 text-sm font-medium">
              Flashcard Sets
            </Text>
            <View className="bg-amber-50 rounded-full px-2 py-0.5 mt-2 self-start">
              <Text className="text-amber-600 text-xs font-semibold">
                All classes
              </Text>
            </View>
          </View>

          {/* Total Quizzes */}
          <View
            className="bg-white rounded-2xl p-4 w-[48%] mb-4 relative overflow-hidden"
            style={{
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute -top-2 -right-2 w-12 h-12 bg-purple-100 rounded-full opacity-50" />
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-3">
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#8B5CF6"
              />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {stats.totalQuizzes}
            </Text>
            <Text className="text-gray-500 text-sm font-medium">
              Quizzes Created
            </Text>
            <View className="bg-purple-50 rounded-full px-2 py-0.5 mt-2 self-start">
              <Text className="text-purple-600 text-xs font-semibold">
                All classes
              </Text>
            </View>
          </View>

          {/* Total Students */}
          <View
            className="bg-white rounded-2xl p-4 w-[48%] relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute -top-2 -right-2 w-12 h-12 bg-emerald-100 rounded-full opacity-50" />
            <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="people-outline" size={20} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {stats.totalStudents}
            </Text>
            <Text className="text-gray-500 text-sm font-medium">Students</Text>
            <View className="bg-emerald-50 rounded-full px-2 py-0.5 mt-2 self-start">
              <Text className="text-emerald-600 text-xs font-semibold">
                All classes
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Today's Classes */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="calendar-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Today's Classes
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/teachers/(drawers)/(tabs)/Classes")}
          >
            <Text className="text-emerald-600 font-semibold">View All</Text>
          </TouchableOpacity>
        </View>

        <View
          className="bg-white rounded-3xl p-4 relative overflow-hidden"
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />

          {stats.todayClasses.length > 0 ? (
            stats.todayClasses.map((classItem, index) => (
              <TouchableOpacity
                key={classItem.id}
                onPress={() => handleClassPress(classItem)}
                className={`py-4 ${index < stats.todayClasses.length - 1 ? "border-b border-emerald-100" : ""}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold">
                      {classItem.name}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-0.5">
                      {classItem.subject} • {classItem.grade_level}
                    </Text>
                    <View className="flex-row items-center mt-1.5 gap-3">
                      <View className="flex-row items-center">
                        <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mr-1">
                          <Ionicons
                            name="time-outline"
                            size={9}
                            color="#10B981"
                          />
                        </View>
                        <Text className="text-gray-400 text-xs">
                          {formatScheduleTime(classItem.schedule)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mr-1">
                          <Ionicons
                            name="location-outline"
                            size={9}
                            color="#10B981"
                          />
                        </View>
                        <Text className="text-gray-400 text-xs">
                          {classItem.room}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="items-end ml-3">
                    <View className="bg-emerald-100 rounded-full px-2 py-0.5 mb-1">
                      <Text className="text-emerald-700 text-xs font-bold">
                        {classItem.student_count}
                      </Text>
                    </View>
                    <Text className="text-gray-400 text-xs">students</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-8 items-center">
              <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="calendar-outline" size={28} color="#10B981" />
              </View>
              <Text className="text-gray-500 font-medium">
                No classes scheduled for today
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* All Classes */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="school-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-xl font-bold text-gray-900">All Classes</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/teachers/(drawers)/(tabs)/Classes")}
          >
            <Text className="text-emerald-600 font-semibold">View All</Text>
          </TouchableOpacity>
        </View>

        <View
          className="bg-white rounded-3xl p-4 relative overflow-hidden"
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />

          {classes.length > 0 ? (
            classes.slice(0, 3).map((classItem, index) => (
              <TouchableOpacity
                key={classItem.id}
                onPress={() => handleClassPress(classItem)}
                className={`py-4 ${index < Math.min(3, classes.length) - 1 ? "border-b border-emerald-100" : ""}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold">
                      {classItem.name}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-0.5">
                      {classItem.subject} • {classItem.grade_level}
                    </Text>
                    <View className="flex-row items-center mt-1.5 gap-3">
                      <View className="flex-row items-center">
                        <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mr-1">
                          <Ionicons
                            name="location-outline"
                            size={9}
                            color="#10B981"
                          />
                        </View>
                        <Text className="text-gray-400 text-xs">
                          {classItem.room}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mr-1">
                          <Ionicons
                            name="people-outline"
                            size={9}
                            color="#10B981"
                          />
                        </View>
                        <Text className="text-gray-400 text-xs">
                          {classItem.student_count} students
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center ml-3">
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#10B981"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-8 items-center">
              <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="school-outline" size={28} color="#10B981" />
              </View>
              <Text className="text-gray-500 font-medium">No classes yet</Text>
              <TouchableOpacity
                className="mt-4 bg-emerald-500 rounded-2xl px-6 py-3"
                onPress={() =>
                  router.push("/teachers/(drawers)/(tabs)/Classes")
                }
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <Text className="text-white font-bold">
                  Create Your First Class
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Recent Flashcards */}
      <View className="px-6 mt-6 mb-8">
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
            <Ionicons name="copy-outline" size={16} color="#10B981" />
          </View>
          <Text className="text-xl font-bold text-gray-900">My Flashcards</Text>
        </View>

        <View
          className="bg-white rounded-3xl p-4 relative overflow-hidden"
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />

          {flashcardSets.length > 0 ? (
            flashcardSets.slice(0, 3).map((flashcard, index) => (
              <TouchableOpacity
                key={flashcard.id}
                onPress={() => handleFlashcardPress(flashcard)}
                className={`py-4 ${index < Math.min(3, flashcardSets.length) - 1 ? "border-b border-emerald-100" : ""}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold">
                      {flashcard.title}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-0.5">
                      {flashcard.subject || "General"} •{" "}
                      {flashcard.flashcards?.length || 0} cards
                    </Text>
                    <View className="flex-row items-center mt-1.5">
                      <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mr-1">
                        <Ionicons
                          name="calendar-outline"
                          size={9}
                          color="#10B981"
                        />
                      </View>
                      <Text className="text-gray-400 text-xs">
                        Created:{" "}
                        {new Date(flashcard.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center ml-3">
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#10B981"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-8 items-center">
              <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="copy-outline" size={28} color="#10B981" />
              </View>
              <Text className="text-gray-500 font-medium">
                No flashcards yet
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
