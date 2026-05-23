import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface QuizResult {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_points: number;
  submitted_at: string;
  answers?: any[];
}

interface QuizDetails {
  id: string;
  title: string;
  description: string;
  question_count: number;
  due_date: string;
}

export default function QuizResult() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);

  // Get params
  const quizId = params.quizId as string;
  const studentId = params.studentId as string;
  const score = Number(params.score || 0);
  const totalPoints = Number(params.totalPoints || 0);
  const className = params.className as string;
  const quizTitle = params.quizTitle as string;

  // Calculate percentage
  const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

  // Determine grade and color based on percentage
  const getGradeInfo = (percentage: number) => {
    if (percentage >= 90) {
      return {
        grade: "Excellent",
        color: "#10B981",
        bgColor: "bg-emerald-100",
        icon: "trophy",
      };
    } else if (percentage >= 75) {
      return {
        grade: "Good",
        color: "#059669",
        bgColor: "bg-emerald-50",
        icon: "checkmark-circle",
      };
    } else if (percentage >= 60) {
      return {
        grade: "Satisfactory",
        color: "#F59E0B",
        bgColor: "bg-amber-50",
        icon: "warning",
      };
    } else {
      return {
        grade: "Needs Improvement",
        color: "#EF4444",
        bgColor: "bg-red-50",
        icon: "alert-circle",
      };
    }
  };

  const gradeInfo = getGradeInfo(percentage);

  // Fetch detailed quiz results
  const fetchQuizResults = async () => {
    try {
      setLoading(true);
      const response = await client.get(
        `/quiz-taking/${quizId}/results/${studentId}`,
      );

      if (response.data.success) {
        setQuizResult(response.data.data);
        // If answers are included in the response
        if (response.data.data.answers) {
          setAnswers(response.data.data.answers);
        }
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      // Even if API fails, we still have the passed params
    } finally {
      setLoading(false);
    }
  };

  // Fetch quiz details
  const fetchQuizDetails = async () => {
    try {
      const response = await client.get(`/quizzes/${quizId}`);
      if (response.data.success) {
        setQuizDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching quiz details:", error);
    }
  };

  useEffect(() => {
    if (quizId && studentId) {
      fetchQuizResults();
      fetchQuizDetails();
    }
  }, [quizId, studentId]);

  if (loading) {
    return (
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading results...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-emerald-50">
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

        <View>
          <Text className="text-3xl font-bold text-white mb-1">
            Quiz Results
          </Text>
          <Text className="text-emerald-100 text-base">{className}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className="p-6">
          {/* Quiz Title Card */}
          <View
            className="bg-white rounded-3xl p-6 mb-6 relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />
            <View className="absolute -bottom-3 -left-3 w-12 h-12 bg-emerald-50 rounded-full opacity-70" />

            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <Text className="text-gray-500 text-sm font-medium">
                Quiz Title
              </Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2 ml-13">
              {quizTitle}
            </Text>
            {quizDetails?.description && (
              <Text className="text-gray-600 text-sm leading-5 ml-13">
                {quizDetails.description}
              </Text>
            )}
          </View>

          {/* Score Card */}
          <View
            className="bg-white rounded-3xl p-8 mb-6 items-center relative overflow-hidden"
            style={{
              shadowColor: gradeInfo.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-50 rounded-full" />
            <View className="absolute -bottom-6 -left-6 w-20 h-20 bg-emerald-50 rounded-full opacity-70" />

            {/* Circular Progress */}
            <View className="relative mb-6">
              <View
                className="w-36 h-36 rounded-full items-center justify-center"
                style={{ backgroundColor: `${gradeInfo.color}15` }}
              >
                <View
                  className="w-28 h-28 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${gradeInfo.color}25` }}
                >
                  <Text
                    className="text-4xl font-bold"
                    style={{ color: gradeInfo.color }}
                  >
                    {Math.round(percentage)}%
                  </Text>
                </View>
              </View>
              <View className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {score} / {totalPoints}
            </Text>

            <View
              className={`${gradeInfo.bgColor} px-5 py-2 rounded-full mt-2`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={gradeInfo.icon as any}
                  size={18}
                  color={gradeInfo.color}
                />
                <Text
                  className="ml-2 font-bold"
                  style={{ color: gradeInfo.color }}
                >
                  {gradeInfo.grade}
                </Text>
              </View>
            </View>
          </View>

          {/* Performance Stats */}
          <View
            className="bg-white rounded-3xl p-6 mb-6 relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />

            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                <Ionicons
                  name="stats-chart-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                Performance Summary
              </Text>
            </View>

            <View className="ml-13">
              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-emerald-100">
                <Text className="text-gray-600 font-medium">
                  Score Percentage
                </Text>
                <View className="bg-emerald-100 rounded-full px-3 py-1">
                  <Text className="text-emerald-700 font-bold">
                    {Math.round(percentage)}%
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-emerald-100">
                <Text className="text-gray-600 font-medium">
                  Total Questions
                </Text>
                <Text className="text-gray-900 font-bold">
                  {quizDetails?.question_count || 0}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-emerald-100">
                <Text className="text-gray-600 font-medium">
                  Correct Answers
                </Text>
                <View className="bg-emerald-100 rounded-full px-3 py-1">
                  <Text className="text-emerald-700 font-bold">{score}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 font-medium">
                  Incorrect Answers
                </Text>
                <View className="bg-red-50 rounded-full px-3 py-1">
                  <Text className="text-red-600 font-bold">
                    {totalPoints - score}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View
            className="bg-white rounded-3xl p-6 mb-6 relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />

            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                <Ionicons
                  name="trending-up-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                Score Progress
              </Text>
            </View>

            <View className="ml-13">
              <View className="bg-emerald-100 rounded-full h-3 mb-2">
                <View
                  className="bg-emerald-500 rounded-full h-3"
                  style={{
                    width: `${percentage}%`,
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400 text-xs font-medium">0%</Text>
                <Text className="text-gray-400 text-xs font-medium">50%</Text>
                <Text className="text-gray-400 text-xs font-medium">100%</Text>
              </View>
            </View>
          </View>

          {/* Message based on performance */}
          <View
            className="bg-white rounded-3xl p-6 mb-6 relative overflow-hidden"
            style={{
              shadowColor: gradeInfo.color,
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
                  name="information-circle-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                {percentage >= 75
                  ? "Great Job! 🎉"
                  : percentage >= 60
                    ? "Keep Going! 💪"
                    : "Need More Practice 📚"}
              </Text>
            </View>
            <Text className="text-gray-600 leading-5 ml-13">
              {percentage >= 90
                ? "Excellent work! You've mastered this quiz. Keep up the great performance!"
                : percentage >= 75
                  ? "Good work! You have a solid understanding. Review the incorrect answers to improve further."
                  : percentage >= 60
                    ? "You're on the right track! Review the material and try again to boost your score."
                    : "Don't worry! Learning takes time. Review the quiz content and practice more to improve your score."}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-4 bg-emerald-500 rounded-2xl flex-row items-center justify-center"
              onPress={() => router.back()}
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="arrow-back" size={18} color="white" />
              </View>
              <Text className="text-white font-bold text-lg">
                Back to Class
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
