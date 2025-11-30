import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutUs() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with Back Button */}
      <View className="flex-row items-center px-4 pt-3 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#4A90E2" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
          About StudyBuddy
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Our Story Section */}
        <View className="px-6 py-8 bg-white">
          <Text className="text-3xl font-bold text-blue-600 text-center mb-6">
            Our Story
          </Text>
          <View className="items-center mb-6">
            <View className="w-full h-64 bg-blue-50 rounded-2xl items-center justify-center">
              <Ionicons name="school" size={80} color="#4A90E2" />
            </View>
          </View>
          <Text className="text-gray-700 text-base leading-7 mb-4">
            StudyBuddy was created to revolutionize the way students learn by
            providing an interactive, gamified, and personalized mobile learning
            companion. We believe every student deserves access to effective
            study tools that make learning engaging and productive.
          </Text>
          <Text className="text-gray-700 text-base leading-7">
            Our platform combines smart scheduling, progress tracking, and
            interactive quizzes to help students stay motivated, organized, and
            achieve their academic goals.
          </Text>
        </View>

        {/* Mission Vision Values Section */}
        <View className="bg-blue-50 py-8 px-6">
          <Text className="text-3xl font-bold text-blue-600 text-center mb-8">
            Mission, Vision & Values
          </Text>

          {/* Mission Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="rocket-outline" size={32} color="#4A90E2" />
              </View>
            </View>
            <Text className="text-xl font-bold text-blue-600 text-center mb-3">
              Mission
            </Text>
            <Text className="text-gray-700 text-center leading-6">
              To empower students with innovative digital tools that make
              learning interactive, personalized, and enjoyable, helping them
              achieve academic success.
            </Text>
          </View>

          {/* Vision Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="eye-outline" size={32} color="#4A90E2" />
              </View>
            </View>
            <Text className="text-xl font-bold text-blue-600 text-center mb-3">
              Vision
            </Text>
            <Text className="text-gray-700 text-center leading-6">
              A world where every student has access to personalized learning
              tools that adapt to their unique needs and learning styles, making
              education more accessible and effective.
            </Text>
          </View>

          {/* Values Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="heart-outline" size={32} color="#4A90E2" />
              </View>
            </View>
            <Text className="text-xl font-bold text-blue-600 text-center mb-3">
              Values
            </Text>
            <Text className="text-gray-700 text-center leading-6">
              Innovation, Accessibility, Personalization, Student Success,
              Continuous Improvement, and Educational Excellence.
            </Text>
          </View>
        </View>

        {/* Our History Section */}
        <View className="bg-blue-50 py-8 px-6">
          <Text className="text-3xl font-bold text-blue-600 text-center mb-8">
            Our Journey
          </Text>

          {/* Timeline Item 1 */}
          <View className="flex-row mb-8">
            <View className="w-1/12 items-center">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-lg">1</Text>
              </View>
              <View className="w-1 bg-blue-300 flex-1 mt-2" />
            </View>
            <View className="w-11/12 pl-4">
              <Text className="text-lg font-bold text-blue-600 mb-2">
                The Beginning (2023)
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                StudyBuddy was born from the observation that students needed
                better tools to manage their study time and track their learning
                progress effectively.
              </Text>
              <View className="w-full h-48 bg-blue-100 rounded-2xl items-center justify-center">
                <Ionicons name="bulb-outline" size={48} color="#4A90E2" />
              </View>
            </View>
          </View>

          {/* Timeline Item 2 */}
          <View className="flex-row mb-8">
            <View className="w-1/12 items-center">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-lg">2</Text>
              </View>
              <View className="w-1 bg-blue-300 flex-1 mt-2" />
            </View>
            <View className="w-11/12 pl-4">
              <Text className="text-lg font-bold text-blue-600 mb-2">
                First Release (2024)
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                Launched the first version with core features: study scheduling,
                progress tracking, and interactive quizzes, receiving positive
                feedback from student users.
              </Text>
              <View className="w-full h-48 bg-blue-100 rounded-2xl items-center justify-center">
                <Ionicons
                  name="phone-portrait-outline"
                  size={48}
                  color="#4A90E2"
                />
              </View>
            </View>
          </View>

          {/* Timeline Item 3 */}
          <View className="flex-row">
            <View className="w-1/12 items-center">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-lg">3</Text>
              </View>
            </View>
            <View className="w-11/12 pl-4">
              <Text className="text-lg font-bold text-blue-600 mb-2">
                Growing Together (2025)
              </Text>
              <Text className="text-gray-700 leading-6 mb-4">
                Expanding features based on user feedback, adding AI-powered
                recommendations, collaborative study groups, and advanced
                analytics to better serve students worldwide.
              </Text>
              <View className="w-full h-48 bg-blue-100 rounded-2xl items-center justify-center">
                <Ionicons
                  name="trending-up-outline"
                  size={48}
                  color="#4A90E2"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View className="bg-white py-8 px-6">
          <Text className="text-3xl font-bold text-blue-600 text-center mb-6">
            Why Choose StudyBuddy?
          </Text>

          <View className="space-y-4">
            <View className="flex-row items-center bg-blue-50 rounded-xl p-4">
              <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mr-4">
                <Ionicons name="calendar-outline" size={24} color="#4A90E2" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  Smart Study Scheduling
                </Text>
                <Text className="text-gray-600 text-sm">
                  Plan and organize your study sessions effectively
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-blue-50 rounded-xl p-4">
              <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mr-4">
                <Ionicons name="bar-chart-outline" size={24} color="#4A90E2" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  Progress Tracking
                </Text>
                <Text className="text-gray-600 text-sm">
                  Monitor your learning journey with detailed analytics
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-blue-50 rounded-xl p-4">
              <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mr-4">
                <Ionicons
                  name="game-controller-outline"
                  size={24}
                  color="#4A90E2"
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  Interactive Quizzes
                </Text>
                <Text className="text-gray-600 text-sm">
                  Learn through gamified quizzes and flashcards
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-blue-50 rounded-xl p-4">
              <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mr-4">
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#4A90E2"
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  Study Resources
                </Text>
                <Text className="text-gray-600 text-sm">
                  Access organized notes, videos, and learning materials
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View className="bg-blue-50 py-8 px-6">
          <Text className="text-3xl font-bold text-blue-600 text-center mb-6">
            Get in Touch
          </Text>
          <View className="bg-white rounded-2xl p-6 border border-blue-200">
            <Text className="text-lg font-semibold text-blue-600 text-center mb-4">
              We're here to help you succeed!
            </Text>
            <Text className="text-gray-700 text-center leading-6 mb-4">
              Have questions about StudyBuddy or suggestions for improvement?
              We'd love to hear from students, teachers, and educators.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/teachers/Contact")}
              className="bg-blue-600 rounded-xl py-4 px-6 flex-row items-center justify-center mt-4"
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white text-lg font-semibold">
                Contact Us
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
