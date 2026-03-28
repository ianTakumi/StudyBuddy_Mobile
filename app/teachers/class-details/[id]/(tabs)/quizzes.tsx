import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DatePicker from "react-native-date-picker";
import {
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface Quiz {
  id: string;
  title: string;
  description: string;
  due_date: string;
  total_points: number;
  question_count: number;
  quiz_type: string;
  class_id: string;
  quiz_questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  options: any[];
  correct_answer: string;
  points: number;
  quiz_id: string;
  created_at: string;
  updated_at: string;
  order_index: number;
}

interface QuestionForm {
  id: string;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface QuizSubmission {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_points: number;
  time_spent: number;
  submitted_at: string;
  answers: any[];
  users: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Validation error interface
interface ValidationErrors {
  title?: string;
  due_date?: string;
  due_time?: string;
  total_points?: string;
  questions?: string;
  points_sum_mismatch?: string;
  [key: string]: string | undefined;
}

export default function Quizzes() {
  const params = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Date picker states
  const [openDatePicker, setOpenDatePicker] = useState(false);

  // Date and Time states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    total_points: "",
    question_count: "",
    quiz_type: "multiple_choice",
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  // Questions state
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      id: "1",
      question: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    },
  ]);

  // Get class ID
  const classId = globalParams.id;

  // Helper function to calculate total points from questions
  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  };

  // Helper function to combine date and time
  const combineDateAndTime = (
    date: Date,
    hourStr: string,
    minuteStr: string,
    ampmStr: string,
  ): string => {
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    // Convert to 24-hour format
    if (ampmStr === "PM" && hour !== 12) {
      hour += 12;
    } else if (ampmStr === "AM" && hour === 12) {
      hour = 0;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(hour).padStart(2, "0");
    const minutes = String(minute).padStart(2, "0");
    const seconds = "00";

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Parse datetime string to separate components
  const parseDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return;

    const date = new Date(dateTimeStr);
    setSelectedDate(date);

    let hours = date.getHours();
    let ampmValue = hours >= 12 ? "PM" : "AM";
    let hour12 = hours % 12;
    hour12 = hour12 === 0 ? 12 : hour12;

    setHour(hour12.toString());
    setMinute(date.getMinutes().toString().padStart(2, "0"));
    setAmpm(ampmValue);
  };

  // Validation functions
  const validateQuizForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate title
    if (!formData.title.trim()) {
      errors.title = "Quiz title is required";
    } else if (formData.title.length < 3) {
      errors.title = "Quiz title must be at least 3 characters";
    } else if (formData.title.length > 100) {
      errors.title = "Quiz title must be less than 100 characters";
    }

    // Validate due date
    if (!formData.due_date) {
      errors.due_date = "Due date and time is required";
    } else {
      const selectedDateTime = new Date(formData.due_date);
      const now = new Date();

      if (isNaN(selectedDateTime.getTime())) {
        errors.due_date = "Invalid date and time";
      } else if (selectedDateTime < now) {
        errors.due_date = "Due date and time cannot be in the past";
      }
    }

    // Validate time inputs
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);

    if (isNaN(hourNum) || hourNum < 1 || hourNum > 12) {
      errors.due_time = "Hour must be between 1 and 12";
    } else if (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59) {
      errors.due_time = "Minute must be between 0 and 59";
    }

    // Validate total points
    if (!formData.total_points) {
      errors.total_points = "Total points is required";
    } else {
      const points = parseInt(formData.total_points);
      if (isNaN(points) || points <= 0) {
        errors.total_points = "Total points must be a positive number";
      } else if (points > 1000) {
        errors.total_points = "Total points cannot exceed 1000";
      }
    }

    // Validate questions
    const validQuestions = questions.filter((q) => q.question.trim() !== "");
    if (validQuestions.length === 0) {
      errors.questions = "At least one question is required";
    } else {
      let totalQuestionPoints = 0;

      // Validate each question
      for (let i = 0; i < validQuestions.length; i++) {
        const q = validQuestions[i];

        if (!q.question.trim()) {
          errors[`question_${i}`] = `Question ${i + 1} is empty`;
          break;
        }

        if (q.points <= 0 || isNaN(q.points)) {
          errors[`question_${i}_points`] =
            `Question ${i + 1} points must be positive`;
          break;
        }

        totalQuestionPoints += q.points;

        if (!q.correctAnswer.trim()) {
          errors[`question_${i}_answer`] =
            `Question ${i + 1} correct answer is required`;
          break;
        }

        if (formData.quiz_type === "multiple_choice") {
          const validOptions = q.options.filter((opt) => opt.trim() !== "");
          if (validOptions.length < 2) {
            errors[`question_${i}_options`] =
              `Question ${i + 1} must have at least 2 options`;
            break;
          }

          // Check if correct answer matches one of the options
          if (!validOptions.includes(q.correctAnswer)) {
            errors[`question_${i}_answer_match`] =
              `Question ${i + 1} correct answer must match one of the options`;
            break;
          }
        } else if (formData.quiz_type === "true_false") {
          const validAnswers = ["True", "False"];
          if (!validAnswers.includes(q.correctAnswer)) {
            errors[`question_${i}_answer`] =
              `Question ${i + 1} correct answer must be either "True" or "False"`;
            break;
          }
        }
      }

      // Validate that total points from questions matches the quiz total points
      const quizTotalPoints = parseInt(formData.total_points);
      if (
        !isNaN(quizTotalPoints) &&
        quizTotalPoints > 0 &&
        totalQuestionPoints !== quizTotalPoints
      ) {
        errors.points_sum_mismatch = `Total points from questions (${totalQuestionPoints}) does not match quiz total points (${quizTotalPoints})`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  // Auto-update total points when questions change
  useEffect(() => {
    if (questions.length > 0) {
      const totalPoints = calculateTotalPoints();
      setFormData((prev) => ({
        ...prev,
        total_points: totalPoints.toString(),
      }));
      // Clear points sum mismatch error when auto-updating
      if (validationErrors.points_sum_mismatch) {
        const newErrors = { ...validationErrors };
        delete newErrors.points_sum_mismatch;
        setValidationErrors(newErrors);
      }
    }
  }, [questions]);

  // Fetch quizzes
  const fetchQuizzes = async () => {
    if (!classId) {
      console.log("❌ No class ID available");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log("🔄 Fetching quizzes for class:", classId);

      const response = await client.get(`/quizzes/${classId}`);
      if (response.data.success) {
        setQuizzes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      Alert.alert("Error", "Failed to fetch quizzes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQuizzes();
  }, [classId]);

  // Fetch submissions for a quiz
  const fetchSubmissions = async (quizId: string) => {
    try {
      setSubmissionsLoading(true);
      const response = await client.get(
        `/quizzes/${classId}/${quizId}/submissions`,
      );

      if (response.data.success) {
        setSubmissions(response.data.data || []);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      Alert.alert("Error", "Failed to load submissions");
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const openSubmissionsModal = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowSubmissionsModal(true);
    await fetchSubmissions(quiz.id);
  };

  useEffect(() => {
    fetchQuizzes();
  }, [classId]);

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Process questions before sending to API
  const processQuestionsForAPI = (
    questions: QuestionForm[],
    quizType: string,
  ) => {
    return questions
      .filter((q) => q.question.trim() !== "")
      .map((question, index) => {
        let processedOptions: any[] = [];
        let processedCorrectAnswer = question.correctAnswer;

        if (quizType === "true_false") {
          processedOptions = [
            {
              option_text: "True",
              is_correct: question.correctAnswer === "True",
            },
            {
              option_text: "False",
              is_correct: question.correctAnswer === "False",
            },
          ];
          processedCorrectAnswer = question.correctAnswer;
        } else if (quizType === "multiple_choice") {
          processedOptions = question.options
            .filter((opt) => opt.trim() !== "")
            .map((opt) => ({
              option_text: opt,
              is_correct: opt === question.correctAnswer,
            }));
        }

        return {
          question: question.question,
          type: quizType,
          options: processedOptions,
          correctAnswer: processedCorrectAnswer,
          points: question.points,
          order_index: index,
        };
      });
  };

  // Create quiz
  const handleCreateQuiz = async () => {
    // Validate form
    if (!validateQuizForm()) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before submitting",
      );
      return;
    }

    const validQuestions = questions.filter((q) => q.question.trim() !== "");

    try {
      setSubmitting(true);

      const processedQuestions = processQuestionsForAPI(
        validQuestions,
        formData.quiz_type,
      );

      const quizData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        total_points: parseInt(formData.total_points),
        question_count: processedQuestions.length,
        quiz_type: formData.quiz_type,
        questions: processedQuestions,
      };

      const response = await client.post(`/quizzes/${classId}`, quizData);
      if (response.data.success) {
        setQuizzes([response.data.data, ...quizzes]);
        setShowAddModal(false);
        resetForm();
        Alert.alert("Success", "Quiz created successfully!");
      }
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating quiz:", error);
      Alert.alert("Error", "Failed to create quiz");
      setSubmitting(false);
    }
  };

  // Update quiz
  const handleUpdateQuiz = async () => {
    if (!selectedQuiz) return;

    // Validate form
    if (!validateQuizForm()) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before submitting",
      );
      return;
    }

    const validQuestions = questions.filter((q) => q.question.trim() !== "");

    try {
      setSubmitting(true);

      const processedQuestions = processQuestionsForAPI(
        validQuestions,
        formData.quiz_type,
      );

      const quizData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        total_points: parseInt(formData.total_points),
        question_count: processedQuestions.length,
        quiz_type: formData.quiz_type,
        questions: processedQuestions,
      };

      const response = await client.put(
        `/quizzes/${classId}/${selectedQuiz.id}`,
        quizData,
      );

      if (response.data.success) {
        const updatedQuizzes = quizzes.map((quiz) =>
          quiz.id === selectedQuiz.id ? response.data.data : quiz,
        );
        setQuizzes(updatedQuizzes);
        setShowEditModal(false);
        resetForm();
        Alert.alert("Success", "Quiz updated successfully!");
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      Alert.alert("Error", "Failed to update quiz");
      setSubmitting(false);
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (quiz: Quiz) => {
    Alert.alert(
      "Delete Quiz",
      `Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await client.delete(
                `/quizzes/${classId}/${quiz.id}`,
              );

              if (response.data.success) {
                const updatedQuizzes = quizzes.filter((q) => q.id !== quiz.id);
                setQuizzes(updatedQuizzes);
                Alert.alert("Success", "Quiz deleted successfully!");
              }
            } catch (error) {
              console.error("Error deleting quiz:", error);
              Alert.alert("Error", "Failed to delete quiz");
            }
          },
        },
      ],
    );
  };

  // Question management
  const addQuestion = () => {
    const defaultOptions =
      formData.quiz_type === "true_false"
        ? ["True", "False"]
        : ["", "", "", ""];

    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question: "",
        type: formData.quiz_type,
        options: defaultOptions,
        correctAnswer: "",
        points: 1,
      },
    ]);
    // Clear validation errors when adding a new question
    if (validationErrors.questions) {
      const newErrors = { ...validationErrors };
      delete newErrors.questions;
      setValidationErrors(newErrors);
    }
    if (validationErrors.points_sum_mismatch) {
      const newErrors = { ...validationErrors };
      delete newErrors.points_sum_mismatch;
      setValidationErrors(newErrors);
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);

    // Clear specific validation error for this question if it exists
    if (
      validationErrors[`question_${index}`] ||
      validationErrors[`question_${index}_points`] ||
      validationErrors[`question_${index}_answer`] ||
      validationErrors[`question_${index}_options`] ||
      validationErrors[`question_${index}_answer_match`]
    ) {
      const newErrors = { ...validationErrors };
      delete newErrors[`question_${index}`];
      delete newErrors[`question_${index}_points`];
      delete newErrors[`question_${index}_answer`];
      delete newErrors[`question_${index}_options`];
      delete newErrors[`question_${index}_answer_match`];
      setValidationErrors(newErrors);
    }

    // Clear points sum mismatch error
    if (validationErrors.points_sum_mismatch) {
      const newErrors = { ...validationErrors };
      delete newErrors.points_sum_mismatch;
      setValidationErrors(newErrors);
    }
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = ["", "", "", ""];
    }
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);

    // Clear options validation error if it exists
    if (validationErrors[`question_${questionIndex}_options`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`question_${questionIndex}_options`];
      setValidationErrors(newErrors);
    }
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);

      // Clear validation errors related to removed question
      const newErrors = { ...validationErrors };
      delete newErrors[`question_${index}`];
      delete newErrors[`question_${index}_points`];
      delete newErrors[`question_${index}_answer`];
      delete newErrors[`question_${index}_options`];
      delete newErrors[`question_${index}_answer_match`];
      setValidationErrors(newErrors);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      due_date: "",
      total_points: "",
      question_count: "",
      quiz_type: "multiple_choice",
    });
    setSelectedDate(new Date());
    setHour("12");
    setMinute("00");
    setAmpm("AM");
    setQuestions([
      {
        id: "1",
        question: "",
        type: "multiple_choice",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 1,
      },
    ]);
    setSelectedQuiz(null);
    clearValidationErrors();
  };

  useEffect(() => {
    if (showAddModal || showEditModal) {
      const updatedQuestions = questions.map((q) => ({
        ...q,
        type: formData.quiz_type,
        options:
          formData.quiz_type === "true_false" ? ["True", "False"] : q.options,
      }));
      setQuestions(updatedQuestions);
      clearValidationErrors();
    }
  }, [formData.quiz_type, showAddModal, showEditModal]);

  const openEditModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      due_date: quiz.due_date,
      total_points: quiz.total_points.toString(),
      question_count: quiz.question_count.toString(),
      quiz_type: quiz.quiz_type,
    });

    // Parse the date and time
    parseDateTime(quiz.due_date);

    const quizQuestions = quiz.quiz_questions || [];
    const formattedQuestions =
      quizQuestions.length > 0
        ? quizQuestions.map((q: QuizQuestion) => {
            const optionTexts = q.options
              ? q.options.map((opt: any) => opt.option_text || "")
              : ["", "", "", ""];

            return {
              id: q.id,
              question: q.question,
              type: q.type,
              options: optionTexts,
              correctAnswer: q.correct_answer,
              points: q.points || 1,
            };
          })
        : [
            {
              id: "1",
              question: "",
              type: quiz.quiz_type,
              options:
                quiz.quiz_type === "true_false"
                  ? ["True", "False"]
                  : ["", "", "", ""],
              correctAnswer: "",
              points: 1,
            },
          ];

    setQuestions(formattedQuestions);
    clearValidationErrors();
    setShowEditModal(true);
  };

  const openQuestionsModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowQuestionsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getQuizTypeColor = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "#3B82F6";
      case "true_false":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getQuizTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "Multiple Choice";
      case "true_false":
        return "True/False";
      default:
        return type;
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading quizzes...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-16 pb-4 px-6 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Quizzes</Text>
            <Text className="text-gray-600 mt-1">
              {params.className} • {quizzes.length} quizzes
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-500 rounded-xl px-4 py-2 flex-row items-center"
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">New Quiz</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            placeholder="Search quizzes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-700"
            placeholderTextColor={"#9CA3AF"}
          />
        </View>
      </View>

      {/* Quizzes List with Pull to Refresh */}
      <FlatList
        data={filteredQuizzes}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View className="bg-gray-50 rounded-2xl p-8 items-center mt-8">
            <Ionicons name="help-circle-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-center mt-4 text-lg font-semibold">
              {searchQuery ? "No quizzes found" : "No quizzes yet"}
            </Text>
            <Text className="text-gray-400 text-center text-sm mt-2">
              {searchQuery
                ? "Try a different search term"
                : "Create your first quiz to get started"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                className="bg-blue-500 rounded-xl py-3 px-6 flex-row items-center justify-center mt-4"
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Create First Quiz
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const daysUntilDue = getDaysUntilDue(item.due_date);
          const isOverdue = daysUntilDue < 0;
          const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

          return (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-lg border border-gray-200">
              {/* Header Section */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-2">
                  <Text className="font-bold text-gray-900 text-lg">
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text
                      className="text-gray-600 text-sm mt-1"
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                <View className="bg-blue-100 rounded-lg px-2 py-1">
                  <Text className="text-blue-700 text-xs font-semibold">
                    {item.total_points} pts
                  </Text>
                </View>
              </View>

              {/* Info Row */}
              <View className="flex-row flex-wrap items-center justify-between mb-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text className="text-gray-600 text-xs ml-1">
                      {formatDateTime(item.due_date)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="list-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {item.quiz_questions?.length || 0} questions
                    </Text>
                  </View>
                </View>

                <View
                  className="rounded-lg px-2 py-1"
                  style={{
                    backgroundColor: `${getQuizTypeColor(item.quiz_type)}15`,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: getQuizTypeColor(item.quiz_type) }}
                  >
                    {getQuizTypeLabel(item.quiz_type)}
                  </Text>
                </View>
              </View>

              {/* Status Badges */}
              <View className="flex-row items-center gap-2 mb-3">
                {isOverdue && (
                  <View className="bg-red-100 rounded-lg px-2 py-1">
                    <Text className="text-red-700 text-xs font-semibold">
                      Overdue
                    </Text>
                  </View>
                )}
                {isDueSoon && !isOverdue && (
                  <View className="bg-amber-100 rounded-lg px-2 py-1">
                    <Text className="text-amber-700 text-xs font-semibold">
                      Due soon
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons - Wrapped for better spacing */}
              <View className="flex-row flex-wrap gap-2 mt-1">
                <TouchableOpacity
                  className="bg-blue-100 px-3 py-1.5 rounded-lg flex-row items-center"
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="create-outline" size={14} color="#3B82F6" />
                  <Text className="text-blue-600 text-xs font-medium ml-1">
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-red-100 px-3 py-1.5 rounded-lg flex-row items-center"
                  onPress={() => handleDeleteQuiz(item)}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  <Text className="text-red-600 text-xs font-medium ml-1">
                    Delete
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-green-100 px-3 py-1.5 rounded-lg flex-row items-center"
                  onPress={() => openQuestionsModal(item)}
                >
                  <Ionicons name="eye-outline" size={14} color="#10B981" />
                  <Text className="text-green-600 text-xs font-medium ml-1">
                    Questions
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-purple-100 px-3 py-1.5 rounded-lg flex-row items-center"
                  onPress={() => openSubmissionsModal(item)}
                >
                  <Ionicons name="people-outline" size={14} color="#8B5CF6" />
                  <Text className="text-purple-600 text-xs font-medium ml-1">
                    Submissions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Add Quiz Modal */}
      <QuizModal
        visible={showAddModal}
        title="Create New Quiz"
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        onSubmit={handleCreateQuiz}
        formData={formData}
        setFormData={setFormData}
        questions={questions}
        setQuestions={setQuestions}
        addQuestion={addQuestion}
        updateQuestion={updateQuestion}
        updateOption={updateOption}
        removeQuestion={removeQuestion}
        submitText="Create Quiz"
        submitting={submitting}
        validationErrors={validationErrors}
        setValidationErrors={setValidationErrors}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        hour={hour}
        setHour={setHour}
        minute={minute}
        setMinute={setMinute}
        ampm={ampm}
        setAmpm={setAmpm}
        combineDateAndTime={combineDateAndTime}
        parseDateTime={parseDateTime}
        openDatePicker={openDatePicker}
        setOpenDatePicker={setOpenDatePicker}
        calculateTotalPoints={calculateTotalPoints}
      />

      {/* Edit Quiz Modal */}
      <QuizModal
        visible={showEditModal}
        title="Edit Quiz"
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        onSubmit={handleUpdateQuiz}
        formData={formData}
        setFormData={setFormData}
        questions={questions}
        setQuestions={setQuestions}
        addQuestion={addQuestion}
        updateQuestion={updateQuestion}
        updateOption={updateOption}
        removeQuestion={removeQuestion}
        submitText="Update Quiz"
        submitting={submitting}
        validationErrors={validationErrors}
        setValidationErrors={setValidationErrors}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        hour={hour}
        setHour={setHour}
        minute={minute}
        setMinute={setMinute}
        ampm={ampm}
        setAmpm={setAmpm}
        combineDateAndTime={combineDateAndTime}
        parseDateTime={parseDateTime}
        openDatePicker={openDatePicker}
        setOpenDatePicker={setOpenDatePicker}
        calculateTotalPoints={calculateTotalPoints}
      />

      {/* Questions Modal */}
      <QuestionsModal
        visible={showQuestionsModal}
        quiz={selectedQuiz}
        onClose={() => setShowQuestionsModal(false)}
      />

      {/* Submissions Modal */}
      <SubmissionsModal
        visible={showSubmissionsModal}
        quiz={selectedQuiz}
        submissions={submissions}
        loading={submissionsLoading}
        onClose={() => setShowSubmissionsModal(false)}
        getScoreColor={getScoreColor}
        formatDateTime={formatDateTime}
      />
    </View>
  );
}

// Reusable Quiz Modal Component with Improved UI
interface QuizModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  formData: any;
  setFormData: (data: any) => void;
  questions: QuestionForm[];
  setQuestions: (questions: QuestionForm[]) => void;
  addQuestion: () => void;
  updateQuestion: (index: number, field: string, value: any) => void;
  updateOption: (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => void;
  removeQuestion: (index: number) => void;
  submitText: string;
  submitting?: boolean;
  validationErrors: ValidationErrors;
  setValidationErrors: (errors: ValidationErrors) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  hour: string;
  setHour: (hour: string) => void;
  minute: string;
  setMinute: (minute: string) => void;
  ampm: string;
  setAmpm: (ampm: string) => void;
  combineDateAndTime: (
    date: Date,
    hour: string,
    minute: string,
    ampm: string,
  ) => string;
  parseDateTime: (dateTimeStr: string) => void;
  openDatePicker: boolean;
  setOpenDatePicker: (open: boolean) => void;
  calculateTotalPoints: () => number;
}

const QuizModal: React.FC<QuizModalProps> = ({
  visible,
  title,
  onClose,
  onSubmit,
  formData,
  setFormData,
  questions,
  setQuestions,
  addQuestion,
  updateQuestion,
  updateOption,
  removeQuestion,
  submitText,
  submitting = false,
  validationErrors,
  setValidationErrors,
  selectedDate,
  setSelectedDate,
  hour,
  setHour,
  minute,
  setMinute,
  ampm,
  setAmpm,
  combineDateAndTime,
  openDatePicker,
  setOpenDatePicker,
  calculateTotalPoints,
}) => {
  // Clear field validation error when user starts typing
  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleHourChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    let hourNum = parseInt(cleaned);

    if (cleaned === "") {
      setHour("");
    } else if (!isNaN(hourNum)) {
      if (hourNum > 12) hourNum = 12;
      if (hourNum < 1 && cleaned.length > 0) hourNum = 1;
      setHour(hourNum.toString());
    }

    if (validationErrors.due_time) {
      const newErrors = { ...validationErrors };
      delete newErrors.due_time;
      setValidationErrors(newErrors);
    }
  };

  const handleMinuteChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    let minuteNum = parseInt(cleaned);

    if (cleaned === "") {
      setMinute("");
    } else if (!isNaN(minuteNum)) {
      if (minuteNum > 59) minuteNum = 59;
      if (minuteNum < 0) minuteNum = 0;
      setMinute(minuteNum.toString().padStart(2, "0"));
    }

    if (validationErrors.due_time) {
      const newErrors = { ...validationErrors };
      delete newErrors.due_time;
      setValidationErrors(newErrors);
    }
  };

  const handleDateConfirm = (date: Date) => {
    setOpenDatePicker(false);
    setSelectedDate(date);
    if (hour && minute) {
      const formattedDateTime = combineDateAndTime(date, hour, minute, ampm);
      setFormData({ ...formData, due_date: formattedDateTime });
    }
    if (validationErrors.due_date) {
      const newErrors = { ...validationErrors };
      delete newErrors.due_date;
      setValidationErrors(newErrors);
    }
  };

  const updateDateTime = () => {
    if (hour && minute) {
      const formattedDateTime = combineDateAndTime(
        selectedDate,
        hour,
        minute,
        ampm,
      );
      setFormData({ ...formData, due_date: formattedDateTime });
    }
  };

  useEffect(() => {
    if (hour && minute) {
      updateDateTime();
    }
  }, [selectedDate, hour, minute, ampm]);

  // Handle quiz type change - reset options for all questions
  useEffect(() => {
    if (formData.quiz_type === "true_false") {
      // When switching to True/False, update all questions to have True/False options
      const updatedQuestions = questions.map((question) => ({
        ...question,
        type: "true_false",
        options: ["True", "False"],
        // Reset correct answer if it's not True or False
        correctAnswer: ["True", "False"].includes(question.correctAnswer)
          ? question.correctAnswer
          : "",
      }));
      setQuestions(updatedQuestions);
    } else if (formData.quiz_type === "multiple_choice") {
      // When switching to Multiple Choice, update all questions to have 4 empty options
      const updatedQuestions = questions.map((question) => ({
        ...question,
        type: "multiple_choice",
        // Reset to 4 empty options
        options: ["", "", "", ""],
        // Reset correct answer since options changed
        correctAnswer: "",
      }));
      setQuestions(updatedQuestions);
    }
  }, [formData.quiz_type]);

  // Display total points from questions
  const totalQuestionPoints = calculateTotalPoints();

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl mx-4 w-11/12 max-h-[90%]">
          <View className="p-6 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-900">{title}</Text>
          </View>

          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={100}
            enableOnAndroid={true}
            contentContainerStyle={{ padding: 24 }}
          >
            <View className="gap-6">
              {/* Basic Info Section */}
              <View className="gap-4">
                <Text className="text-lg font-bold text-gray-900">
                  Basic Information
                </Text>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Quiz Title *
                  </Text>
                  <TextInput
                    value={formData.title}
                    onChangeText={(text) => handleFieldChange("title", text)}
                    className={`border ${validationErrors.title ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 text-gray-900 bg-white`}
                    placeholder="Enter quiz title"
                    placeholderTextColor="#9CA3AF"
                  />
                  {validationErrors.title && (
                    <Text className="text-red-500 text-sm mt-1">
                      {validationErrors.title}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Description
                  </Text>
                  <TextInput
                    value={formData.description}
                    onChangeText={(text) =>
                      handleFieldChange("description", text)
                    }
                    multiline
                    numberOfLines={3}
                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                    placeholder="Enter quiz description"
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                </View>

                {/* Date Section with DatePicker */}
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Due Date *
                  </Text>
                  <TouchableOpacity
                    onPress={() => setOpenDatePicker(true)}
                    className={`border ${validationErrors.due_date ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 bg-white flex-row items-center justify-between`}
                  >
                    <Text className="text-gray-900">
                      {selectedDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>

                {/* Date Picker Modal */}
                <DatePicker
                  modal
                  open={openDatePicker}
                  date={selectedDate}
                  mode="date"
                  onConfirm={handleDateConfirm}
                  onCancel={() => setOpenDatePicker(false)}
                  title="Select Due Date"
                  confirmText="OK"
                  cancelText="Cancel"
                />

                {/* Time Section with Hour, Minute, and AM/PM */}
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Due Time *
                  </Text>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-gray-500 text-xs mb-1">
                        Hour (1-12)
                      </Text>
                      <TextInput
                        value={hour}
                        onChangeText={handleHourChange}
                        keyboardType="numeric"
                        maxLength={2}
                        className={`border ${validationErrors.due_time ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 text-gray-900 bg-white text-center`}
                        placeholder="HH"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="text-gray-500 text-xs mb-1">
                        Minute (00-59)
                      </Text>
                      <TextInput
                        value={minute}
                        onChangeText={handleMinuteChange}
                        keyboardType="numeric"
                        maxLength={2}
                        className={`border ${validationErrors.due_time ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 text-gray-900 bg-white text-center`}
                        placeholder="MM"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="text-gray-500 text-xs mb-1">AM/PM</Text>
                      <View className="flex-row border border-gray-300 rounded-xl overflow-hidden">
                        <TouchableOpacity
                          className={`flex-1 py-3 ${ampm === "AM" ? "bg-blue-500" : "bg-white"}`}
                          onPress={() => {
                            setAmpm("AM");
                            updateDateTime();
                          }}
                        >
                          <Text
                            className={`text-center font-medium ${ampm === "AM" ? "text-white" : "text-gray-700"}`}
                          >
                            AM
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className={`flex-1 py-3 ${ampm === "PM" ? "bg-blue-500" : "bg-white"}`}
                          onPress={() => {
                            setAmpm("PM");
                            updateDateTime();
                          }}
                        >
                          <Text
                            className={`text-center font-medium ${ampm === "PM" ? "text-white" : "text-gray-700"}`}
                          >
                            PM
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  {validationErrors.due_time && (
                    <Text className="text-red-500 text-sm mt-1">
                      {validationErrors.due_time}
                    </Text>
                  )}
                  {validationErrors.due_date && (
                    <Text className="text-red-500 text-sm mt-1">
                      {validationErrors.due_date}
                    </Text>
                  )}
                </View>

                {/* Total Points Display */}
                <View className="bg-blue-50 rounded-xl p-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-blue-700 font-medium">
                      Total Points from Questions:
                    </Text>
                    <Text className="text-blue-800 font-bold text-lg">
                      {totalQuestionPoints}
                    </Text>
                  </View>
                  {validationErrors.points_sum_mismatch && (
                    <Text className="text-red-500 text-sm mt-2">
                      {validationErrors.points_sum_mismatch}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Quiz Type
                  </Text>
                  <View className="flex-row flex-wrap -mx-1">
                    {[
                      { value: "multiple_choice", label: "Multiple Choice" },
                      { value: "true_false", label: "True/False" },
                    ].map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        className={`mx-1 mb-2 px-3 py-2 rounded-lg border ${
                          formData.quiz_type === type.value
                            ? "bg-blue-500 border-blue-500"
                            : "bg-white border-gray-300"
                        }`}
                        onPress={() =>
                          setFormData({ ...formData, quiz_type: type.value })
                        }
                      >
                        <Text
                          className={`text-sm font-medium ${
                            formData.quiz_type === type.value
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Questions Section with Improved UI */}
              <View className="gap-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold text-gray-900">
                    Questions
                  </Text>
                  <TouchableOpacity
                    className="bg-green-500 rounded-lg px-3 py-2 flex-row items-center"
                    onPress={addQuestion}
                  >
                    <Ionicons name="add" size={16} color="white" />
                    <Text className="text-white font-medium ml-1">
                      Add Question
                    </Text>
                  </TouchableOpacity>
                </View>

                {validationErrors.questions && (
                  <Text className="text-red-500 text-sm text-center">
                    {validationErrors.questions}
                  </Text>
                )}

                {questions.map((question, questionIndex) => (
                  <View
                    key={question.id}
                    className="border border-gray-200 rounded-xl p-4 bg-white"
                  >
                    {/* Question Header */}
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                          <Text className="text-blue-600 font-bold">
                            {questionIndex + 1}
                          </Text>
                        </View>
                        <Text className="text-gray-700 font-semibold">
                          Question
                        </Text>
                      </View>
                      {questions.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeQuestion(questionIndex)}
                          className="p-2"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Question Input */}
                    <TextInput
                      value={question.question}
                      onChangeText={(text) =>
                        updateQuestion(questionIndex, "question", text)
                      }
                      placeholder="Enter your question here..."
                      className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-gray-900 bg-gray-50"
                      placeholderTextColor="#9CA3AF"
                      multiline
                    />
                    {validationErrors[`question_${questionIndex}`] && (
                      <Text className="text-red-500 text-sm mb-2">
                        {validationErrors[`question_${questionIndex}`]}
                      </Text>
                    )}

                    {/* Points */}
                    <View className="mb-3">
                      <Text className="text-gray-600 text-sm mb-1">Points</Text>
                      <TextInput
                        value={question.points.toString()}
                        onChangeText={(text) =>
                          updateQuestion(
                            questionIndex,
                            "points",
                            parseInt(text) || 1,
                          )
                        }
                        keyboardType="numeric"
                        className="border border-gray-300 rounded-xl px-4 py-2 text-gray-900 bg-gray-50 w-24"
                        placeholderTextColor="#9CA3AF"
                      />
                      {validationErrors[`question_${questionIndex}_points`] && (
                        <Text className="text-red-500 text-sm mt-1">
                          {validationErrors[`question_${questionIndex}_points`]}
                        </Text>
                      )}
                    </View>

                    {/* Options Section */}
                    <View className="mt-2">
                      <Text className="text-gray-700 font-medium mb-3">
                        Answer Choices
                      </Text>

                      {formData.quiz_type === "true_false" ? (
                        <View className="flex-row gap-3">
                          {question.options.map((option, optionIndex) => (
                            <TouchableOpacity
                              key={optionIndex}
                              className={`flex-1 py-3 rounded-xl border-2 ${
                                question.correctAnswer === option
                                  ? "bg-green-500 border-green-500"
                                  : "bg-white border-gray-300"
                              }`}
                              onPress={() =>
                                updateQuestion(
                                  questionIndex,
                                  "correctAnswer",
                                  option,
                                )
                              }
                            >
                              <Text
                                className={`text-center font-semibold ${
                                  question.correctAnswer === option
                                    ? "text-white"
                                    : "text-gray-700"
                                }`}
                              >
                                {option}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : (
                        <View className="gap-2">
                          {question.options.map((option, optionIndex) => {
                            const isSelected =
                              question.correctAnswer === option;
                            const hasError =
                              validationErrors[
                                `question_${questionIndex}_options`
                              ];

                            return (
                              <View
                                key={optionIndex}
                                className="flex-row items-center gap-2"
                              >
                                <TouchableOpacity
                                  onPress={() =>
                                    updateQuestion(
                                      questionIndex,
                                      "correctAnswer",
                                      option,
                                    )
                                  }
                                  className="mr-2"
                                >
                                  <View
                                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                                      isSelected
                                        ? "bg-green-500 border-green-500"
                                        : "border-gray-400 bg-white"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Ionicons
                                        name="checkmark"
                                        size={14}
                                        color="white"
                                      />
                                    )}
                                  </View>
                                </TouchableOpacity>

                                <TextInput
                                  value={option}
                                  onChangeText={(text) =>
                                    updateOption(
                                      questionIndex,
                                      optionIndex,
                                      text,
                                    )
                                  }
                                  placeholder={`Option ${optionIndex + 1}`}
                                  className={`flex-1 border rounded-xl px-4 py-3 text-gray-900 bg-white ${
                                    isSelected
                                      ? "border-green-500 bg-green-50"
                                      : hasError
                                        ? "border-red-500"
                                        : "border-gray-300"
                                  }`}
                                  placeholderTextColor="#9CA3AF"
                                />
                              </View>
                            );
                          })}

                          {validationErrors[
                            `question_${questionIndex}_options`
                          ] && (
                            <Text className="text-red-500 text-sm mt-1">
                              {
                                validationErrors[
                                  `question_${questionIndex}_options`
                                ]
                              }
                            </Text>
                          )}

                          <Text className="text-xs text-gray-400 mt-2">
                            💡 Click the circle to mark the correct answer
                          </Text>
                        </View>
                      )}

                      {validationErrors[`question_${questionIndex}_answer`] && (
                        <Text className="text-red-500 text-sm mt-2">
                          {validationErrors[`question_${questionIndex}_answer`]}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View className="flex-row justify-between gap-3 pt-4 pb-6">
                <TouchableOpacity
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl disabled:bg-gray-100"
                  onPress={onClose}
                  disabled={submitting}
                >
                  <Text className="text-gray-700 font-medium text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 px-4 bg-blue-500 rounded-xl disabled:bg-blue-300"
                  onPress={onSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-medium text-center">
                      {submitText}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
};
// Questions Modal Component
interface QuestionsModalProps {
  visible: boolean;
  quiz: Quiz | null;
  onClose: () => void;
}

const QuestionsModal: React.FC<QuestionsModalProps> = ({
  visible,
  quiz,
  onClose,
}) => {
  if (!quiz) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 max-h-[90%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">
              {quiz.title} - Questions
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mb-5 gap-4"
          >
            <Text className="text-gray-600 mb-4">
              {quiz.quiz_questions?.length || 0} question
              {quiz.quiz_questions?.length !== 1 ? "s" : ""}
            </Text>

            {quiz.quiz_questions?.map((question, questionIndex) => (
              <View
                key={question.id}
                className="border border-gray-200 rounded-xl p-4 mb-5"
              >
                <Text className="text-gray-700 font-medium mb-2">
                  Question {questionIndex + 1}
                </Text>

                <Text className="text-gray-900 font-medium mb-3">
                  {question.question}
                </Text>

                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-600 text-sm">
                    Points: {question.points}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Correct: {question.correct_answer}
                  </Text>
                </View>

                {question.options && question.options.length > 0 && (
                  <View className="gap-1">
                    <Text className="text-gray-600 text-sm font-medium">
                      Options:
                    </Text>
                    {question.options.map(
                      (option: any, optionIndex: number) => (
                        <Text
                          key={optionIndex}
                          className={`text-sm ml-2 ${
                            option.is_correct
                              ? "text-green-600 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}.{" "}
                          {option.option_text}
                          {option.is_correct && " ✓"}
                        </Text>
                      ),
                    )}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Submissions Modal Component
interface SubmissionsModalProps {
  visible: boolean;
  quiz: Quiz | null;
  submissions: QuizSubmission[];
  loading: boolean;
  onClose: () => void;
  getScoreColor: (score: number, total: number) => string;
  formatDateTime: (dateString: string) => string;
}

const SubmissionsModal: React.FC<SubmissionsModalProps> = ({
  visible,
  quiz,
  submissions,
  loading,
  onClose,
  getScoreColor,
  formatDateTime,
}) => {
  if (!quiz) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 max-h-[90%]">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {quiz.title} - Submissions
              </Text>
              <Text className="text-gray-600 mt-1">
                {submissions.length} student
                {submissions.length !== 1 ? "s" : ""} completed
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-600 mt-4">Loading submissions...</Text>
            </View>
          ) : submissions.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4 text-lg font-semibold">
                No submissions yet
              </Text>
              <Text className="text-gray-400 text-center text-sm mt-2">
                Students haven't taken this quiz yet
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} className="gap-4">
              {submissions.map((submission, index) => (
                <View
                  key={submission.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800 text-lg">
                        {submission.users.first_name}{" "}
                        {submission.users.last_name}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {submission.users.email}
                      </Text>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${
                        getScoreColor(
                          submission.score,
                          submission.total_points,
                        ).replace("text-", "bg-") + "20"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${getScoreColor(
                          submission.score,
                          submission.total_points,
                        )}`}
                      >
                        {submission.score}/{submission.total_points}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text className="text-gray-500 text-xs ml-1">
                        Time spent: {Math.floor(submission.time_spent / 60)}:
                        {(submission.time_spent % 60)
                          .toString()
                          .padStart(2, "0")}
                      </Text>
                    </View>
                    <Text className="text-gray-400 text-xs">
                      {formatDateTime(submission.submitted_at)}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="mt-2">
                    <View className="bg-gray-200 rounded-full h-2">
                      <View
                        className="bg-green-500 rounded-full h-2"
                        style={{
                          width: `${(submission.score / submission.total_points) * 100}%`,
                        }}
                      />
                    </View>
                    <Text className="text-gray-400 text-xs mt-1 text-center">
                      {Math.round(
                        (submission.score / submission.total_points) * 100,
                      )}
                      % Correct
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};
