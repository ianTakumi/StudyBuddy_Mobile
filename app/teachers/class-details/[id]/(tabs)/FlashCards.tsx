import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

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

  const getFlashcards = (set: FlashcardSet): Flashcard[] => {
    return set.flashcards_class || [];
  };

  const isAddSetValid = () => newSet.title.trim() !== "";
  const isEditSetValid = () => editSet.title.trim() !== "";
  const isAddFlashcardValid = () =>
    newFlashcard.question.trim() !== "" && newFlashcard.answer.trim() !== "";
  const isEditFlashcardValid = () =>
    editCardData.question.trim() !== "" && editCardData.answer.trim() !== "";

  const fetchFlashcardSets = async () => {
    if (!classId) {
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
              ? { ...response.data.data, flashcards_class: getFlashcards(set) }
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
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading flashcards...
        </Text>
      </View>
    );
  }

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

        <Text className="text-3xl font-bold text-white mb-1">
          Class Flashcards
        </Text>
        <Text className="text-emerald-100 text-base">
          Create and manage flashcards for your class
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View className="mx-4 mb-6 mt-6">
          <TouchableOpacity
            className="bg-emerald-500 rounded-2xl py-4 flex-row items-center justify-center"
            onPress={() => setShowAddSetModal(true)}
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
              <Ionicons name="add" size={20} color="white" />
            </View>
            <Text className="text-white font-bold text-lg">
              Create New Flashcard Set
            </Text>
          </TouchableOpacity>
        </View>

        {/* Flashcard Sets List */}
        <View className="mx-4 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="copy-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              Flashcard Sets ({flashcardSets.length})
            </Text>
          </View>

          {flashcardSets.length > 0 ? (
            flashcardSets.map((set) => {
              const flashcards = getFlashcards(set);
              const cardCount = flashcards.length;

              return (
                <View
                  key={set.id}
                  className="bg-white rounded-3xl p-5 mb-4 relative overflow-hidden"
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    elevation: 5,
                  }}
                >
                  <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full opacity-70" />
                  <View className="absolute -bottom-3 -left-3 w-12 h-12 bg-emerald-50 rounded-full opacity-70" />

                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                          <Ionicons
                            name="copy-outline"
                            size={20}
                            color="#10B981"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="font-bold text-gray-900 text-lg">
                            {set.title}
                          </Text>
                          {set.description && (
                            <Text className="text-gray-600 text-sm mt-0.5">
                              {set.description}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View className="flex-row items-center ml-13 gap-3">
                        <View className="flex-row items-center">
                          <View className="w-4 h-4 bg-emerald-200 rounded-full items-center justify-center mr-1">
                            <Ionicons
                              name="copy-outline"
                              size={9}
                              color="#10B981"
                            />
                          </View>
                          <Text className="text-gray-500 text-sm">
                            {cardCount} card{cardCount !== 1 ? "s" : ""}
                          </Text>
                        </View>
                        <View className="bg-emerald-100 rounded-full px-3 py-0.5">
                          <Text className="text-emerald-700 text-xs font-semibold">
                            Class Set
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-2 flex-wrap ml-13">
                    <TouchableOpacity
                      className="bg-emerald-500 px-4 py-2 rounded-full flex-row items-center"
                      onPress={() => startStudying(set)}
                    >
                      <Ionicons name="play" size={14} color="white" />
                      <Text className="text-white text-xs font-semibold ml-1.5">
                        Study
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-emerald-100 px-4 py-2 rounded-full flex-row items-center"
                      onPress={() => openAddCardModal(set)}
                    >
                      <Ionicons name="add" size={14} color="#10B981" />
                      <Text className="text-emerald-700 text-xs font-semibold ml-1.5">
                        Add Card
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-amber-100 px-4 py-2 rounded-full flex-row items-center"
                      onPress={() => openEditSetModal(set)}
                    >
                      <Ionicons name="create" size={14} color="#D97706" />
                      <Text className="text-amber-700 text-xs font-semibold ml-1.5">
                        Edit Set
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-red-50 px-3 py-2 rounded-full flex-row items-center"
                      onPress={() => deleteSet(set.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>

                  {cardCount > 0 && (
                    <View className="mt-4 pt-4 border-t border-emerald-100 ml-13">
                      <Text className="text-gray-700 text-sm font-semibold mb-3">
                        Cards in this set:
                      </Text>
                      {flashcards.map((card) => (
                        <View
                          key={card.id}
                          className="bg-emerald-50 rounded-2xl p-3 mb-2"
                        >
                          <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                              <Text className="font-semibold text-gray-900 text-sm">
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
                                className="w-7 h-7 bg-emerald-100 rounded-full items-center justify-center"
                              >
                                <Ionicons
                                  name="create"
                                  size={14}
                                  color="#10B981"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => deleteFlashcard(set.id, card.id)}
                                className="w-7 h-7 bg-red-50 rounded-full items-center justify-center ml-1"
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={14}
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
            <View
              className="bg-white rounded-3xl p-8 items-center relative overflow-hidden"
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

              <View
                className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Ionicons name="copy-outline" size={36} color="#10B981" />
              </View>
              <Text className="text-gray-800 text-lg font-bold text-center">
                No Flashcard Sets Yet
              </Text>
              <Text className="text-gray-500 text-center mt-2 text-sm">
                Create your first flashcard set for your students!
              </Text>
              <TouchableOpacity
                className="bg-emerald-500 rounded-2xl py-4 px-8 flex-row items-center mt-4"
                onPress={() => setShowAddSetModal(true)}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2">
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
          <View
            className="bg-white rounded-3xl p-6 mx-4 w-11/12 relative overflow-hidden"
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

            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#10B981"
                  />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Create Flashcard Set
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddSetModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Set Title <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter set title"
                value={newSet.title}
                onChangeText={(text) =>
                  setNewSet((prev) => ({ ...prev, title: text }))
                }
                className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Description
              </Text>
              <TextInput
                placeholder="Enter description"
                value={newSet.description}
                onChangeText={(text) =>
                  setNewSet((prev) => ({ ...prev, description: text }))
                }
                className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                onPress={() => setShowAddSetModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 px-4 rounded-2xl ${isAddSetValid() ? "bg-emerald-500" : "bg-gray-300"}`}
                onPress={handleAddSet}
                disabled={!isAddSetValid()}
                style={
                  isAddSetValid()
                    ? {
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8,
                      }
                    : {}
                }
              >
                <Text className="text-white font-bold text-center">
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
          <View
            className="bg-white rounded-3xl p-6 mx-4 w-11/12 relative overflow-hidden"
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

            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="create-outline" size={22} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Edit Flashcard Set
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditSetModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Set Title <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter set title"
                value={editSet.title}
                onChangeText={(text) =>
                  setEditSet((prev) => ({ ...prev, title: text }))
                }
                className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Description (Optional)
              </Text>
              <TextInput
                placeholder="Enter description"
                value={editSet.description}
                onChangeText={(text) =>
                  setEditSet((prev) => ({ ...prev, description: text }))
                }
                className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                onPress={() => setShowEditSetModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 px-4 rounded-2xl ${isEditSetValid() ? "bg-emerald-500" : "bg-gray-300"}`}
                onPress={handleUpdateSet}
                disabled={!isEditSetValid()}
                style={
                  isEditSetValid()
                    ? {
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8,
                      }
                    : {}
                }
              >
                <Text className="text-white font-bold text-center">
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
          <View
            className="bg-white rounded-3xl p-6 mx-4 w-11/12 relative overflow-hidden"
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

            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#10B981"
                  />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Add Flashcard
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {currentSet && (
              <Text className="text-emerald-600 font-semibold mb-4">
                To: {currentSet.title}
              </Text>
            )}

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Question <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter question"
                value={newFlashcard.question}
                onChangeText={(text) =>
                  setNewFlashcard((prev) => ({ ...prev, question: text }))
                }
                className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Answer <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter answer"
                value={newFlashcard.answer}
                onChangeText={(text) =>
                  setNewFlashcard((prev) => ({ ...prev, answer: text }))
                }
                className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                onPress={() => setShowAddCardModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 px-4 rounded-2xl ${isAddFlashcardValid() ? "bg-emerald-500" : "bg-gray-300"}`}
                onPress={handleAddFlashcard}
                disabled={!isAddFlashcardValid()}
                style={
                  isAddFlashcardValid()
                    ? {
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8,
                      }
                    : {}
                }
              >
                <Text className="text-white font-bold text-center">
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
          <View
            className="bg-white rounded-3xl p-6 mx-4 w-11/12 relative overflow-hidden"
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

            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="create-outline" size={22} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Edit Flashcard
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditCardModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Question <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter question"
                value={editCardData.question}
                onChangeText={(text) =>
                  setEditCardData((prev) => ({ ...prev, question: text }))
                }
                className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Answer <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Enter answer"
                value={editCardData.answer}
                onChangeText={(text) =>
                  setEditCardData((prev) => ({ ...prev, answer: text }))
                }
                className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                onPress={() => setShowEditCardModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 px-4 rounded-2xl ${isEditFlashcardValid() ? "bg-emerald-500" : "bg-gray-300"}`}
                onPress={handleEditFlashcard}
                disabled={!isEditFlashcardValid()}
                style={
                  isEditFlashcardValid()
                    ? {
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 8,
                      }
                    : {}
                }
              >
                <Text className="text-white font-bold text-center">
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
            <View className="absolute -top-8 -right-8 w-20 h-20 bg-emerald-100 rounded-full opacity-50" />
            <View className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-50 rounded-full opacity-50" />

            {currentSet && currentCard && (
              <>
                <View className="bg-emerald-100 rounded-full px-4 py-1.5 mb-4 self-center">
                  <Text className="text-emerald-600 text-sm font-semibold">
                    {currentSet.title} • Card {currentCardIndex + 1} of{" "}
                    {getFlashcards(currentSet).length}
                  </Text>
                </View>

                <View className="bg-emerald-50 rounded-2xl p-8 mb-6 min-h-[200px] justify-center">
                  <Text className="text-lg font-bold text-emerald-600 text-center mb-3">
                    {showAnswer ? "Answer:" : "Question:"}
                  </Text>
                  <Text className="text-xl text-gray-800 text-center font-medium">
                    {showAnswer ? currentCard.answer : currentCard.question}
                  </Text>
                </View>

                <View className="flex-row gap-3 mb-4">
                  <TouchableOpacity
                    className="flex-1 py-4 px-4 bg-emerald-100 rounded-2xl"
                    onPress={() => setShowAnswer(!showAnswer)}
                  >
                    <Text className="text-emerald-700 font-bold text-center">
                      {showAnswer ? "Show Question" : "Show Answer"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 py-4 px-4 bg-red-50 rounded-2xl"
                    onPress={() => setShowStudyModal(false)}
                  >
                    <Text className="text-red-600 font-bold text-center">
                      Stop
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-4 px-4 bg-emerald-500 rounded-2xl"
                    onPress={nextCard}
                    style={{
                      shadowColor: "#10B981",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 16,
                      elevation: 8,
                    }}
                  >
                    <Text className="text-white font-bold text-center">
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
