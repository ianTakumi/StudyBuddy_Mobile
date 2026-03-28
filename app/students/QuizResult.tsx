import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import client from "@/utils/axiosInstance";

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
      return { grade: "Excellent", color: "#10B981", icon: "trophy" };
    } else if (percentage >= 75) {
      return { grade: "Good", color: "#3B82F6", icon: "checkmark-circle" };
    } else if (percentage >= 60) {
      return { grade: "Satisfactory", color: "#F59E0B", icon: "warning" };
    } else {
      return {
        grade: "Needs Improvement",
        color: "#EF4444",
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
      <View className="flex-1 bg-blue-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-blue-600 mt-4">Loading results...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-50">
      {/* Header */}
      <View className="bg-blue-500 pt-12 pb-6 px-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-white ml-2 font-medium">Back</Text>
        </TouchableOpacity>

        <View>
          <Text className="text-2xl font-bold text-white mb-1">
            Quiz Results
          </Text>
          <Text className="text-blue-100">{className}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className="p-6">
          {/* Quiz Title Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-blue-100">
            <Text className="text-gray-500 text-sm mb-2">Quiz Title</Text>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {quizTitle}
            </Text>
            {quizDetails?.description && (
              <Text className="text-gray-600 text-sm leading-5">
                {quizDetails.description}
              </Text>
            )}
          </View>

          {/* Score Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-blue-100 items-center">
            <View className="w-32 h-32 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Text className="text-4xl font-bold text-blue-600">
                {Math.round(percentage)}%
              </Text>
            </View>

            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {score} / {totalPoints}
            </Text>

            <View
              className={`bg-${gradeInfo.color.replace("#", "")}/10 px-4 py-2 rounded-full mt-2`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={gradeInfo.icon as any}
                  size={18}
                  color={gradeInfo.color}
                />
                <Text
                  className={`ml-2 font-semibold`}
                  style={{ color: gradeInfo.color }}
                >
                  {gradeInfo.grade}
                </Text>
              </View>
            </View>
          </View>

          {/* Performance Stats */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-blue-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Performance Summary
            </Text>

            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <Text className="text-gray-600">Score Percentage</Text>
              <Text className="text-blue-600 font-bold">
                {Math.round(percentage)}%
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <Text className="text-gray-600">Total Questions</Text>
              <Text className="text-gray-900 font-medium">
                {quizDetails?.question_count || 0}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <Text className="text-gray-600">Correct Answers</Text>
              <Text className="text-green-600 font-bold">{score}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Incorrect Answers</Text>
              <Text className="text-red-600 font-bold">
                {totalPoints - score}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-blue-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Score Progress
            </Text>
            <View className="bg-gray-200 rounded-full h-3 mb-2">
              <View
                className="bg-blue-500 rounded-full h-3"
                style={{ width: `${percentage}%` }}
              />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-xs">0%</Text>
              <Text className="text-gray-500 text-xs">50%</Text>
              <Text className="text-gray-500 text-xs">100%</Text>
            </View>
          </View>

          {/* Message based on performance */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-blue-100">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#3B82F6"
              />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                {percentage >= 75
                  ? "Great Job! 🎉"
                  : percentage >= 60
                    ? "Keep Going! 💪"
                    : "Need More Practice 📚"}
              </Text>
            </View>
            <Text className="text-gray-600 leading-5">
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
              className="flex-1 py-4 bg-blue-500 rounded-xl flex-row items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Back to Class
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
