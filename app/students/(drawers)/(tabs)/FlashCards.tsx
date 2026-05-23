import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  RefreshControl,
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
  flashcard_set_id: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  subject: string;
  user_id: string;
  created_at: string;
  flashcards?: Flashcard[];
}

// Skeleton Loader Component
const SkeletonLoader = () => {
  const animatedValue = new Animated.Value(0.3);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const opacity = animatedValue;

  const SkeletonItem = ({ width = "100%", height = 20, className = "" }) => (
    <Animated.View
      style={{ opacity }}
      className={`bg-emerald-200 rounded-lg ${className}`}
    >
      <View style={{ width, height }} />
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-emerald-50">
      {/* Header Skeleton */}
      <View
        className="w-full pt-16 pb-8 px-6 bg-emerald-500"
        style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
      >
        <SkeletonItem
          width="150px"
          height={32}
          className="bg-emerald-400/50 mb-2"
        />
        <SkeletonItem width="100px" height={20} className="bg-emerald-400/50" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Quick Actions Skeleton */}
        <View className="mx-4 mt-6 mb-6">
          <View className="bg-emerald-200 rounded-2xl py-4 items-center">
            <SkeletonItem
              width="120px"
              height={20}
              className="bg-emerald-300/50"
            />
          </View>
        </View>

        {/* Flashcard Sets Skeleton */}
        <View className="mx-4 mb-8">
          <SkeletonItem
            width="150px"
            height={24}
            className="mb-4 bg-emerald-300/50"
          />

          {[1, 2, 3].map((item) => (
            <View
              key={item}
              className="bg-white rounded-3xl p-5 mb-4"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <SkeletonItem
                    width="70%"
                    height={24}
                    className="mb-2 bg-emerald-200"
                  />
                  <SkeletonItem
                    width="90%"
                    height={16}
                    className="mb-2 bg-emerald-100"
                  />
                  <View className="flex-row items-center mt-2 gap-5">
                    <SkeletonItem
                      width="80px"
                      height={24}
                      className="bg-emerald-200"
                    />
                    <SkeletonItem
                      width="60px"
                      height={16}
                      className="bg-emerald-100"
                    />
                  </View>
                </View>
              </View>

              <View className="flex-row gap-2 flex-wrap">
                <SkeletonItem
                  width="70px"
                  height={32}
                  className="bg-emerald-200 rounded-full"
                />
                <SkeletonItem
                  width="80px"
                  height={32}
                  className="bg-emerald-200 rounded-full"
                />
                <SkeletonItem
                  width="70px"
                  height={32}
                  className="bg-emerald-200 rounded-full"
                />
                <SkeletonItem
                  width="60px"
                  height={32}
                  className="bg-emerald-200 rounded-full"
                />
              </View>

              <View className="mt-3 pt-3 border-t border-emerald-100">
                <SkeletonItem
                  width="120px"
                  height={16}
                  className="mb-2 bg-emerald-200"
                />
                <View className="bg-emerald-50 rounded-2xl p-3 mb-2">
                  <SkeletonItem
                    width="80%"
                    height={16}
                    className="mb-1 bg-emerald-100"
                  />
                  <SkeletonItem
                    width="60%"
                    height={14}
                    className="bg-emerald-100"
                  />
                </View>
                <View className="bg-emerald-50 rounded-2xl p-3">
                  <SkeletonItem
                    width="85%"
                    height={16}
                    className="mb-1 bg-emerald-100"
                  />
                  <SkeletonItem
                    width="65%"
                    height={14}
                    className="bg-emerald-100"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default function Flashcards() {
  const user = useSelector((state: any) => state.auth.user);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [showAddSetModal, setShowAddSetModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditSetModal, setShowEditSetModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newSet, setNewSet] = useState({
    title: "",
    description: "",
    subject: "",
  });
  const [editSet, setEditSet] = useState({
    id: "",
    title: "",
    description: "",
    subject: "",
  });
  const [newFlashcard, setNewFlashcard] = useState({
    question: "",
    answer: "",
  });

  // Helper function to safely get flashcards array
  const getFlashcards = (set: FlashcardSet): Flashcard[] => {
    return set.flashcards || [];
  };

  // Fetch all flashcard sets for the user
  const fetchFlashcardSets = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await client.get(`/flashcards/sets/${user.id}`);
      if (response.data.success) {
        const setsWithFlashcards = response.data.data.map(
          (set: FlashcardSet) => ({
            ...set,
            flashcards: set.flashcards || [],
          }),
        );
        setFlashcardSets(setsWithFlashcards);
      }
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      Alert.alert("Error", "Failed to load flashcard sets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFlashcardSets();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchFlashcardSets();
    }
  }, [user?.id]);

  // Create new flashcard set
  const handleAddSet = async () => {
    if (!newSet.title || !newSet.subject) {
      Alert.alert("Error", "Please fill in title and subject");
      return;
    }

    try {
      const response = await client.post("/flashcards/sets", {
        ...newSet,
        user_id: user.id,
      });

      if (response.data.success) {
        const newSetWithFlashcards = {
          ...response.data.data,
          flashcards: [],
        };
        setFlashcardSets((prev) => [...prev, newSetWithFlashcards]);
        setShowAddSetModal(false);
        setNewSet({ title: "", description: "", subject: "" });
        Alert.alert("Success", "Flashcard set created!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create flashcard set");
    }
  };

  // Update flashcard set
  const handleUpdateSet = async () => {
    if (!editSet.title || !editSet.subject) {
      Alert.alert("Error", "Please fill in title and subject");
      return;
    }

    try {
      const response = await client.put(`/flashcards/sets/${editSet.id}`, {
        title: editSet.title,
        description: editSet.description,
        subject: editSet.subject,
      });

      if (response.data.success) {
        setFlashcardSets((prev) =>
          prev.map((set) =>
            set.id === editSet.id
              ? {
                  ...response.data.data,
                  flashcards: getFlashcards(set),
                }
              : set,
          ),
        );
        setShowEditSetModal(false);
        setEditSet({ id: "", title: "", description: "", subject: "" });
        Alert.alert("Success", "Flashcard set updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update flashcard set");
    }
  };

  // Delete flashcard set
  const deleteSet = async (id: string) => {
    Alert.alert(
      "Delete Set",
      "Are you sure you want to delete this flashcard set?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await client.delete(`/flashcards/sets/${id}`);
              if (response.data.success) {
                setFlashcardSets((prev) => prev.filter((set) => set.id !== id));
                Alert.alert("Success", "Flashcard set deleted!");
              }
            } catch (error) {
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
      Alert.alert("Error", "Please fill in both question and answer");
      return;
    }

    try {
      const response = await client.post("/flashcards/cards", {
        ...newFlashcard,
        flashcard_set_id: currentSet.id,
      });

      if (response.data.success) {
        setFlashcardSets((prev) =>
          prev.map((set) =>
            set.id === currentSet.id
              ? {
                  ...set,
                  flashcards: [...getFlashcards(set), response.data.data],
                }
              : set,
          ),
        );
        setShowAddCardModal(false);
        setNewFlashcard({ question: "", answer: "" });
        Alert.alert("Success", "Flashcard added!");
      }
    } catch (error) {
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
                `/flashcards/cards/${cardId}`,
              );
              if (response.data.success) {
                setFlashcardSets((prev) =>
                  prev.map((set) =>
                    set.id === setId
                      ? {
                          ...set,
                          flashcards: getFlashcards(set).filter(
                            (card) => card.id !== cardId,
                          ),
                        }
                      : set,
                  ),
                );
                Alert.alert("Success", "Flashcard deleted!");
              }
            } catch (error) {
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
      const response = await client.put(`/flashcards/cards/${cardId}`, updates);
      if (response.data.success) {
        setFlashcardSets((prev) =>
          prev.map((set) =>
            set.id === setId
              ? {
                  ...set,
                  flashcards: getFlashcards(set).map((card) =>
                    card.id === cardId ? response.data.data : card,
                  ),
                }
              : set,
          ),
        );
        Alert.alert("Success", "Flashcard updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update flashcard");
    }
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
      subject: set.subject,
    });
    setShowEditSetModal(true);
  };

  const openEditFlashcardModal = (setId: string, card: Flashcard) => {
    Alert.prompt(
      "Edit Flashcard",
      "Update the question and answer:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: (question) => {
            if (question) {
              Alert.prompt(
                "Edit Answer",
                "Update the answer:",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Update",
                    onPress: (answer) => {
                      if (answer) {
                        handleUpdateFlashcard(setId, card.id, {
                          question,
                          answer,
                        });
                      }
                    },
                  },
                ],
                "plain-text",
                card.answer,
              );
            }
          },
        },
      ],
      "plain-text",
      card.question,
    );
  };

  const currentCard = currentSet
    ? getFlashcards(currentSet)[currentCardIndex]
    : undefined;

  // Show skeleton loader while loading
  if (loading && !refreshing) {
    return <SkeletonLoader />;
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

        <Text className="text-3xl font-bold text-white mb-1">Flashcards</Text>
        <Text className="text-emerald-100 text-base">
          {flashcardSets.length} set{flashcardSets.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
      >
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
            <Text className="text-white font-bold text-lg">New Set</Text>
          </TouchableOpacity>
        </View>

        {/* Flashcard Sets List */}
        <View className="mx-4 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="layers-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              Flashcard Sets
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
                  {/* Decorative circles */}
                  <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full opacity-70" />
                  <View className="absolute -bottom-3 -left-3 w-12 h-12 bg-emerald-50 rounded-full opacity-70" />

                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center">
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
                          {set.description ? (
                            <Text className="text-gray-600 text-sm mt-0.5">
                              {set.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <View className="flex-row items-center mt-2 ml-13 gap-3">
                        <View className="bg-emerald-100 rounded-full px-3 py-1">
                          <Text className="text-emerald-700 text-xs font-semibold">
                            {set.subject}
                          </Text>
                        </View>
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
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-2 flex-wrap ml-13">
                    <TouchableOpacity
                      className="bg-emerald-500 px-4 py-2 rounded-full flex-row items-center"
                      onPress={() => startStudying(set)}
                      style={{
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
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

                  {/* Flashcards in this set */}
                  {cardCount > 0 && (
                    <View className="mt-4 pt-4 border-t border-emerald-100 ml-13">
                      <Text className="text-gray-700 text-sm font-semibold mb-3">
                        Cards in this set:
                      </Text>
                      {flashcards.slice(0, 3).map((card) => (
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
                      {cardCount > 3 && (
                        <Text className="text-emerald-500 text-xs text-center mt-1 font-medium">
                          +{cardCount - 3} more card
                          {cardCount - 3 !== 1 ? "s" : ""}
                        </Text>
                      )}
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
                <Ionicons name="layers-outline" size={36} color="#10B981" />
              </View>
              <Text className="text-gray-800 text-lg font-bold text-center">
                No Flashcard Sets Yet
              </Text>
              <Text className="text-gray-500 text-center mt-2 text-sm">
                Create your first flashcard set to get started!
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
                <Ionicons name="add" size={20} color="white" />
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

            <View className="flex-row justify-between items-center mb-6">
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

            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
              Set Title <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="Set Title *"
              value={newSet.title}
              onChangeText={(text) =>
                setNewSet((prev) => ({ ...prev, title: text }))
              }
              className="border-2 border-emerald-200 rounded-2xl px-5 py-4 mb-4 text-gray-900 bg-emerald-50"
              placeholderTextColor="#9CA3AF"
            />

            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
              Subject <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="Subject * (e.g., Mathematics, Science)"
              value={newSet.subject}
              onChangeText={(text) =>
                setNewSet((prev) => ({ ...prev, subject: text }))
              }
              className="border-2 border-emerald-200 rounded-2xl px-5 py-4 mb-4 text-gray-900 bg-emerald-50"
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              placeholder="Description (optional)"
              value={newSet.description}
              onChangeText={(text) =>
                setNewSet((prev) => ({ ...prev, description: text }))
              }
              className="border-2 border-emerald-200 rounded-2xl px-5 py-4 mb-6 text-gray-900 bg-emerald-50"
              placeholderTextColor="#9CA3AF"
              multiline
            />

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
                className="flex-1 py-4 px-4 bg-emerald-500 rounded-2xl"
                onPress={handleAddSet}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
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

            <View className="flex-row justify-between items-center mb-6">
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

            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
              Set Title <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="Set Title *"
              value={editSet.title}
              onChangeText={(text) =>
                setEditSet((prev) => ({ ...prev, title: text }))
              }
              className="border-2 border-emerald-200 rounded-2xl px-5 py-4 mb-4 text-gray-900 bg-emerald-50"
              placeholderTextColor="#9CA3AF"
            />

            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
              Subject <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="Subject *"
              value={editSet.subject}
              onChangeText={(text) =>
                setEditSet((prev) => ({ ...prev, subject: text }))
              }
              className="border-2 border-emerald-200 rounded-2xl px-5 py-4 mb-4 text-gray-900 bg-emerald-50"
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              placeholder="Description"
              value={editSet.description}
              onChangeText={(text) =>
                setEditSet((prev) => ({ ...prev, description: text }))
              }
              className="border-2 border-emerald-200 rounded-2xl px-5 py-4 mb-6 text-gray-900 bg-emerald-50"
              placeholderTextColor="#9CA3AF"
              multiline
            />

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
                className="flex-1 py-4 px-4 bg-emerald-500 rounded-2xl"
                onPress={handleUpdateSet}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
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

            <View className="flex-row justify-between items-center mb-6">
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

            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
              Question <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="Question *"
              value={newFlashcard.question}
              onChangeText={(text) =>
                setNewFlashcard((prev) => ({ ...prev, question: text }))
              }
              className="border-2 border-emerald-200 rounded-2xl px-5 py-4 mb-4 text-gray-900 bg-emerald-50"
              placeholderTextColor="#9CA3AF"
              multiline
            />

            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
              Answer <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="Answer *"
              value={newFlashcard.answer}
              onChangeText={(text) =>
                setNewFlashcard((prev) => ({ ...prev, answer: text }))
              }
              className="border-2 border-emerald-200 rounded-2xl px-5 py-4 mb-6 text-gray-900 bg-emerald-50"
              placeholderTextColor="#9CA3AF"
              multiline
            />

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
                className="flex-1 py-4 px-4 bg-emerald-500 rounded-2xl"
                onPress={handleAddFlashcard}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Text className="text-white font-bold text-center">
                  Add Card
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

                <View className="flex-row justify-between gap-3 mb-4">
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
