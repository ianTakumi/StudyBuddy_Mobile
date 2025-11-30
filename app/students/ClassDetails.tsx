import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

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
  has_submission?: boolean; // NEW: to check if student already submitted
  submission_id?: string; // NEW: submission ID if exists
}

interface QuizSubmission {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_points: number;
  submitted_at: string;
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

  // Extract class details from params
  const classDetails = {
    id: params.id as string,
    className: params.className as string,
    subject: params.subject as string,
    gradeLevel: params.gradeLevel as string,
    schedule: params.schedule as string,
    room: params.room as string,
    description: params.description as string,
    classCode: params.classCode as string,
    teacherName: params.teacherName as string,
  };

  const fetchClassData = async () => {
    try {
      setLoading(true);

      // Fetch students in this class using the specific API endpoint
      const studentsResponse = await client.get(
        `classes/${user.id}/${classDetails.id}/classmates`
      );

      if (studentsResponse.data.success) {
        setStudents(studentsResponse.data.data || []);
      } else {
        setStudents([]);
      }

      // Fetch quizzes for this class using the specific API endpoint
      const quizzesResponse = await client.get(`/quizzes/${classDetails.id}`);

      if (quizzesResponse.data.success) {
        const quizzesData = quizzesResponse.data.data || [];

        // Check submissions for each quiz
        const quizzesWithSubmissions = await Promise.all(
          quizzesData.map(async (quiz: Quiz) => {
            try {
              // Check if student already submitted this quiz
              const submissionResponse = await client.get(
                `/quiz-taking/${quiz.id}/results/${user.id}`
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
              // If no submission found, return quiz as is
              return {
                ...quiz,
                has_submission: false,
                status: quiz.status === "published" ? "published" : "draft",
              };
            }
          })
        );

        setQuizzes(quizzesWithSubmissions);
      } else {
        setQuizzes([]);
      }
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
        [{ text: "OK" }]
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
      pathname: "/quiz-results",
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

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text className="text-gray-600 mt-4">Loading class details...</Text>
      </View>
    );
  }

  const renderOverview = () => (
    <View className="space-y-6">
      {/* Class Information Card */}
      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Class Information
        </Text>

        <View className="space-y-3">
          <View className="flex-row items-center">
            <Ionicons name="book-outline" size={20} color="#4A90E2" />
            <Text className="text-gray-600 ml-3 flex-1">Subject:</Text>
            <Text className="font-semibold text-gray-800">
              {classDetails.subject}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="school-outline" size={20} color="#4A90E2" />
            <Text className="text-gray-600 ml-3 flex-1">Grade Level:</Text>
            <Text className="font-semibold text-gray-800">
              {classDetails.gradeLevel}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={20} color="#4A90E2" />
            <Text className="text-gray-600 ml-3 flex-1">Schedule:</Text>
            <Text className="font-semibold text-gray-800">
              {classDetails.schedule}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={20} color="#4A90E2" />
            <Text className="text-gray-600 ml-3 flex-1">Room:</Text>
            <Text className="font-semibold text-gray-800">
              {classDetails.room}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={20} color="#4A90E2" />
            <Text className="text-gray-600 ml-3 flex-1">Teacher:</Text>
            <Text className="font-semibold text-gray-800">
              {classDetails.teacherName}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="key-outline" size={20} color="#4A90E2" />
            <Text className="text-gray-600 ml-3 flex-1">Class Code:</Text>
            <Text className="font-semibold text-gray-800 bg-blue-50 px-2 py-1 rounded">
              {classDetails.classCode}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {classDetails.description && (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-bold text-gray-800 mb-3">
            Description
          </Text>
          <Text className="text-gray-600 leading-6">
            {classDetails.description}
          </Text>
        </View>
      )}

      {/* Quick Stats */}
      <View className="flex-row justify-between space-x-4">
        <View className="bg-blue-50 rounded-2xl p-4 flex-1 items-center">
          <Text className="text-2xl font-bold text-blue-600">
            {students.length}
          </Text>
          <Text className="text-blue-800 text-sm mt-1">Students</Text>
        </View>

        <View className="bg-green-50 rounded-2xl p-4 flex-1 items-center">
          <Text className="text-2xl font-bold text-green-600">
            {quizzes.length}
          </Text>
          <Text className="text-green-800 text-sm mt-1">Quizzes</Text>
        </View>

        <View className="bg-purple-50 rounded-2xl p-4 flex-1 items-center">
          <Text className="text-2xl font-bold text-purple-600">
            {quizzes.filter((q) => q.has_submission).length}
          </Text>
          <Text className="text-purple-800 text-sm mt-1">Completed</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row space-x-4">
        <TouchableOpacity
          className="bg-blue-500 rounded-2xl p-4 flex-1 items-center"
          onPress={() => setActiveTab("quizzes")}
        >
          <Ionicons name="document-text-outline" size={24} color="white" />
          <Text className="text-white font-semibold mt-2">View Quizzes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-500 rounded-2xl p-4 flex-1 items-center"
          onPress={() => setActiveTab("students")}
        >
          <Ionicons name="people-outline" size={24} color="white" />
          <Text className="text-white font-semibold mt-2">View Students</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStudents = () => (
    <View className="space-y-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-semibold text-gray-700">
          Classmates ({students.length})
        </Text>
        <TouchableOpacity onPress={() => setActiveTab("overview")}>
          <Text className="text-blue-500 font-medium">Back to Overview</Text>
        </TouchableOpacity>
      </View>

      {students.length === 0 ? (
        <View className="bg-gray-50 rounded-2xl p-8 items-center justify-center">
          <Ionicons name="people-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-lg mt-4 text-center">
            No students enrolled yet
          </Text>
        </View>
      ) : (
        students.map((student) => (
          <TouchableOpacity
            key={student.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            onPress={() => viewStudentProfile(student)}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Text className="text-blue-600 font-bold text-lg">
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

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderQuizzes = () => (
    <View className="space-y-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-semibold text-gray-700">
          Quizzes ({quizzes.length})
        </Text>
        <TouchableOpacity onPress={() => setActiveTab("overview")}>
          <Text className="text-blue-500 font-medium">Back to Overview</Text>
        </TouchableOpacity>
      </View>

      {quizzes.length === 0 ? (
        <View className="bg-gray-50 rounded-2xl p-8 items-center justify-center">
          <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-lg mt-4 text-center">
            No quizzes available yet
          </Text>
        </View>
      ) : (
        quizzes.map((quiz) => (
          <TouchableOpacity
            key={quiz.id}
            className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${
              quiz.has_submission ? "opacity-90" : ""
            }`}
            onPress={() =>
              quiz.has_submission ? viewQuizResults(quiz) : takeQuiz(quiz)
            }
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-bold text-gray-800 text-lg flex-1 mr-2">
                {quiz.title}
              </Text>

              {quiz.has_submission ? (
                <View className="bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-green-800 text-xs font-medium">
                    Completed
                  </Text>
                </View>
              ) : quiz.status === "published" ? (
                <View className="bg-blue-100 px-2 py-1 rounded-full">
                  <Text className="text-blue-800 text-xs font-medium">
                    Available
                  </Text>
                </View>
              ) : (
                <View className="bg-gray-100 px-2 py-1 rounded-full">
                  <Text className="text-gray-800 text-xs font-medium">
                    Draft
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-gray-600 mb-3">{quiz.description}</Text>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons
                  name="help-circle-outline"
                  size={16}
                  color="#6B7280"
                />
                <Text className="text-gray-500 text-sm ml-1">
                  {quiz.question_count} questions
                </Text>
              </View>

              {quiz.due_date && (
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text className="text-gray-500 text-sm ml-1">
                    Due: {new Date(quiz.due_date).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Show score if quiz is completed */}
            {quiz.has_submission &&
              quiz.score !== undefined &&
              quiz.total_points !== undefined && (
                <View className="mt-3">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-gray-600 text-sm">Your Score:</Text>
                    <Text className="text-green-600 font-semibold">
                      {quiz.score}/{quiz.total_points}
                    </Text>
                  </View>
                  <View className="bg-gray-200 rounded-full h-2">
                    <View
                      className="bg-green-500 rounded-full h-2"
                      style={{
                        width: `${(quiz.score / quiz.total_points) * 100}%`,
                      }}
                    />
                  </View>
                  <Text className="text-gray-400 text-xs mt-1 text-center">
                    Tap to view results
                  </Text>
                </View>
              )}

            {/* Show take quiz button if not completed */}
            {!quiz.has_submission && quiz.status === "published" && (
              <View className="mt-3">
                <Text className="text-blue-600 text-sm text-center">
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
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-6 shadow-sm border-b border-gray-200">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">
              {classDetails.className}
            </Text>
            <Text className="text-gray-500">{classDetails.subject}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-gray-200">
          {[
            { key: "overview", label: "Overview", icon: "information-circle" },
            { key: "students", label: "Students", icon: "people" },
            { key: "quizzes", label: "Quizzes", icon: "document-text" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === tab.key ? "border-blue-500" : "border-transparent"
              }`}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.key ? "#4A90E2" : "#9CA3AF"}
              />
              <Text
                className={`text-sm font-medium mt-1 ${
                  activeTab === tab.key ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 p-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" && renderOverview()}
        {activeTab === "students" && renderStudents()}
        {activeTab === "quizzes" && renderQuizzes()}
      </ScrollView>
    </View>
  );
}
