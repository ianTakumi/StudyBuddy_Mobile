import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

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
        item.questionId === questionId ? { ...item, answer } : item,
      ),
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
              onPress: () => router.back(),
            },
          ],
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
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading quiz...
        </Text>
      </View>
    );
  }

  if (showInstructions && quiz) {
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

          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-2">
              <Ionicons name="arrow-back" size={18} color="white" />
            </View>
            <Text className="text-white font-medium">Back</Text>
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-white">{quiz.title}</Text>
        </View>

        <ScrollView className="flex-1 p-6">
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
                Quiz Instructions
              </Text>
            </View>

            <View className="gap-3 ml-13">
              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mr-2">
                  <Ionicons
                    name="help-circle-outline"
                    size={14}
                    color="#10B981"
                  />
                </View>
                <Text className="text-gray-700 font-medium">
                  {quiz.question_count} questions
                </Text>
              </View>

              {quiz.time_limit > 0 && (
                <View className="flex-row items-center">
                  <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mr-2">
                    <Ionicons name="timer-outline" size={14} color="#10B981" />
                  </View>
                  <Text className="text-gray-700 font-medium">
                    Time limit: {quiz.time_limit} minutes
                  </Text>
                </View>
              )}

              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mr-2">
                  <Ionicons name="star-outline" size={14} color="#10B981" />
                </View>
                <Text className="text-gray-700 font-medium">
                  Total points: {quiz.total_points}
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mr-2">
                  <Ionicons name="grid-outline" size={14} color="#10B981" />
                </View>
                <Text className="text-gray-700 font-medium">
                  Quiz Type:{" "}
                  {quiz.quiz_type === "multiple_choice"
                    ? "Multiple Choice"
                    : "True/False"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="bg-emerald-500 rounded-2xl p-4 items-center"
            onPress={startQuiz}
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="play" size={18} color="white" />
              </View>
              <Text className="text-white font-bold text-lg">Start Quiz</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="alert-circle-outline" size={36} color="#10B981" />
        </View>
        <Text className="text-gray-800 font-bold text-lg">Quiz not found</Text>
        <TouchableOpacity
          className="bg-emerald-500 px-8 py-3 rounded-2xl mt-4"
          onPress={() => router.back()}
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <View className="flex-1 bg-emerald-50">
      {/* Header */}
      <View
        className="bg-white px-6 pt-16 pb-4"
        style={{
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#10B981" />
          </TouchableOpacity>

          <View className="flex-1 mx-4">
            <Text className="text-xl font-bold text-gray-800 text-center">
              {quiz.title}
            </Text>
            <View className="bg-emerald-100 rounded-full px-3 py-1 mt-1 self-center">
              <Text className="text-emerald-600 text-sm font-semibold">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </Text>
            </View>
          </View>

          {quiz.time_limit > 0 && (
            <View
              className="bg-red-50 px-4 py-2 rounded-full flex-row items-center"
              style={{
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="timer-outline" size={16} color="#EF4444" />
              <Text className="text-red-600 font-bold ml-1.5">
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Question */}
      <ScrollView className="flex-1 p-6">
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

          <View className="flex-row justify-between items-start mb-6">
            <Text className="text-lg font-bold text-gray-800 flex-1 mr-4 leading-7">
              {currentQuestion.question}
            </Text>
            <View className="bg-emerald-100 rounded-full px-3 py-1">
              <Text className="text-emerald-700 text-sm font-bold">
                {currentQuestion.points} pts
              </Text>
            </View>
          </View>

          {/* Options */}
          {currentQuestion.type === "multiple_choice" && (
            <View className="gap-3">
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  className={`p-5 rounded-2xl border-2 ${
                    getCurrentAnswer() === option.option_text
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-emerald-100 bg-white"
                  }`}
                  onPress={() =>
                    handleAnswerSelect(currentQuestion.id, option.option_text)
                  }
                  style={
                    getCurrentAnswer() === option.option_text
                      ? {
                          shadowColor: "#10B981",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 8,
                          elevation: 3,
                        }
                      : {}
                  }
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        getCurrentAnswer() === option.option_text
                          ? "bg-emerald-500"
                          : "bg-emerald-100"
                      }`}
                    >
                      <Text
                        className={`font-bold ${
                          getCurrentAnswer() === option.option_text
                            ? "text-white"
                            : "text-emerald-600"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text
                      className={`text-base flex-1 ${
                        getCurrentAnswer() === option.option_text
                          ? "text-emerald-800 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {option.option_text}
                    </Text>
                    {getCurrentAnswer() === option.option_text && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#10B981"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentQuestion.type === "true_false" && (
            <View className="gap-3">
              {["True", "False"].map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`p-5 rounded-2xl border-2 ${
                    getCurrentAnswer() === option
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-emerald-100 bg-white"
                  }`}
                  onPress={() => handleAnswerSelect(currentQuestion.id, option)}
                  style={
                    getCurrentAnswer() === option
                      ? {
                          shadowColor: "#10B981",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 8,
                          elevation: 3,
                        }
                      : {}
                  }
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                        getCurrentAnswer() === option
                          ? "bg-emerald-500"
                          : "bg-emerald-100"
                      }`}
                    >
                      <Ionicons
                        name={option === "True" ? "thumbs-up" : "thumbs-down"}
                        size={20}
                        color={
                          getCurrentAnswer() === option ? "white" : "#10B981"
                        }
                      />
                    </View>
                    <Text
                      className={`text-lg flex-1 font-semibold ${
                        getCurrentAnswer() === option
                          ? "text-emerald-800"
                          : "text-gray-700"
                      }`}
                    >
                      {option}
                    </Text>
                    {getCurrentAnswer() === option && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#10B981"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Question Navigator */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          {quiz.questions.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                index === currentQuestionIndex
                  ? "bg-emerald-500"
                  : answers[index]?.answer
                    ? "bg-emerald-100"
                    : "bg-white border-2 border-emerald-200"
              }`}
              style={
                index === currentQuestionIndex
                  ? {
                      shadowColor: "#10B981",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }
                  : {}
              }
            >
              <Text
                className={`text-sm font-bold ${
                  index === currentQuestionIndex
                    ? "text-white"
                    : answers[index]?.answer
                      ? "text-emerald-600"
                      : "text-gray-500"
                }`}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View
        className="bg-white px-6 py-4"
        style={{
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            className={`px-6 py-4 rounded-2xl flex-row items-center ${
              currentQuestionIndex === 0 ? "bg-gray-300" : "bg-gray-500"
            }`}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            style={
              currentQuestionIndex !== 0
                ? {
                    shadowColor: "#6B7280",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 3,
                  }
                : {}
            }
          >
            <Ionicons name="arrow-back" size={18} color="white" />
            <Text className="text-white font-bold ml-2">Previous</Text>
          </TouchableOpacity>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <TouchableOpacity
              className={`px-8 py-4 rounded-2xl flex-row items-center ${
                allQuestionsAnswered() ? "bg-emerald-500" : "bg-emerald-300"
              }`}
              onPress={handleSubmitQuiz}
              disabled={submitting || !allQuestionsAnswered()}
              style={
                allQuestionsAnswered()
                  ? {
                      shadowColor: "#10B981",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 5,
                    }
                  : {}
              }
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Submit Quiz</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-emerald-500 px-8 py-4 rounded-2xl flex-row items-center"
              onPress={handleNextQuestion}
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Text className="text-white font-bold mr-2">Next</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
