import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import client from "@/utils/axiosInstance";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  flashcard_set_class_id: string;
  created_at: string;
  updated_at: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  class_id: string;
  created_at: string;
  updated_at: string;
  flashcards_class: Flashcard[];
}

export default function FlashCardClassDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Modal states
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(
    null,
  );
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Get params
  const setId = params.id as string;
  const title = params.title as string;
  const className = params.className as string;

  // Fetch flashcard set details
  const fetchFlashcardSetDetails = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/flashcards-class/sets/${setId}`);

      if (response.data.success) {
        const data = response.data.data;
        setFlashcardSet(data);
        setFlashcards(data.flashcards_class || []);
      } else {
        Alert.alert("Error", "Failed to load flashcard set");
      }
    } catch (error) {
      console.error("Error fetching flashcard set:", error);
      Alert.alert("Error", "Failed to load flashcard set");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFlashcardSetDetails();
  };

  useEffect(() => {
    if (setId) {
      fetchFlashcardSetDetails();
    }
  }, [setId]);

  // Create new flashcard
  const handleCreateFlashcard = async () => {
    if (!questionText.trim() || !answerText.trim()) {
      Alert.alert("Error", "Please fill in both question and answer");
      return;
    }

    try {
      setSubmitting(true);
      const response = await client.post(
        `/flashcards-class/sets/${setId}/flashcards`,
        {
          question: questionText.trim(),
          answer: answerText.trim(),
        },
      );

      if (response.data.success) {
        Alert.alert("Success", "Flashcard created successfully!");
        setShowFlashcardModal(false);
        resetFlashcardForm();
        await fetchFlashcardSetDetails();
      }
    } catch (error) {
      console.error("Error creating flashcard:", error);
      Alert.alert("Error", "Failed to create flashcard");
    } finally {
      setSubmitting(false);
    }
  };

  // Update existing flashcard
  const handleUpdateFlashcard = async () => {
    if (!questionText.trim() || !answerText.trim()) {
      Alert.alert("Error", "Please fill in both question and answer");
      return;
    }

    if (!editingFlashcard) return;

    try {
      setSubmitting(true);
      const response = await client.put(
        `/flashcards-class/flashcards/${editingFlashcard.id}`,
        {
          question: questionText.trim(),
          answer: answerText.trim(),
        },
      );

      if (response.data.success) {
        Alert.alert("Success", "Flashcard updated successfully!");
        setShowFlashcardModal(false);
        resetFlashcardForm();
        await fetchFlashcardSetDetails();
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
      Alert.alert("Error", "Failed to update flashcard");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete flashcard
  const handleDeleteFlashcard = (flashcard: Flashcard) => {
    Alert.alert(
      "Delete Flashcard",
      "Are you sure you want to delete this flashcard? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await client.delete(
                `/flashcards-class/flashcards/${flashcard.id}`,
              );

              if (response.data.success) {
                Alert.alert("Success", "Flashcard deleted successfully!");
                await fetchFlashcardSetDetails();
                // Reset current card index if needed
                if (
                  currentCardIndex >= flashcards.length - 1 &&
                  currentCardIndex > 0
                ) {
                  setCurrentCardIndex(currentCardIndex - 1);
                }
              }
            } catch (error) {
              console.error("Error deleting flashcard:", error);
              Alert.alert("Error", "Failed to delete flashcard");
            }
          },
        },
      ],
    );
  };

  // Open modal for editing
  const openEditModal = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setQuestionText(flashcard.question);
    setAnswerText(flashcard.answer);
    setShowFlashcardModal(true);
  };

  // Open modal for creating new flashcard
  const openCreateModal = () => {
    resetFlashcardForm();
    setShowFlashcardModal(true);
  };

  // Reset form
  const resetFlashcardForm = () => {
    setEditingFlashcard(null);
    setQuestionText("");
    setAnswerText("");
  };

  const currentCard = flashcards[currentCardIndex];

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      Alert.alert(
        "Completed!",
        "You've finished all flashcards in this set! 🎉",
        [{ text: "OK" }],
      );
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-blue-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-blue-600 mt-4">Loading flashcards...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-50">
      {/* Header */}
      <View className="bg-blue-500 pt-12 pb-6 px-6">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white ml-2 font-medium">Back</Text>
          </TouchableOpacity>

          {/* Add Flashcard Button */}
          <TouchableOpacity
            onPress={openCreateModal}
            className="flex-row items-center bg-white/20 px-3 py-2 rounded-lg"
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text className="text-white ml-1 font-medium">Add Card</Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text className="text-2xl font-bold text-white mb-1">{title}</Text>
          <Text className="text-blue-100">{className}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        <View className="p-6">
          {/* Flashcard Set Info */}
          {flashcardSet && (
            <View className="bg-white rounded-2xl p-4 mb-6 shadow-lg border border-blue-100">
              <View className="flex-row items-center mb-2">
                <View className="bg-blue-100 rounded-lg p-2 mr-3">
                  <Ionicons name="book-outline" size={20} color="#3B82F6" />
                </View>
                <Text className="text-blue-700 font-medium">Flashcard Set</Text>
              </View>
              {flashcardSet.description && (
                <Text className="text-gray-600 text-sm mt-2 leading-5">
                  {flashcardSet.description}
                </Text>
              )}
              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-blue-100">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text className="text-gray-500 text-xs ml-1">
                    Created:{" "}
                    {new Date(flashcardSet.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="flash-outline" size={14} color="#8B5CF6" />
                  <Text className="text-gray-500 text-xs ml-1">
                    {flashcards.length} card{flashcards.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Flashcard Study */}
          {flashcards.length > 0 ? (
            <View className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <Text className="text-center text-gray-500 mb-2">
                Card {currentCardIndex + 1} of {flashcards.length}
              </Text>

              <View className="bg-blue-50 rounded-xl p-6 mb-6 min-h-[250px] justify-center">
                <Text className="text-xl font-semibold text-gray-900 text-center mb-4">
                  {showAnswer ? "Answer:" : "Question:"}
                </Text>
                <Text className="text-lg text-gray-700 text-center leading-6">
                  {showAnswer ? currentCard?.answer : currentCard?.question}
                </Text>
              </View>

              <TouchableOpacity
                className="bg-blue-500 rounded-xl py-3 mb-4"
                onPress={() => setShowAnswer(!showAnswer)}
              >
                <Text className="text-white font-medium text-center">
                  {showAnswer ? "Show Question" : "Show Answer"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-between gap-3 mb-4">
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center ${
                    currentCardIndex === 0 ? "bg-gray-300" : "bg-gray-500"
                  }`}
                  onPress={previousCard}
                  disabled={currentCardIndex === 0}
                >
                  <Ionicons name="arrow-back" size={18} color="white" />
                  <Text className="text-white font-medium ml-2">Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center ${
                    currentCardIndex === flashcards.length - 1
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  onPress={nextCard}
                >
                  <Text className="text-white font-medium mr-2">
                    {currentCardIndex === flashcards.length - 1
                      ? "Finish"
                      : "Next"}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </TouchableOpacity>
              </View>

              {/* Edit/Delete buttons for current card */}
              <View className="flex-row justify-center gap-3 pt-3 border-t border-gray-200">
                <TouchableOpacity
                  className="bg-yellow-500 px-4 py-2 rounded-lg flex-row items-center"
                  onPress={() => openEditModal(currentCard)}
                >
                  <Ionicons name="create-outline" size={18} color="white" />
                  <Text className="text-white font-medium ml-1">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-red-500 px-4 py-2 rounded-lg flex-row items-center"
                  onPress={() => handleDeleteFlashcard(currentCard)}
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                  <Text className="text-white font-medium ml-1">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center shadow-lg border border-blue-100">
              <View className="bg-gray-100 rounded-full p-4 mb-4">
                <Ionicons name="flash-outline" size={64} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-lg font-semibold mt-2 text-center">
                No Flashcards Yet
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Start by creating your first flashcard!
              </Text>
              <TouchableOpacity
                className="mt-6 bg-blue-500 px-6 py-3 rounded-xl flex-row items-center"
                onPress={openCreateModal}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text className="text-white font-medium ml-2">
                  Create First Flashcard
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Progress Indicator */}
          {flashcards.length > 0 && (
            <View className="mt-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600 text-sm">Progress</Text>
                <Text className="text-blue-600 text-sm font-medium">
                  {Math.round(
                    ((currentCardIndex + 1) / flashcards.length) * 100,
                  )}
                  %
                </Text>
              </View>
              <View className="bg-gray-200 rounded-full h-2">
                <View
                  className="bg-blue-500 rounded-full h-2"
                  style={{
                    width: `${((currentCardIndex + 1) / flashcards.length) * 100}%`,
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Flashcard Create/Edit Modal */}
      <Modal
        visible={showFlashcardModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              {editingFlashcard ? "Edit Flashcard" : "Create New Flashcard"}
            </Text>

            {/* Question Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Question</Text>
              <TextInput
                placeholder="Enter the question"
                value={questionText}
                onChangeText={setQuestionText}
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-700"
                textAlignVertical="top"
              />
            </View>

            {/* Answer Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Answer</Text>
              <TextInput
                placeholder="Enter the answer"
                value={answerText}
                onChangeText={setAnswerText}
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-700"
                textAlignVertical="top"
              />
            </View>

            {/* Buttons */}
            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                onPress={() => {
                  setShowFlashcardModal(false);
                  resetFlashcardForm();
                }}
                disabled={submitting}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-xl ${
                  questionText.trim() && answerText.trim()
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
                onPress={
                  editingFlashcard
                    ? handleUpdateFlashcard
                    : handleCreateFlashcard
                }
                disabled={
                  !questionText.trim() || !answerText.trim() || submitting
                }
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-medium text-center">
                    {editingFlashcard ? "Update" : "Create"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
