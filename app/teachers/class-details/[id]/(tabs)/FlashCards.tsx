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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  flashcards_class?: Flashcard[];
}

export default function TeacherFlashcards() {
  const router = useRouter();
  const { id: classId } = useLocalSearchParams();
  const user = useSelector((state: any) => state.auth.user);

  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSetModal, setShowAddSetModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditSetModal, setShowEditSetModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [editingCard, setEditingCard] = useState<{
    setId: string;
    card: Flashcard;
  } | null>(null);
  const [editCardData, setEditCardData] = useState({
    question: "",
    answer: "",
  });

  const [newSet, setNewSet] = useState({
    title: "",
    description: "",
  });

  const [editSet, setEditSet] = useState({
    id: "",
    title: "",
    description: "",
  });

  const [newFlashcard, setNewFlashcard] = useState({
    question: "",
    answer: "",
  });

  // Helper function to safely get flashcards array
  const getFlashcards = (set: FlashcardSet): Flashcard[] => {
    return set.flashcards_class || [];
  };

  // Validation functions
  const isAddSetValid = () => {
    return newSet.title.trim() !== "";
  };

  const isEditSetValid = () => {
    return editSet.title.trim() !== "";
  };

  const isAddFlashcardValid = () => {
    return (
      newFlashcard.question.trim() !== "" && newFlashcard.answer.trim() !== ""
    );
  };

  const isEditFlashcardValid = () => {
    return (
      editCardData.question.trim() !== "" && editCardData.answer.trim() !== ""
    );
  };

  // Fetch all flashcard sets for this class
  const fetchFlashcardSets = async () => {
    if (!classId) {
      console.log("No classId available, skipping fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await client.get(`/flashcards-class/class/${classId}`);
      if (response.data.success) {
        const setsWithFlashcards = response.data.data.map(
          (set: FlashcardSet) => ({
            ...set,
            flashcards_class: set.flashcards_class || [],
          }),
        );
        setFlashcardSets(setsWithFlashcards);
      }
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      Alert.alert("Error", "Failed to load flashcard sets");
      setFlashcardSets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcardSets();
  }, [classId]);

  // Create new flashcard set
  const handleAddSet = async () => {
    if (!newSet.title) {
      Alert.alert("Error", "Title is required");
      return;
    }

    try {
      const response = await client.post(
        `/flashcards-class/class/${classId}/sets`,
        {
          title: newSet.title,
          description: newSet.description,
        },
      );

      if (response.data.success) {
        const newSetWithFlashcards = {
          ...response.data.data,
          flashcards_class: [],
        };
        setFlashcardSets((prev) => [...prev, newSetWithFlashcards]);
        setShowAddSetModal(false);
        setNewSet({ title: "", description: "" });
        Alert.alert("Success", "Flashcard set created!");
      }
    } catch (error: any) {
      console.error("Error creating set:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create flashcard set",
      );
    }
  };

  // Update flashcard set
  const handleUpdateSet = async () => {
    if (!editSet.title) {
      Alert.alert("Error", "Title is required");
      return;
    }

    try {
      const response = await client.put(
        `/flashcards-class/sets/${editSet.id}`,
        {
          title: editSet.title,
          description: editSet.description,
        },
      );

      if (response.data.success) {
        setFlashcardSets((prev) =>
          prev.map((set) =>
            set.id === editSet.id
              ? {
                  ...response.data.data,
                  flashcards_class: getFlashcards(set),
                }
              : set,
          ),
        );
        setShowEditSetModal(false);
        setEditSet({ id: "", title: "", description: "" });
        Alert.alert("Success", "Flashcard set updated!");
      }
    } catch (error) {
      console.error("Error updating set:", error);
      Alert.alert("Error", "Failed to update flashcard set");
    }
  };

  // Delete flashcard set
  const deleteSet = async (id: string) => {
    Alert.alert(
      "Delete Set",
      "Are you sure you want to delete this flashcard set? All flashcards in this set will also be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await client.delete(
                `/flashcards-class/sets/${id}`,
              );
              if (response.data.success) {
                setFlashcardSets((prev) => prev.filter((set) => set.id !== id));
                Alert.alert("Success", "Flashcard set deleted!");
              }
            } catch (error) {
              console.error("Error deleting set:", error);
              Alert.alert("Error", "Failed to delete flashcard set");
            }
          },
        },
      ],
    );
  };

  // Add flashcard to set
  const handleAddFlashcard = async () => {
    if (!currentSet || !newFlashcard.question || !newFlashcard.answer) {
      Alert.alert("Error", "Question and answer are required");
      return;
    }

    try {
      const response = await client.post(
        `/flashcards-class/sets/${currentSet.id}/flashcards`,
        {
          question: newFlashcard.question,
          answer: newFlashcard.answer,
        },
      );

      if (response.data.success) {
        setFlashcardSets((prev) =>
          prev.map((set) =>
            set.id === currentSet.id
              ? {
                  ...set,
                  flashcards_class: [...getFlashcards(set), response.data.data],
                }
              : set,
          ),
        );
        setShowAddCardModal(false);
        setNewFlashcard({ question: "", answer: "" });
        Alert.alert("Success", "Flashcard added!");
      }
    } catch (error) {
      console.error("Error adding flashcard:", error);
      Alert.alert("Error", "Failed to add flashcard");
    }
  };

  // Delete flashcard
  const deleteFlashcard = async (setId: string, cardId: string) => {
    Alert.alert(
      "Delete Flashcard",
      "Are you sure you want to delete this flashcard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await client.delete(
                `/flashcards-class/flashcards/${cardId}`,
              );
              if (response.data.success) {
                setFlashcardSets((prev) =>
                  prev.map((set) =>
                    set.id === setId
                      ? {
                          ...set,
                          flashcards_class: getFlashcards(set).filter(
                            (card) => card.id !== cardId,
                          ),
                        }
                      : set,
                  ),
                );
                Alert.alert("Success", "Flashcard deleted!");
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

  // Update flashcard
  const handleUpdateFlashcard = async (
    setId: string,
    cardId: string,
    updates: { question?: string; answer?: string },
  ) => {
    try {
      const response = await client.put(
        `/flashcards-class/flashcards/${cardId}`,
        updates,
      );
      if (response.data.success) {
        setFlashcardSets((prev) =>
          prev.map((set) =>
            set.id === setId
              ? {
                  ...set,
                  flashcards_class: getFlashcards(set).map((card) =>
                    card.id === cardId ? response.data.data : card,
                  ),
                }
              : set,
          ),
        );
        Alert.alert("Success", "Flashcard updated!");
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
      Alert.alert("Error", "Failed to update flashcard");
    }
  };

  // Edit Flashcard Modal functions
  const openEditFlashcardModal = (setId: string, card: Flashcard) => {
    setEditingCard({ setId, card });
    setEditCardData({ question: card.question, answer: card.answer });
    setShowEditCardModal(true);
  };

  const handleEditFlashcard = async () => {
    if (!editingCard) return;

    if (!editCardData.question || !editCardData.answer) {
      Alert.alert("Error", "Question and answer are required");
      return;
    }

    await handleUpdateFlashcard(editingCard.setId, editingCard.card.id, {
      question: editCardData.question,
      answer: editCardData.answer,
    });

    setShowEditCardModal(false);
    setEditingCard(null);
    setEditCardData({ question: "", answer: "" });
  };

  // Study functions
  const startStudying = (set: FlashcardSet) => {
    const flashcards = getFlashcards(set);
    if (flashcards.length === 0) {
      Alert.alert("No Flashcards", "Add some flashcards to this set first!");
      return;
    }
    setCurrentSet(set);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setShowStudyModal(true);
  };

  const nextCard = () => {
    if (currentSet && currentCardIndex < getFlashcards(currentSet).length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      setShowStudyModal(false);
      Alert.alert(
        "Completed!",
        "You've reviewed all flashcards in this set! 🎉",
      );
    }
  };

  const openAddCardModal = (set: FlashcardSet) => {
    setCurrentSet(set);
    setShowAddCardModal(true);
  };

  const openEditSetModal = (set: FlashcardSet) => {
    setEditSet({
      id: set.id,
      title: set.title,
      description: set.description || "",
    });
    setShowEditSetModal(true);
  };

  const currentCard = currentSet
    ? getFlashcards(currentSet)[currentCardIndex]
    : undefined;

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text className="text-gray-600 mt-4">Loading flashcards...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-white border-b border-gray-200">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">
            Class Flashcards
          </Text>
        </View>
        <Text className="text-gray-600 mt-1">
          Create and manage flashcards for your class
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View className="mx-4 mb-6 mt-4">
          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-4 flex-row items-center justify-center"
            onPress={() => setShowAddSetModal(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              Create New Flashcard Set
            </Text>
          </TouchableOpacity>
        </View>

        {/* Flashcard Sets List */}
        <View className="mx-4 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Flashcard Sets ({flashcardSets.length})
          </Text>

          {flashcardSets.length > 0 ? (
            flashcardSets.map((set) => {
              const flashcards = getFlashcards(set);
              const cardCount = flashcards.length;

              return (
                <View
                  key={set.id}
                  className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 text-lg">
                        {set.title}
                      </Text>
                      {set.description && (
                        <Text className="text-gray-600 text-sm mt-1">
                          {set.description}
                        </Text>
                      )}
                      <View className="flex-row items-center mt-2 gap-4">
                        <Text className="text-gray-500 text-sm">
                          {cardCount} card{cardCount !== 1 ? "s" : ""}
                        </Text>
                        <Text className="text-green-600 text-xs font-medium">
                          Class Set
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-2 flex-wrap">
                    <TouchableOpacity
                      className="bg-green-100 px-3 py-2 rounded-lg flex-row items-center mb-2"
                      onPress={() => startStudying(set)}
                    >
                      <Ionicons name="play" size={14} color="#10B981" />
                      <Text className="text-green-700 text-xs font-medium ml-1">
                        Study
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-blue-100 px-3 py-2 rounded-lg flex-row items-center mb-2"
                      onPress={() => openAddCardModal(set)}
                    >
                      <Ionicons name="add" size={14} color="#3B82F6" />
                      <Text className="text-blue-600 text-xs font-medium ml-1">
                        Add Card
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-yellow-100 px-3 py-2 rounded-lg flex-row items-center mb-2"
                      onPress={() => openEditSetModal(set)}
                    >
                      <Ionicons name="create" size={14} color="#D97706" />
                      <Text className="text-yellow-700 text-xs font-medium ml-1">
                        Edit Set
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-red-100 px-3 py-2 rounded-lg flex-row items-center mb-2"
                      onPress={() => deleteSet(set.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#EF4444"
                      />
                      <Text className="text-red-600 text-xs font-medium ml-1">
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Flashcards in this set */}
                  {cardCount > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-100">
                      <Text className="text-gray-700 text-sm font-medium mb-2">
                        Cards in this set:
                      </Text>
                      {flashcards.map((card) => (
                        <View
                          key={card.id}
                          className="bg-gray-50 rounded-lg p-3 mb-2"
                        >
                          <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                              <Text className="font-medium text-gray-900 text-sm">
                                Q: {card.question}
                              </Text>
                              <Text className="text-gray-600 text-xs mt-1">
                                A: {card.answer}
                              </Text>
                            </View>
                            <View className="flex-row gap-1">
                              <TouchableOpacity
                                onPress={() =>
                                  openEditFlashcardModal(set.id, card)
                                }
                                className="ml-2"
                              >
                                <Ionicons
                                  name="create"
                                  size={16}
                                  color="#3B82F6"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => deleteFlashcard(set.id, card.id)}
                                className="ml-1"
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={16}
                                  color="#EF4444"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View className="bg-gray-50 rounded-xl p-8 items-center">
              <Ionicons name="copy-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg font-semibold mt-4 text-center">
                No Flashcard Sets Yet
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Create your first flashcard set for your students!
              </Text>
              <TouchableOpacity
                className="bg-blue-500 rounded-xl py-3 px-6 flex-row items-center mt-4"
                onPress={() => setShowAddSetModal(true)}
              >
                <Ionicons name="add-circle-outline" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Create First Set
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Set Modal */}
      <Modal visible={showAddSetModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Create Flashcard Set
              </Text>
              <TouchableOpacity onPress={() => setShowAddSetModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Set Title Input */}
            <View className="mb-3">
              <Text className="text-gray-700 font-medium mb-1">
                Set Title <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter set title"
                value={newSet.title}
                onChangeText={(text) =>
                  setNewSet((prev) => ({ ...prev, title: text }))
                }
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Set Description Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-1">
                Description <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter description"
                value={newSet.description}
                onChangeText={(text) =>
                  setNewSet((prev) => ({ ...prev, description: text }))
                }
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                onPress={() => setShowAddSetModal(false)}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-xl ${
                  isAddSetValid() ? "bg-blue-500" : "bg-gray-300"
                }`}
                onPress={handleAddSet}
                disabled={!isAddSetValid()}
              >
                <Text className="text-white font-medium text-center">
                  Create Set
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Set Modal */}
      <Modal
        visible={showEditSetModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Edit Flashcard Set
              </Text>
              <TouchableOpacity onPress={() => setShowEditSetModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Set Title Input */}
            <View className="mb-3">
              <Text className="text-gray-700 font-medium mb-1">
                Set Title <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter set title"
                value={editSet.title}
                onChangeText={(text) =>
                  setEditSet((prev) => ({ ...prev, title: text }))
                }
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Set Description Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-1">
                Description (Optional)
              </Text>
              <TextInput
                placeholder="Enter description"
                value={editSet.description}
                onChangeText={(text) =>
                  setEditSet((prev) => ({ ...prev, description: text }))
                }
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                onPress={() => setShowEditSetModal(false)}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-xl ${
                  isEditSetValid() ? "bg-blue-500" : "bg-gray-300"
                }`}
                onPress={handleUpdateSet}
                disabled={!isEditSetValid()}
              >
                <Text className="text-white font-medium text-center">
                  Update Set
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Flashcard Modal */}
      <Modal
        visible={showAddCardModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Add Flashcard to {currentSet?.title}
              </Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Question Input */}
            <View className="mb-3">
              <Text className="text-gray-700 font-medium mb-1">
                Question <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter question"
                value={newFlashcard.question}
                onChangeText={(text) =>
                  setNewFlashcard((prev) => ({ ...prev, question: text }))
                }
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Answer Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-1">
                Answer <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter answer"
                value={newFlashcard.answer}
                onChangeText={(text) =>
                  setNewFlashcard((prev) => ({ ...prev, answer: text }))
                }
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                onPress={() => setShowAddCardModal(false)}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-xl ${
                  isAddFlashcardValid() ? "bg-blue-500" : "bg-gray-300"
                }`}
                onPress={handleAddFlashcard}
                disabled={!isAddFlashcardValid()}
              >
                <Text className="text-white font-medium text-center">
                  Add Card
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Flashcard Modal */}
      <Modal
        visible={showEditCardModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Edit Flashcard
              </Text>
              <TouchableOpacity onPress={() => setShowEditCardModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Question Input */}
            <View className="mb-3">
              <Text className="text-gray-700 font-medium mb-1">
                Question <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter question"
                value={editCardData.question}
                onChangeText={(text) =>
                  setEditCardData((prev) => ({ ...prev, question: text }))
                }
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Answer Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-1">
                Answer <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter answer"
                value={editCardData.answer}
                onChangeText={(text) =>
                  setEditCardData((prev) => ({ ...prev, answer: text }))
                }
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                onPress={() => setShowEditCardModal(false)}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-xl ${
                  isEditFlashcardValid() ? "bg-blue-500" : "bg-gray-300"
                }`}
                onPress={handleEditFlashcard}
                disabled={!isEditFlashcardValid()}
              >
                <Text className="text-white font-medium text-center">
                  Update Card
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Study Modal */}
      <Modal visible={showStudyModal} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12">
            {currentSet && currentCard && (
              <>
                <Text className="text-center text-gray-500 mb-2">
                  {currentSet.title} • Card {currentCardIndex + 1} of{" "}
                  {getFlashcards(currentSet).length}
                </Text>

                <View className="bg-blue-50 rounded-xl p-6 mb-6 min-h-[200px] justify-center">
                  <Text className="text-xl font-semibold text-gray-900 text-center mb-4">
                    {showAnswer ? "Answer:" : "Question:"}
                  </Text>
                  <Text className="text-lg text-gray-700 text-center">
                    {showAnswer ? currentCard.answer : currentCard.question}
                  </Text>
                </View>

                <View className="flex-row justify-between gap-3 mb-4">
                  <TouchableOpacity
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                    onPress={() => setShowAnswer(!showAnswer)}
                  >
                    <Text className="text-gray-700 font-medium text-center">
                      {showAnswer ? "Show Question" : "Show Answer"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between gap-3">
                  <TouchableOpacity
                    className="flex-1 py-3 px-4 bg-red-500 rounded-xl"
                    onPress={() => setShowStudyModal(false)}
                  >
                    <Text className="text-white font-medium text-center">
                      Stop
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 px-4 bg-green-500 rounded-xl"
                    onPress={nextCard}
                  >
                    <Text className="text-white font-medium text-center">
                      {currentCardIndex === getFlashcards(currentSet).length - 1
                        ? "Finish"
                        : "Next"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
