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
        <Text className="text-xl font-bold text-gray-900">About PTCIANS</Text>
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
            PTCIANS was created to revolutionize the way students learn by
            providing an interactive and personalized mobile learning companion.
            We believe every student deserves access to effective study tools
            that make learning engaging and productive.
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
              To be the leading digital learning companion for PTC students,
              empowering every learner to achieve academic excellence through
              personalized, accessible, and innovative study tools.
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

        {/* Contact Section */}
        <View className="bg-blue-50 py-8 px-6">
          <Text className="text-3xl font-bold text-blue-600 text-center mb-6">
            Get in Touch
          </Text>
          <View className="bg-white rounded-2xl p-6 border border-blue-200">
            <Text className="text-lg font-semibold text-blue-600 text-center mb-4">
              We&apos;re here to help you succeed!
            </Text>
            <Text className="text-gray-700 text-center leading-6 mb-4">
              Have questions about PTCIANS or suggestions for improvement?
              We&apos;d love to hear from students, teachers, and educators.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/students/Contact")}
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
