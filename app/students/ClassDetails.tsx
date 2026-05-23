import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  question_count: number;
  due_date: string;
  created_at: string;
  status: "draft" | "published" | "completed";
  score?: number;
  total_points?: number;
  has_submission?: boolean;
  submission_id?: string;
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
  class_id: string;
  created_at: string;
  card_count: number;
}

export default function ClassDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "quizzes"
  >("overview");
  const [showClassCodeModal, setShowClassCodeModal] = useState(false);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

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

  // Extract class details from params
  const classDetails = {
    id: params.id as string,
    className: params.className as string,
    subject: params.subject as string,
    gradeLevel: params.gradeLevel as string,
    schedule: parseSchedule(params.schedule as string),
    room: params.room as string,
    description: params.description as string,
    classCode: params.classCode as string,
    teacherName: params.teacherName as string,
  };

  // Helper function to format schedule for display
  const formatSchedule = (schedule: ScheduleItem[]): string => {
    if (!schedule || schedule.length === 0) return "No schedule set";

    return schedule
      .map((item) => {
        return `${item.day} ${item.startTime}${item.startApm} - ${item.endTime}${item.endApm}`;
      })
      .join(", ");
  };

  // Fetch flashcards for this class
  const fetchFlashcardsForClass = async () => {
    try {
      setLoadingFlashcards(true);
      const response = await client.get(
        `/flashcards-class/class/${classDetails.id}`,
      );

      if (response.data.success) {
        setFlashcardSets(response.data.data || []);
      } else {
        setFlashcardSets([]);
      }
    } catch (error: any) {
      console.error("Error fetching flashcards:", error);
      setFlashcardSets([]);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const fetchClassData = async () => {
    try {
      setLoading(true);

      // Fetch students in this class
      const studentsResponse = await client.get(
        `classes/${user.id}/${classDetails.id}/classmates`,
      );

      if (studentsResponse.data.success) {
        setStudents(studentsResponse.data.data || []);
      } else {
        setStudents([]);
      }

      // Fetch quizzes for this class
      const quizzesResponse = await client.get(`/quizzes/${classDetails.id}`);

      if (quizzesResponse.data.success) {
        const quizzesData = quizzesResponse.data.data || [];

        // Check submissions for each quiz
        const quizzesWithSubmissions = await Promise.all(
          quizzesData.map(async (quiz: Quiz) => {
            try {
              const submissionResponse = await client.get(
                `/quiz-taking/${quiz.id}/results/${user.id}`,
              );

              if (
                submissionResponse.data.success &&
                submissionResponse.data.data
              ) {
                const submission = submissionResponse.data.data;
                return {
                  ...quiz,
                  has_submission: true,
                  submission_id: submission.id,
                  score: submission.score,
                  total_points: submission.total_points,
                  status: "completed" as const,
                };
              }

              return {
                ...quiz,
                has_submission: false,
                status: quiz.status === "published" ? "published" : "draft",
              };
            } catch (error) {
              return {
                ...quiz,
                has_submission: false,
                status: quiz.status === "published" ? "published" : "draft",
              };
            }
          }),
        );

        setQuizzes(quizzesWithSubmissions);
      } else {
        setQuizzes([]);
      }

      // Fetch flashcards for this class
      await fetchFlashcardsForClass();
    } catch (error) {
      console.error("Error fetching class data:", error);
      Alert.alert("Error", "Failed to load class details");
      setStudents([]);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClassData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user?.id && classDetails.id) {
      fetchClassData();
    }
  }, [user?.id, classDetails.id]);

  const takeQuiz = (quiz: Quiz) => {
    if (quiz.has_submission) {
      Alert.alert(
        "Quiz Already Submitted",
        "You have already completed this quiz. You cannot retake it.",
        [{ text: "OK" }],
      );
      return;
    }

    router.push({
      pathname: "/students/QuizDetails",
      params: {
        quizId: quiz.id,
        quizTitle: quiz.title,
        classId: classDetails.id,
        className: classDetails.className,
      },
    });
  };

  const viewQuizResults = (quiz: Quiz) => {
    if (!quiz.has_submission) return;

    router.push({
      pathname: "/students/QuizResult",
      params: {
        quizId: quiz.id,
        studentId: user.id,
        score: quiz.score || 0,
        totalPoints: quiz.total_points || 0,
        className: classDetails.className,
        quizTitle: quiz.title,
      },
    });
  };

  const viewStudentProfile = (student: Student) => {
    router.push({
      pathname: "/students/StudentProfile",
      params: {
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        studentEmail: student.email,
      },
    });
  };

  const copyClassCode = async () => {
    await Clipboard.setStringAsync(classDetails.classCode);
  };

  const viewFlashcardSet = (flashcardSet: FlashcardSet) => {
    setShowFlashcardsModal(false);
    router.push({
      pathname: "/students/FlashCardClassDetails",
      params: {
        id: flashcardSet.id,
        title: flashcardSet.title,
        className: classDetails.className,
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading class details...
        </Text>
      </View>
    );
  }

  const renderOverview = () => (
    <View className="gap-6">
      {/* Class Information Card */}
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

        <View className="gap-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-emerald-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="book-outline" size={22} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs font-medium">Subject</Text>
              <Text className="text-gray-900 font-semibold text-base">
                {classDetails.subject}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-emerald-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="school-outline" size={22} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs font-medium">
                Grade Level
              </Text>
              <Text className="text-gray-900 font-semibold text-base">
                {classDetails.gradeLevel}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-emerald-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="time-outline" size={22} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs font-medium">
                Schedule
              </Text>
              <Text className="text-gray-900 font-semibold text-base">
                {formatSchedule(classDetails.schedule)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-emerald-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="location-outline" size={22} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs font-medium">Room</Text>
              <Text className="text-gray-900 font-semibold text-base">
                {classDetails.room}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-emerald-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="person-outline" size={22} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs font-medium">Teacher</Text>
              <Text className="text-gray-900 font-semibold text-base">
                {classDetails.teacherName}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setShowClassCodeModal(true)}
          >
            <View className="w-12 h-12 bg-emerald-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="key-outline" size={22} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs font-medium">
                Class Code
              </Text>
              <Text className="text-gray-900 font-semibold text-base font-mono">
                {classDetails.classCode}
              </Text>
            </View>
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
              <Ionicons name="copy-outline" size={16} color="#10B981" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      {classDetails.description && (
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
          <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#10B981"
              />
            </View>
            <Text className="text-xl font-bold text-gray-900">Description</Text>
          </View>
          <View className="bg-emerald-50 rounded-2xl p-4">
            <Text className="text-gray-800 leading-6">
              {classDetails.description}
            </Text>
          </View>
        </View>
      )}

      {/* Quick Stats */}
      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] mb-3">
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
              <Ionicons name="people-outline" size={20} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {students.length}
            </Text>
            <Text className="text-gray-500 text-sm font-medium">
              Classmates
            </Text>
          </View>
        </View>

        <View className="w-[48%] mb-3">
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
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#059669"
              />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {quizzes.length}
            </Text>
            <Text className="text-gray-500 text-sm font-medium">
              Total Quizzes
            </Text>
          </View>
        </View>

        <View className="w-[48%]">
          <View
            className="bg-white rounded-2xl p-4 relative overflow-hidden"
            style={{
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute -top-2 -right-2 w-10 h-10 bg-purple-100 rounded-full opacity-50" />
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="flash-outline" size={20} color="#8B5CF6" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {flashcardSets.length}
            </Text>
            <Text className="text-gray-500 text-sm font-medium">
              Flashcard Sets
            </Text>
          </View>
        </View>

        <View className="w-[48%]">
          <View
            className="bg-white rounded-2xl p-4 relative overflow-hidden"
            style={{
              shadowColor: "#F97316",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute -top-2 -right-2 w-10 h-10 bg-orange-100 rounded-full opacity-50" />
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="trending-up-outline" size={20} color="#F97316" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {quizzes.length > 0
                ? Math.round(
                    (quizzes.filter((q) => q.has_submission).length /
                      quizzes.length) *
                      100,
                  )
                : 0}
              %
            </Text>
            <Text className="text-gray-500 text-sm font-medium">
              Completion Rate
            </Text>
          </View>
        </View>
      </View>

      {/* Flashcards Section */}
      {flashcardSets.length > 0 && (
        <View
          className="bg-white rounded-3xl p-6 relative overflow-hidden"
          style={{
            shadowColor: "#8B5CF6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          <View className="absolute -top-6 -right-6 w-20 h-20 bg-purple-50 rounded-full" />

          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="flash-outline" size={20} color="#8B5CF6" />
              </View>
              <Text className="text-xl font-bold text-gray-900">
                Flashcards
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowFlashcardsModal(true)}>
              <Text className="text-purple-600 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {flashcardSets.slice(0, 3).map((set) => (
                <TouchableOpacity
                  key={set.id}
                  className="bg-purple-50 rounded-2xl p-4 w-48 relative overflow-hidden"
                  onPress={() => viewFlashcardSet(set)}
                >
                  <View className="absolute -top-3 -right-3 w-10 h-10 bg-purple-100 rounded-full opacity-50" />
                  <View className="bg-purple-100 rounded-full p-2 w-10 h-10 items-center justify-center mb-3">
                    <Ionicons name="flash-outline" size={20} color="#8B5CF6" />
                  </View>
                  <Text
                    className="font-bold text-gray-900 mb-1"
                    numberOfLines={1}
                  >
                    {set.title}
                  </Text>
                  <Text
                    className="text-gray-500 text-xs mb-2"
                    numberOfLines={2}
                  >
                    {set.description || "No description"}
                  </Text>
                  <View className="bg-purple-100 rounded-full px-3 py-1 self-start">
                    <Text className="text-purple-600 text-xs font-semibold">
                      {set.card_count} cards
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderStudents = () => (
    <View className="gap-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
            <Ionicons name="people-outline" size={16} color="#10B981" />
          </View>
          <Text className="text-lg font-bold text-gray-700">
            Classmates ({students.length})
          </Text>
        </View>
        <TouchableOpacity onPress={() => setActiveTab("overview")}>
          <Text className="text-emerald-600 font-semibold">
            Back to Overview
          </Text>
        </TouchableOpacity>
      </View>

      {students.length === 0 ? (
        <View
          className="bg-white rounded-3xl p-8 items-center justify-center relative overflow-hidden"
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
          <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="people-outline" size={36} color="#10B981" />
          </View>
          <Text className="text-gray-800 text-lg font-bold text-center">
            No students enrolled yet
          </Text>
        </View>
      ) : (
        students.map((student) => (
          <TouchableOpacity
            key={student.id}
            className="bg-white rounded-3xl p-4 relative overflow-hidden"
            onPress={() => viewStudentProfile(student)}
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-50 rounded-full opacity-70" />
            <View className="flex-row items-center">
              <View className="bg-emerald-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Text className="text-emerald-600 font-bold text-lg">
                  {student.first_name?.[0]}
                  {student.last_name?.[0]}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="font-semibold text-gray-800 text-lg">
                  {student.first_name} {student.last_name}
                </Text>
                <Text className="text-gray-500 text-sm">{student.email}</Text>
              </View>

              <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
                <Ionicons name="chevron-forward" size={16} color="#10B981" />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderQuizzes = () => (
    <View className="gap-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
            <Ionicons name="document-text-outline" size={16} color="#10B981" />
          </View>
          <Text className="text-lg font-bold text-gray-700">
            Quizzes ({quizzes.length})
          </Text>
        </View>
        <TouchableOpacity onPress={() => setActiveTab("overview")}>
          <Text className="text-emerald-600 font-semibold">
            Back to Overview
          </Text>
        </TouchableOpacity>
      </View>

      {quizzes.length === 0 ? (
        <View
          className="bg-white rounded-3xl p-8 items-center justify-center relative overflow-hidden"
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
          <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="document-text-outline" size={36} color="#10B981" />
          </View>
          <Text className="text-gray-800 text-lg font-bold text-center">
            No quizzes available yet
          </Text>
        </View>
      ) : (
        quizzes.map((quiz) => (
          <TouchableOpacity
            key={quiz.id}
            className={`bg-white rounded-3xl p-5 relative overflow-hidden ${
              quiz.has_submission ? "opacity-90" : ""
            }`}
            onPress={() =>
              quiz.has_submission ? viewQuizResults(quiz) : takeQuiz(quiz)
            }
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full opacity-70" />

            <View className="flex-row justify-between items-start mb-3">
              <Text className="font-bold text-gray-800 text-lg flex-1 mr-2">
                {quiz.title}
              </Text>

              {quiz.has_submission ? (
                <View className="bg-emerald-100 px-3 py-1 rounded-full">
                  <Text className="text-emerald-700 text-xs font-semibold">
                    Completed
                  </Text>
                </View>
              ) : quiz.status === "published" ? (
                <View className="bg-emerald-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-semibold">
                    Available
                  </Text>
                </View>
              ) : (
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-gray-700 text-xs font-semibold">
                    Draft
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-gray-600 mb-3">{quiz.description}</Text>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                  <Ionicons
                    name="help-circle-outline"
                    size={12}
                    color="#10B981"
                  />
                </View>
                <Text className="text-gray-500 text-sm">
                  {quiz.question_count} questions
                </Text>
              </View>

              {quiz.due_date && (
                <View className="flex-row items-center">
                  <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-gray-500 text-sm">
                    Due: {new Date(quiz.due_date).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Show score if quiz is completed */}
            {quiz.has_submission &&
              quiz.score !== undefined &&
              quiz.total_points !== undefined && (
                <View className="mt-4 pt-4 border-t border-emerald-100">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-600 text-sm font-medium">
                      Your Score:
                    </Text>
                    <Text className="text-emerald-600 font-bold">
                      {quiz.score}/{quiz.total_points}
                    </Text>
                  </View>
                  <View className="bg-emerald-100 rounded-full h-2.5">
                    <View
                      className="bg-emerald-500 rounded-full h-2.5"
                      style={{
                        width: `${(quiz.score / quiz.total_points) * 100}%`,
                      }}
                    />
                  </View>
                  <Text className="text-emerald-500 text-xs mt-2 text-center font-medium">
                    Tap to view results
                  </Text>
                </View>
              )}

            {/* Show take quiz button if not completed */}
            {!quiz.has_submission && quiz.status === "published" && (
              <View className="mt-4 pt-4 border-t border-emerald-100">
                <Text className="text-emerald-600 text-sm text-center font-semibold">
                  Tap to take quiz
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  return (
    <>
      <ScrollView
        className="flex-1 bg-emerald-50"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
          />
        }
      >
        {/* Header Section with Back Button */}
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
          {/* Decorative Circles */}
          <View className="absolute top-8 left-6 w-16 h-16 bg-emerald-400/30 rounded-full" />
          <View className="absolute top-20 right-10 w-24 h-24 bg-emerald-400/20 rounded-full" />
          <View className="absolute bottom-4 left-20 w-12 h-12 bg-emerald-300/40 rounded-full" />
          <View className="absolute top-14 right-32 w-8 h-8 bg-emerald-300/50 rounded-full" />

          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-2">
              <Ionicons name="arrow-back" size={18} color="white" />
            </View>
            <Text className="text-white font-medium">Back</Text>
          </TouchableOpacity>

          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white mb-2">
                {classDetails.className}
              </Text>
              <Text className="text-emerald-100 text-lg font-medium">
                {classDetails.subject}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="bg-white px-6 pt-4">
          <View className="flex-row">
            {[
              {
                key: "overview",
                label: "Overview",
                icon: "information-circle",
              },
              { key: "students", label: "Students", icon: "people" },
              { key: "quizzes", label: "Quizzes", icon: "document-text" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                className={`flex-1 py-3 items-center border-b-2 ${
                  activeTab === tab.key
                    ? "border-emerald-500"
                    : "border-transparent"
                }`}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={activeTab === tab.key ? "#10B981" : "#9CA3AF"}
                />
                <Text
                  className={`text-sm font-semibold mt-1 ${
                    activeTab === tab.key ? "text-emerald-600" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <View className="px-6 py-6">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "students" && renderStudents()}
          {activeTab === "quizzes" && renderQuizzes()}
        </View>
      </ScrollView>

      {/* Class Code Modal */}
      <Modal
        visible={showClassCodeModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className="bg-white rounded-3xl p-8 mx-4 w-11/12 relative overflow-hidden"
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

            <View className="items-center mb-6">
              <View
                className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <Ionicons name="key-outline" size={36} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Class Code
              </Text>
              <Text className="text-gray-600 text-center">
                Use this code to share this class with students
              </Text>
            </View>

            <View className="bg-emerald-50 rounded-2xl p-5 mb-6">
              <Text className="text-3xl font-mono font-bold text-center text-emerald-700">
                {classDetails.classCode}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                onPress={() => setShowClassCodeModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Close
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 px-4 bg-emerald-500 rounded-2xl"
                onPress={copyClassCode}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Text className="text-white font-bold text-center">
                  Copy Code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Flashcards Modal */}
      <Modal
        visible={showFlashcardsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFlashcardsModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-white rounded-t-3xl">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <View className="bg-purple-100 rounded-full p-2 mr-3">
                    <Ionicons name="flash-outline" size={22} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text className="text-2xl font-bold text-gray-900">
                      Flashcards
                    </Text>
                    <Text className="text-gray-500">
                      {classDetails.className}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowFlashcardsModal(false)}
                  className="bg-gray-100 rounded-full p-2"
                >
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="flex-1 p-6">
              {loadingFlashcards ? (
                <View className="py-12 items-center">
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text className="text-gray-500 mt-4 font-medium">
                    Loading flashcards...
                  </Text>
                </View>
              ) : flashcardSets.length === 0 ? (
                <View className="bg-gray-50 rounded-3xl p-8 items-center relative overflow-hidden">
                  <View className="absolute -top-6 -right-6 w-16 h-16 bg-purple-50 rounded-full" />
                  <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="flash-outline" size={36} color="#8B5CF6" />
                  </View>
                  <Text className="text-gray-800 text-lg font-bold text-center">
                    No Flashcards Yet
                  </Text>
                  <Text className="text-gray-500 text-sm text-center mt-2">
                    Your teacher hasn't created any flashcards for this class
                    yet.
                  </Text>
                </View>
              ) : (
                flashcardSets.map((set) => (
                  <TouchableOpacity
                    key={set.id}
                    className="bg-white rounded-3xl p-6 mb-4 relative overflow-hidden"
                    onPress={() => viewFlashcardSet(set)}
                    style={{
                      shadowColor: "#8B5CF6",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 16,
                      elevation: 5,
                    }}
                  >
                    <View className="absolute -top-4 -right-4 w-16 h-16 bg-purple-50 rounded-full opacity-70" />

                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-lg">
                          {set.title}
                        </Text>
                        {set.description && (
                          <Text className="text-gray-500 text-sm mt-1">
                            {set.description}
                          </Text>
                        )}
                      </View>
                      <View className="bg-purple-100 rounded-full px-3 py-1">
                        <Text className="text-purple-700 text-xs font-bold">
                          {set.card_count} cards
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between items-center pt-3 border-t border-purple-100">
                      <View className="flex-row items-center">
                        <View className="w-4 h-4 bg-purple-100 rounded-full items-center justify-center mr-1">
                          <Ionicons
                            name="calendar-outline"
                            size={9}
                            color="#8B5CF6"
                          />
                        </View>
                        <Text className="text-gray-400 text-xs">
                          Created:{" "}
                          {new Date(set.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-purple-600 text-sm font-semibold mr-1">
                          Start Studying
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={14}
                          color="#8B5CF6"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
