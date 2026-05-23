import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [showStudyModal, setShowStudyModal] = useState(false);

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
          <Text className="text-3xl font-bold text-white mb-1">{title}</Text>
          <Text className="text-emerald-100 text-base">{className}</Text>
        </View>
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
          />
        }
      >
        <View className="p-6">
          {/* Flashcard Set Info */}
          {flashcardSet && (
            <View
              className="bg-white rounded-3xl p-5 mb-6 relative overflow-hidden"
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
                  <Ionicons name="book-outline" size={20} color="#10B981" />
                </View>
                <Text className="text-emerald-700 font-bold text-base">
                  Flashcard Set
                </Text>
              </View>

              {flashcardSet.description && (
                <Text className="text-gray-600 text-sm mt-2 leading-5 ml-13">
                  {flashcardSet.description}
                </Text>
              )}

              <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-emerald-100 ml-13">
                <View className="flex-row items-center">
                  <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                    <Ionicons
                      name="calendar-outline"
                      size={11}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-gray-500 text-xs">
                    Created:{" "}
                    {new Date(flashcardSet.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-5 h-5 bg-purple-100 rounded-full items-center justify-center mr-1.5">
                    <Ionicons name="flash-outline" size={11} color="#8B5CF6" />
                  </View>
                  <Text className="text-gray-500 text-xs font-medium">
                    {flashcards.length} card{flashcards.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Flashcard Study */}
          {flashcards.length > 0 ? (
            <View
              className="bg-white rounded-3xl p-6 relative overflow-hidden"
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

              <View className="bg-emerald-100 rounded-full px-4 py-1.5 mb-4 self-center">
                <Text className="text-emerald-600 text-sm font-semibold">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </Text>
              </View>

              <View className="bg-emerald-50 rounded-2xl p-8 mb-6 min-h-[250px] justify-center">
                <Text className="text-lg font-bold text-emerald-600 text-center mb-3">
                  {showAnswer ? "Answer:" : "Question:"}
                </Text>
                <Text className="text-xl text-gray-800 text-center leading-7 font-medium">
                  {showAnswer ? currentCard?.answer : currentCard?.question}
                </Text>
              </View>

              <TouchableOpacity
                className="bg-emerald-500 rounded-2xl py-4 mb-4"
                onPress={() => setShowAnswer(!showAnswer)}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <Text className="text-white font-bold text-center text-base">
                  {showAnswer ? "Show Question" : "Show Answer"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 py-4 px-4 rounded-2xl flex-row items-center justify-center ${
                    currentCardIndex === 0 ? "bg-gray-300" : "bg-gray-500"
                  }`}
                  onPress={previousCard}
                  disabled={currentCardIndex === 0}
                  style={
                    currentCardIndex !== 0
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

                <TouchableOpacity
                  className={`flex-1 py-4 px-4 rounded-2xl flex-row items-center justify-center ${
                    currentCardIndex === flashcards.length - 1
                      ? "bg-emerald-500"
                      : "bg-emerald-600"
                  }`}
                  onPress={nextCard}
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 5,
                  }}
                >
                  <Text className="text-white font-bold mr-2">
                    {currentCardIndex === flashcards.length - 1
                      ? "Finish"
                      : "Next"}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
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
                className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-4"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Ionicons name="flash-outline" size={40} color="#10B981" />
              </View>
              <Text className="text-gray-800 text-lg font-bold text-center">
                No Flashcards Yet
              </Text>
              <Text className="text-gray-500 text-center mt-2 text-sm">
                This set doesn't have any flashcards yet.
              </Text>
            </View>
          )}

          {/* Progress Indicator */}
          {flashcards.length > 0 && (
            <View
              className="mt-6 bg-white rounded-3xl p-5"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mr-2">
                    <Ionicons
                      name="trending-up-outline"
                      size={12}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-gray-700 font-semibold text-sm">
                    Progress
                  </Text>
                </View>
                <Text className="text-emerald-600 text-sm font-bold">
                  {Math.round(
                    ((currentCardIndex + 1) / flashcards.length) * 100,
                  )}
                  %
                </Text>
              </View>
              <View className="bg-emerald-100 rounded-full h-3">
                <View
                  className="bg-emerald-500 rounded-full h-3"
                  style={{
                    width: `${((currentCardIndex + 1) / flashcards.length) * 100}%`,
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
