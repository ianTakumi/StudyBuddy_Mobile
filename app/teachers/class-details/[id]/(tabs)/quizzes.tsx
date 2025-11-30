import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

interface Quiz {
  id: string;
  title: string;
  description: string;
  due_date: string;
  time_limit: number;
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

export default function Quizzes() {
  const params = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    time_limit: "",
    total_points: "",
    question_count: "",
    quiz_type: "multiple_choice",
  });

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

  // Fetch quizzes
  const fetchQuizzes = async () => {
    if (!classId) {
      console.log("❌ No class ID available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Fetching quizzes for class:", classId);

      const response = await client.get(`/quizzes/${classId}`);
      if (response.data.success) {
        console.log(
          "📊 API Response:",
          JSON.stringify(response.data.data, null, 2)
        );
        setQuizzes(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      Alert.alert("Error", "Failed to fetch quizzes");
      setLoading(false);
    }
  };

  // Fetch submissions for a quiz
  const fetchSubmissions = async (quizId: string) => {
    try {
      setSubmissionsLoading(true);
      const response = await client.get(
        `/quizzes/${classId}/${quizId}/submissions`
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
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Process questions before sending to API
  const processQuestionsForAPI = (
    questions: QuestionForm[],
    quizType: string
  ) => {
    return questions
      .filter((q) => q.question.trim() !== "")
      .map((question) => {
        let processedOptions: any[] = [];
        let processedCorrectAnswer = question.correctAnswer;

        // Handle options based on quiz type
        if (quizType === "true_false") {
          // Auto-generate true/false options
          processedOptions = [
            {
              option_text: "True",
              is_correct:
                question.correctAnswer === "True" ||
                question.correctAnswer === "TRUE",
            },
            {
              option_text: "False",
              is_correct:
                question.correctAnswer === "False" ||
                question.correctAnswer === "FALSE",
            },
          ];
          // Ensure correct_answer is stored consistently
          processedCorrectAnswer =
            question.correctAnswer === "True" ||
            question.correctAnswer === "TRUE"
              ? "True"
              : "False";
        } else if (quizType === "multiple_choice") {
          // Process multiple choice options
          processedOptions = question.options
            .filter((opt) => opt.trim() !== "")
            .map((opt, index) => ({
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
          order_index: question.order_index || 0,
        };
      });
  };

  // Create quiz
  const handleCreateQuiz = async () => {
    if (
      !formData.title ||
      !formData.due_date ||
      !formData.total_points ||
      !formData.time_limit
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Validate questions
    const validQuestions = questions.filter((q) => q.question.trim() !== "");
    if (validQuestions.length === 0) {
      Alert.alert("Error", "Please add at least one question");
      return;
    }

    try {
      setSubmitting(true);

      const processedQuestions = processQuestionsForAPI(
        validQuestions,
        formData.quiz_type
      );

      const quizData = {
        ...formData,
        time_limit: parseInt(formData.time_limit),
        total_points: parseInt(formData.total_points),
        question_count: processedQuestions.length,
        questions: processedQuestions,
      };

      console.log("📤 Creating quiz:", JSON.stringify(quizData, null, 2));

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
    if (
      !selectedQuiz ||
      !formData.title ||
      !formData.due_date ||
      !formData.total_points ||
      !formData.time_limit
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Validate questions
    const validQuestions = questions.filter((q) => q.question.trim() !== "");
    if (validQuestions.length === 0) {
      Alert.alert("Error", "Please add at least one question");
      return;
    }

    try {
      setSubmitting(true);

      const processedQuestions = processQuestionsForAPI(
        validQuestions,
        formData.quiz_type
      );

      const quizData = {
        ...formData,
        time_limit: parseInt(formData.time_limit),
        total_points: parseInt(formData.total_points),
        question_count: processedQuestions.length,
        questions: processedQuestions,
      };

      const response = await client.put(
        `/quizzes/${classId}/${selectedQuiz.id}`,
        quizData
      );

      if (response.data.success) {
        const updatedQuizzes = quizzes.map((quiz) =>
          quiz.id === selectedQuiz.id ? response.data.data : quiz
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
                `/quizzes/${classId}/${quiz.id}`
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
      ]
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
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = ["", "", "", ""];
    }
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      due_date: "",
      time_limit: "",
      total_points: "",
      question_count: "",
      quiz_type: "multiple_choice",
    });
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
  };

  // When quiz type changes, update all questions
  useEffect(() => {
    if (showAddModal || showEditModal) {
      const updatedQuestions = questions.map((q) => ({
        ...q,
        type: formData.quiz_type,
        options:
          formData.quiz_type === "true_false" ? ["True", "False"] : q.options,
      }));
      setQuestions(updatedQuestions);
    }
  }, [formData.quiz_type, showAddModal, showEditModal]);

  const openEditModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      due_date: quiz.due_date.split("T")[0],
      time_limit: quiz.time_limit.toString(),
      total_points: quiz.total_points.toString(),
      question_count: quiz.question_count.toString(),
      quiz_type: quiz.quiz_type,
    });

    // Convert API questions to form questions
    const quizQuestions = quiz.quiz_questions || [];
    const formattedQuestions =
      quizQuestions.length > 0
        ? quizQuestions.map((q: QuizQuestion) => {
            // Extract option texts from options array
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
        return "#6366F1";
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

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
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
            className="bg-indigo-500 rounded-xl px-4 py-2 flex-row items-center"
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
          />
        </View>
      </View>

      {/* Quizzes List */}
      <FlatList
        data={filteredQuizzes}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerClassName="p-4"
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
                className="bg-indigo-500 rounded-xl py-3 px-6 flex-row items-center justify-center mt-4"
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
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-lg">
                    {item.title}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {item.description}
                  </Text>
                </View>
                <View className="bg-indigo-100 rounded-lg px-2 py-1">
                  <Text className="text-indigo-700 text-xs font-semibold">
                    {item.total_points} pts
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center space-x-4">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#6B7280"
                    />
                    <Text className="text-gray-600 text-sm ml-1">
                      {formatDate(item.due_date)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-1">
                      {item.time_limit} min
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="list-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-1">
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

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-2">
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
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-2 mt-3">
                <TouchableOpacity
                  className="bg-blue-100 px-3 py-1 rounded-lg flex-row items-center"
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="create-outline" size={14} color="#3B82F6" />
                  <Text className="text-blue-600 text-xs font-medium ml-1">
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-100 px-3 py-1 rounded-lg flex-row items-center"
                  onPress={() => handleDeleteQuiz(item)}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  <Text className="text-red-600 text-xs font-medium ml-1">
                    Delete
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-green-100 px-3 py-1 rounded-lg flex-row items-center"
                  onPress={() => openQuestionsModal(item)}
                >
                  <Ionicons name="eye-outline" size={14} color="#10B981" />
                  <Text className="text-green-600 text-xs font-medium ml-1">
                    Questions
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-purple-100 px-3 py-1 rounded-lg flex-row items-center"
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

// Reusable Quiz Modal Component
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
    value: string
  ) => void;
  removeQuestion: (index: number) => void;
  submitText: string;
  submitting?: boolean;
}

const QuizModal: React.FC<QuizModalProps> = ({
  visible,
  title,
  onClose,
  onSubmit,
  formData,
  setFormData,
  questions,
  addQuestion,
  updateQuestion,
  updateOption,
  removeQuestion,
  submitText,
  submitting = false,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 max-h-[90%]">
          <Text className="text-2xl font-bold text-gray-900 mb-6">{title}</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="space-y-6"
          >
            {/* Basic Info Section */}
            <View className="space-y-4">
              <Text className="text-lg font-bold text-gray-900">
                Basic Information
              </Text>

              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Quiz Title *
                </Text>
                <TextInput
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData({ ...formData, title: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  placeholder="Enter quiz title"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Description
                </Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  numberOfLines={3}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  placeholder="Enter quiz description"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Due Date *
                </Text>
                <TextInput
                  value={formData.due_date}
                  onChangeText={(text) =>
                    setFormData({ ...formData, due_date: text })
                  }
                  className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium mb-2">
                    Time Limit (minutes) *
                  </Text>
                  <TextInput
                    value={formData.time_limit}
                    onChangeText={(text) =>
                      setFormData({ ...formData, time_limit: text })
                    }
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                    placeholder="e.g., 30"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-gray-700 font-medium mb-2">
                    Total Points *
                  </Text>
                  <TextInput
                    value={formData.total_points}
                    onChangeText={(text) =>
                      setFormData({ ...formData, total_points: text })
                    }
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
                    placeholder="e.g., 100"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
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
                          ? "bg-indigo-500 border-indigo-500"
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

            {/* Questions Section */}
            <View className="space-y-4">
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

              {questions.map((question, questionIndex) => (
                <View
                  key={question.id}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <Text className="text-gray-700 font-medium">
                      Question {questionIndex + 1}
                    </Text>
                    {questions.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeQuestion(questionIndex)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput
                    value={question.question}
                    onChangeText={(text) =>
                      updateQuestion(questionIndex, "question", text)
                    }
                    placeholder="Enter question"
                    className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-gray-900 bg-white"
                    placeholderTextColor="#9CA3AF"
                  />

                  <View className="flex-row space-x-2 mb-3">
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm mb-1">Points</Text>
                      <TextInput
                        value={question.points.toString()}
                        onChangeText={(text) =>
                          updateQuestion(
                            questionIndex,
                            "points",
                            parseInt(text) || 1
                          )
                        }
                        keyboardType="numeric"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm mb-1">
                        Correct Answer
                      </Text>
                      {formData.quiz_type === "true_false" ? (
                        <View className="flex-row space-x-2">
                          {["True", "False"].map((option) => (
                            <TouchableOpacity
                              key={option}
                              className={`flex-1 py-2 rounded-lg border ${
                                question.correctAnswer === option
                                  ? "bg-indigo-500 border-indigo-500"
                                  : "bg-white border-gray-300"
                              }`}
                              onPress={() =>
                                updateQuestion(
                                  questionIndex,
                                  "correctAnswer",
                                  option
                                )
                              }
                            >
                              <Text
                                className={`text-center text-sm font-medium ${
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
                        <TextInput
                          value={question.correctAnswer}
                          onChangeText={(text) =>
                            updateQuestion(questionIndex, "correctAnswer", text)
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                          placeholderTextColor="#9CA3AF"
                          placeholder="Enter correct answer"
                        />
                      )}
                    </View>
                  </View>

                  {formData.quiz_type === "multiple_choice" && (
                    <View className="space-y-2">
                      <Text className="text-gray-600 text-sm">Options</Text>
                      {question.options?.map((option, optionIndex) => (
                        <TextInput
                          key={optionIndex}
                          value={option}
                          onChangeText={(text) =>
                            updateOption(questionIndex, optionIndex, text)
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                          placeholderTextColor="#9CA3AF"
                        />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between space-x-3 pt-4">
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
                className="flex-1 py-3 px-4 bg-indigo-500 rounded-xl disabled:bg-indigo-300"
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
          </ScrollView>
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
            className="space-y-4"
          >
            <Text className="text-gray-600 mb-4">
              {quiz.quiz_questions?.length || 0} question
              {quiz.quiz_questions?.length !== 1 ? "s" : ""}
            </Text>

            {quiz.quiz_questions?.map((question, questionIndex) => (
              <View
                key={question.id}
                className="border border-gray-200 rounded-xl p-4"
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
                  <View className="space-y-1">
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
                      )
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
              <ActivityIndicator size="large" color="#6366F1" />
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="space-y-4"
            >
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
                          submission.total_points
                        ).replace("text-", "bg-") + "20"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${getScoreColor(submission.score, submission.total_points)}`}
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
                        (submission.score / submission.total_points) * 100
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
