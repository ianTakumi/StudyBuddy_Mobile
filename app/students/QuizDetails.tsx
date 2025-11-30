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
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

interface Question {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false";
  points: number;
  options?: any[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  question_count: number;
  total_points: number;
  time_limit: number;
  due_date: string;
  quiz_type: string;
  questions: Question[];
}

interface Answer {
  questionId: string;
  answer: string;
}

export default function QuizDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const quizId = params.quizId as string;

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/quiz-taking/${quizId}/take`);

      if (response.data.success) {
        const quizData = response.data.data;
        setQuiz(quizData);

        if (quizData.time_limit) {
          setTimeLeft(quizData.time_limit * 60);
        }

        const initialAnswers = quizData.questions.map((question: Question) => ({
          questionId: question.id,
          answer: "",
        }));
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      Alert.alert("Error", "Failed to load quiz");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!quiz?.time_limit || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quiz]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) =>
      prev.map((item) =>
        item.questionId === questionId ? { ...item, answer } : item
      )
    );
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);

      const submissionData = {
        quiz_id: quizId,
        student_id: user.id,
        answers: answers,
        time_spent: quiz?.time_limit ? quiz.time_limit * 60 - timeLeft : 0,
      };

      const response = await client.post("/quiz-taking/submit", submissionData);

      if (response.data.success) {
        const result = response.data.data;
        Alert.alert(
          "Quiz Submitted!",
          `You scored ${result.score}/${result.total_points} points!`,
          [
            {
              text: "OK",
              onPress: () => router.back(), // Simple lang, balik lang sa previous screen
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      Alert.alert("Error", "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const startQuiz = () => {
    setShowInstructions(false);
  };

  const getCurrentAnswer = () => {
    const currentQuestion = quiz?.questions[currentQuestionIndex];
    return (
      answers.find((answer) => answer.questionId === currentQuestion?.id)
        ?.answer || ""
    );
  };

  const allQuestionsAnswered = () => {
    return answers.every((answer) => answer.answer.trim() !== "");
  };

  useEffect(() => {
    fetchQuizDetails();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text className="text-gray-600 mt-4">Loading quiz...</Text>
      </View>
    );
  }

  if (showInstructions && quiz) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-white px-6 pt-12 pb-6 border-b border-gray-200">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">
                {quiz.title}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 p-6">
          <View className="bg-blue-50 rounded-2xl p-6 mb-6">
            <Text className="text-xl font-bold text-blue-800 mb-4">
              Quiz Instructions
            </Text>

            <Text className="text-blue-800 mb-2">
              • {quiz.question_count} questions
            </Text>
            {quiz.time_limit > 0 && (
              <Text className="text-blue-800 mb-2">
                • Time limit: {quiz.time_limit} minutes
              </Text>
            )}
            <Text className="text-blue-800 mb-2">
              • Total points: {quiz.total_points}
            </Text>
            <Text className="text-blue-800">
              • Quiz Type:{" "}
              {quiz.quiz_type === "multiple_choice"
                ? "Multiple Choice"
                : "True/False"}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-green-500 rounded-2xl p-4 items-center"
            onPress={startQuiz}
          >
            <Text className="text-white font-bold text-lg">Start Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">Quiz not found</Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 text-center">
              {quiz.title}
            </Text>
            <Text className="text-gray-500 text-center text-sm">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </Text>
          </View>

          {quiz.time_limit > 0 && (
            <View className="bg-red-100 px-3 py-1 rounded-full">
              <Text className="text-red-600 font-bold">
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Question */}
      <ScrollView className="flex-1 p-6">
        <View className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-lg font-bold text-gray-800 flex-1 mr-4">
              {currentQuestion.question}
            </Text>
            <View className="bg-blue-100 px-2 py-1 rounded">
              <Text className="text-blue-800 text-sm">
                {currentQuestion.points} pts
              </Text>
            </View>
          </View>

          {/* Options */}
          {currentQuestion.type === "multiple_choice" && (
            <View className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    getCurrentAnswer() === option.option_text
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() =>
                    handleAnswerSelect(currentQuestion.id, option.option_text)
                  }
                >
                  <Text className="text-gray-800">{option.option_text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentQuestion.type === "true_false" && (
            <View className="space-y-3">
              {["True", "False"].map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`p-4 rounded-xl border-2 ${
                    getCurrentAnswer() === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() => handleAnswerSelect(currentQuestion.id, option)}
                >
                  <Text className="text-gray-800">{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View className="bg-white px-6 py-4 border-t border-gray-200">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            className={`px-6 py-3 rounded-lg ${
              currentQuestionIndex === 0 ? "bg-gray-300" : "bg-gray-500"
            }`}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text className="text-white font-medium">Previous</Text>
          </TouchableOpacity>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <TouchableOpacity
              className={`px-6 py-3 rounded-lg ${
                allQuestionsAnswered() ? "bg-green-500" : "bg-green-300"
              }`}
              onPress={handleSubmitQuiz}
              disabled={submitting || !allQuestionsAnswered()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-medium">Submit Quiz</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-blue-500 px-6 py-3 rounded-lg"
              onPress={handleNextQuestion}
            >
              <Text className="text-white font-medium">Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
