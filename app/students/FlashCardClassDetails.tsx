import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
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
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-white ml-2 font-medium">Back</Text>
        </TouchableOpacity>

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

              <View className="flex-row justify-between gap-3">
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
                This set doesn't have any flashcards yet.
              </Text>
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
    </View>
  );
}
