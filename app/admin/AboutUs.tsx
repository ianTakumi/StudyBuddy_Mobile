import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutUs() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-emerald-50">
      {/* Header */}
      <View
        className="bg-emerald-500 px-4 pt-4 pb-6"
        style={{
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          shadowColor: "#059669",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {/* Decorative circles */}
        <View className="absolute top-4 right-8 w-16 h-16 bg-white/10 rounded-full" />
        <View className="absolute bottom-2 left-8 w-10 h-10 bg-white/10 rounded-full" />

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white/20 p-2 rounded-xl mr-3"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">About PTCIANS</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-6">
          {/* Our Story Section */}
          <View
            className="bg-white rounded-3xl p-6 mb-6"
            style={{
              shadowColor: "#059669",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-emerald-100 rounded-xl p-2 mr-3">
                <Ionicons name="book-outline" size={24} color="#059669" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">
                Our Story
              </Text>
            </View>

            <View className="items-center mb-6">
              <View className="w-full h-48 bg-emerald-50 rounded-2xl items-center justify-center relative overflow-hidden">
                {/* Decorative circles */}
                <View className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-100 rounded-full" />
                <View className="absolute -bottom-6 -left-6 w-20 h-20 bg-emerald-100 rounded-full" />
                <Ionicons name="school" size={64} color="#059669" />
              </View>
            </View>

            <Text className="text-gray-700 text-base leading-7 mb-4">
              PTCIANS was created to revolutionize the way students learn by
              providing an interactive and personalized mobile learning
              companion. We believe every student deserves access to effective
              study tools that make learning engaging and productive.
            </Text>
            <Text className="text-gray-700 text-base leading-7">
              Our platform combines smart scheduling, progress tracking, and
              interactive quizzes to help students stay motivated, organized,
              and achieve their academic goals.
            </Text>
          </View>

          {/* Mission, Vision & Values Section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4 px-1">
              <View className="bg-emerald-100 rounded-xl p-2 mr-3">
                <Ionicons name="compass-outline" size={24} color="#059669" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">
                Mission, Vision & Values
              </Text>
            </View>

            {/* Mission Card */}
            <View
              className="bg-white rounded-3xl p-6 mb-4"
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
                borderLeftWidth: 4,
                borderLeftColor: "#059669",
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-emerald-100 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="rocket-outline" size={28} color="#059669" />
                </View>
                <View>
                  <Text className="text-xl font-bold text-gray-800">
                    Mission
                  </Text>
                  <Text className="text-emerald-600 text-sm font-medium">
                    What drives us
                  </Text>
                </View>
              </View>
              <Text className="text-gray-700 leading-6">
                To empower students with innovative digital tools that make
                learning interactive, personalized, and enjoyable, helping them
                achieve academic success.
              </Text>
            </View>

            {/* Vision Card */}
            <View
              className="bg-white rounded-3xl p-6 mb-4"
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
                borderLeftWidth: 4,
                borderLeftColor: "#10B981",
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-green-100 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="eye-outline" size={28} color="#10B981" />
                </View>
                <View>
                  <Text className="text-xl font-bold text-gray-800">
                    Vision
                  </Text>
                  <Text className="text-green-600 text-sm font-medium">
                    Where we're headed
                  </Text>
                </View>
              </View>
              <Text className="text-gray-700 leading-6">
                To be the leading digital learning companion for PTC students,
                empowering every learner to achieve academic excellence through
                personalized, accessible, and innovative study tools.
              </Text>
            </View>

            {/* Values Card */}
            <View
              className="bg-white rounded-3xl p-6"
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
                borderLeftWidth: 4,
                borderLeftColor: "#34D399",
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-teal-100 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="heart-outline" size={28} color="#34D399" />
                </View>
                <View>
                  <Text className="text-xl font-bold text-gray-800">
                    Values
                  </Text>
                  <Text className="text-teal-600 text-sm font-medium">
                    What we stand for
                  </Text>
                </View>
              </View>
              <Text className="text-gray-700 leading-6">
                Innovation, Accessibility, Personalization, Student Success,
                Continuous Improvement, and Educational Excellence.
              </Text>
            </View>
          </View>

          {/* Get in Touch Section */}
          <View
            className="bg-white rounded-3xl p-6 mb-8 relative overflow-hidden"
            style={{
              shadowColor: "#059669",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {/* Decorative circles */}
            <View className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-50 rounded-full" />
            <View className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-50 rounded-full" />

            <View className="flex-row items-center mb-4">
              <View className="bg-emerald-100 rounded-xl p-2 mr-3">
                <Ionicons
                  name="chatbubbles-outline"
                  size={24}
                  color="#059669"
                />
              </View>
              <Text className="text-2xl font-bold text-gray-800">
                Get in Touch
              </Text>
            </View>

            <Text className="text-lg font-semibold text-emerald-600 text-center mb-3">
              We're here to help you succeed!
            </Text>
            <Text className="text-gray-700 text-center leading-6 mb-6">
              Have questions about PTCIANS or suggestions for improvement? We'd
              love to hear from students, teachers, and educators.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/students/Contact")}
              className="bg-emerald-500 rounded-2xl py-4 px-6 flex-row items-center justify-center"
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Ionicons name="mail-outline" size={20} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Contact Us
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
