import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const slides = [
  {
    id: 1,
    title: "Master your",
    highlight: "study schedule!",
    description:
      "Organize your study sessions, set goals, and track your progress all in one place. Say goodbye to last-minute cramming and hello to effective learning.",
    icon: "calendar" as const,
  },
  {
    id: 2,
    title: "Track your",
    highlight: "learning progress",
    description:
      "Monitor your daily study habits, see your improvement over time, and stay motivated with visual progress charts and achievement badges.",
    icon: "stats-chart" as const,
  },
  {
    id: 3,
    title: "Ace your exams",
    highlight: "with smart quizzes",
    description:
      "Create custom flashcards, take practice quizzes, and reinforce your knowledge with spaced repetition techniques for better retention.",
    icon: "school" as const,
  },
  {
    id: 4,
    title: "Join thousands of",
    highlight: "successful students",
    description:
      "Be part of a community of learners who are achieving their academic goals. Start your journey to academic excellence today!",
    icon: "people" as const,
  },
];

const Onboarding: React.FC = () => {
  const [index, setIndex] = useState<number>(0);
  const router = useRouter();
  const current = slides[index];

  const nextSlide = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      router.push("/LoginScreen");
    }
  };

  const prevSlide = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Section - Blue Theme for StudyBuddy */}
      <View className="bg-blue-600 w-full h-[65%] rounded-b-3xl justify-center items-center px-6 pt-10">
        {/* Icon Placeholder */}
        <View className="w-72 h-72 mb-6 bg-blue-500 rounded-2xl justify-center items-center">
          <Ionicons name={current.icon} size={120} color="white" />
        </View>

        <Text className="text-3xl font-bold text-white text-center">
          {current.title}{" "}
          <Text className="text-blue-200">{current.highlight}</Text>
        </Text>
      </View>

      {/* Bottom Section */}
      <View className="flex-1 justify-between px-6 pb-10 pt-8">
        <Text className="text-gray-600 text-center text-base leading-6">
          {current.description}
        </Text>

        {/* Progress Dots */}
        <View className="flex-row justify-center mt-6 space-x-2">
          {slides.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === index ? "bg-blue-600 w-6" : "bg-gray-300 w-2"
              }`}
            />
          ))}
        </View>

        {/* Buttons */}
        <View className="flex-row justify-between mt-8">
          {index > 0 ? (
            <TouchableOpacity
              onPress={prevSlide}
              className="bg-gray-300 px-8 py-3 rounded-xl shadow-md"
            >
              <Text className="text-gray-700 font-semibold text-base">
                Back
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="w-[40%]" /> // placeholder for symmetry
          )}

          <TouchableOpacity
            onPress={nextSlide}
            className="bg-blue-600 px-8 py-3 rounded-xl shadow-md"
          >
            <Text className="text-white font-semibold text-base">
              {index === slides.length - 1 ? "Start Learning" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Onboarding;
