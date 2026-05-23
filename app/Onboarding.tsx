import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title: "Master your",
    highlight: "study schedule!",
    description:
      "Organize your study sessions, set goals, and track your progress all in one place. Say goodbye to last-minute cramming!",
    icon: "calendar-outline",
    color: "#059669", // emerald-600
    bgColor: "#ECFDF5", // emerald-50
  },
  {
    id: 2,
    title: "Track your",
    highlight: "learning progress",
    description:
      "Monitor your daily study habits, see your improvement over time, and stay motivated with visual progress charts and achievement badges.",
    icon: "trending-up-outline",
    color: "#10B981", // emerald-500
    bgColor: "#D1FAE5", // emerald-100
  },
  {
    id: 3,
    title: "Ace your exams",
    highlight: "with smart quizzes",
    description:
      "Create custom flashcards, take practice quizzes, and reinforce your knowledge with spaced repetition techniques for better retention.",
    icon: "bulb-outline",
    color: "#34D399", // emerald-400
    bgColor: "#A7F3D0", // emerald-200
  },
  {
    id: 4,
    title: "Join thousands of",
    highlight: "successful students",
    description:
      "Be part of a community of learners who are achieving their academic goals. Start your journey to academic excellence today!",
    icon: "people-outline",
    color: "#6EE7B7", // emerald-300
    bgColor: "#D1FAE5", // emerald-100
  },
];

const Onboarding: React.FC = () => {
  const [index, setIndex] = useState<number>(0);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const current = slides[index];

  const animateTransition = (nextIndex: number) => {
    // Fade out current content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIndex(nextIndex);
      slideAnim.setValue(30);

      // Fade in new content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const nextSlide = () => {
    if (index < slides.length - 1) {
      animateTransition(index + 1);
    } else {
      router.push("/LoginScreen");
    }
  };

  const prevSlide = () => {
    if (index > 0) {
      animateTransition(index - 1);
    }
  };

  const skipOnboarding = () => {
    router.push("/LoginScreen");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Skip Button */}
        {index < slides.length - 1 && (
          <TouchableOpacity
            onPress={skipOnboarding}
            className="absolute top-4 right-6 z-10 bg-white/90 px-4 py-2 rounded-full"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="text-emerald-600 font-semibold text-sm">Skip</Text>
          </TouchableOpacity>
        )}

        <Animated.View
          className="flex-1"
          style={{
            opacity: fadeAnim,
          }}
        >
          {/* Top Section - Dynamic Green Gradient */}
          <View
            className="w-full h-[55%] justify-center items-center px-8 relative overflow-hidden"
            style={{
              backgroundColor: current.color,
              borderBottomLeftRadius: 50,
              borderBottomRightRadius: 50,
              shadowColor: current.color,
              shadowOffset: { width: 0, height: 15 },
              shadowOpacity: 0.3,
              shadowRadius: 30,
              elevation: 12,
            }}
          >
            {/* Decorative Elements */}
            <View className="absolute top-10 right-8 w-20 h-20 bg-white/10 rounded-full" />
            <View className="absolute bottom-20 left-6 w-16 h-16 bg-white/10 rounded-full" />
            <View className="absolute top-32 left-12 w-10 h-10 bg-white/10 rounded-full" />

            {/* Decorative Dots Pattern */}
            <View className="absolute top-20 right-20 flex-row gap-1">
              {[...Array(3)].map((_, i) => (
                <View key={i} className="w-2 h-2 bg-white/30 rounded-full" />
              ))}
            </View>
            <View className="absolute bottom-32 left-20 flex-row gap-1">
              {[...Array(3)].map((_, i) => (
                <View key={i} className="w-2 h-2 bg-white/30 rounded-full" />
              ))}
            </View>

            {/* Icon Container with Animation */}
            <Animated.View
              className="w-64 h-64 mb-8 rounded-3xl justify-center items-center relative"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                transform: [{ scale: scaleAnim }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              {/* Inner circle decoration */}
              <View className="absolute w-48 h-48 bg-white/10 rounded-full" />
              <View className="absolute w-36 h-36 bg-white/10 rounded-full" />

              <Ionicons
                name={current.icon}
                size={100}
                color="white"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                }}
              />
            </Animated.View>

            {/* Title with Animation */}
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text className="text-3xl font-bold text-white text-center mb-1">
                {current.title}
              </Text>
              <Text className="text-3xl font-bold text-emerald-200 text-center">
                {current.highlight}
              </Text>
            </Animated.View>
          </View>

          {/* Bottom Section */}
          <View className="flex-1 justify-between px-8 pt-10 pb-8">
            {/* Description with Animation */}
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text className="text-gray-600 text-center text-lg leading-7 px-4">
                {current.description}
              </Text>
            </Animated.View>

            {/* Progress Indicators */}
            <View className="items-center">
              {/* Progress Dots - Pear Deck Style */}
              <View className="flex-row justify-center gap-3 mb-8">
                {slides.map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => animateTransition(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === index ? "w-10 h-3" : "w-3 h-3"
                    }`}
                    style={{
                      backgroundColor: i === index ? current.color : "#D1D5DB",
                      shadowColor: i === index ? current.color : "transparent",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: i === index ? 4 : 0,
                    }}
                  />
                ))}
              </View>

              {/* Step Counter */}
              <Text className="text-gray-400 text-sm mb-6">
                Step {index + 1} of {slides.length}
              </Text>
            </View>

            {/* Navigation Buttons */}
            <View className="flex-row justify-between items-center">
              {index > 0 ? (
                <TouchableOpacity
                  onPress={prevSlide}
                  className="flex-row items-center bg-gray-100 px-6 py-4 rounded-2xl"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="arrow-back" size={20} color="#4B5563" />
                  <Text className="text-gray-700 font-semibold text-base ml-2">
                    Back
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="w-[30%]" />
              )}

              <TouchableOpacity
                onPress={nextSlide}
                className="flex-row items-center px-8 py-4 rounded-2xl"
                style={{
                  backgroundColor: current.color,
                  shadowColor: current.color,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Text className="text-white font-bold text-base mr-2">
                  {index === slides.length - 1 ? "Get Started" : "Next"}
                </Text>
                <Ionicons
                  name={
                    index === slides.length - 1 ? "rocket" : "arrow-forward"
                  }
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
