import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

export default function Contact() {
  // Get user data from Redux store
  const user = useSelector((state) => state.auth.user);

  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      subject: "General Inquiry",
      message: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      console.log("Form submitted:", data);

      const response = await client.post("/contacts/submit", data);

      if (response.data.success) {
        Alert.alert("Message Sent!", response.data.message, [
          {
            text: "OK",
            onPress: () => {
              reset({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                subject: "General Inquiry",
                message: "",
              });
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Contact submission error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjects = [
    "General Inquiry",
    "Technical Support",
    "Account Issues",
    "Feature Request",
    "Partnership",
    "Feedback",
    "Other",
  ];

  const handleSubjectSelect = (subject) => {
    setValue("subject", subject);
    setShowSubjectDropdown(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Back Arrow */}
        <View className="bg-blue-600 px-6 pt-16 pb-12">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              className="w-10 h-10 bg-blue-700 rounded-full items-center justify-center mr-3"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white text-center">
                Contact Us
              </Text>
            </View>
            <View className="w-10" /> {/* Spacer for balance */}
          </View>
          <Text className="text-blue-100 text-center text-base mt-2">
            Get in touch with the StudyBuddy team
          </Text>
        </View>

        {/* Contact Form */}
        <View className="px-6 py-8 -mt-6">
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Send us a message
            </Text>
            <Text className="text-gray-500 mb-6">
              Your information is pre-filled. Just select a subject and write
              your message.
            </Text>

            {/* First Name */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                First Name
              </Text>
              <Controller
                control={control}
                render={({ field: { value } }) => (
                  <TextInput
                    className="border-2 rounded-xl px-4 py-4 bg-gray-100 border-gray-200 text-gray-600"
                    value={value}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                )}
                name="first_name"
              />
            </View>

            {/* Last Name */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Last Name
              </Text>
              <Controller
                control={control}
                render={({ field: { value } }) => (
                  <TextInput
                    className="border-2 rounded-xl px-4 py-4 bg-gray-100 border-gray-200 text-gray-600"
                    value={value}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                )}
                name="last_name"
              />
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Email Address
              </Text>
              <Controller
                control={control}
                render={({ field: { value } }) => (
                  <TextInput
                    className="border-2 rounded-xl px-4 py-4 bg-gray-100 border-gray-200 text-gray-600"
                    value={value}
                    editable={false}
                    selectTextOnFocus={false}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
                name="email"
              />
            </View>

            {/* Phone */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Phone Number
              </Text>
              <Controller
                control={control}
                render={({ field: { value } }) => (
                  <TextInput
                    className="border-2 rounded-xl px-4 py-4 bg-gray-100 border-gray-200 text-gray-600"
                    value={value}
                    editable={false}
                    selectTextOnFocus={false}
                    keyboardType="phone-pad"
                  />
                )}
                name="phone"
              />
            </View>

            {/* Subject Dropdown */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Subject *
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "Please select a subject",
                }}
                render={({ field: { value } }) => (
                  <View>
                    <TouchableOpacity
                      className={`border-2 rounded-xl px-4 py-4 bg-white flex-row items-center justify-between ${
                        errors.subject ? "border-red-400" : "border-gray-200"
                      }`}
                      onPress={() =>
                        setShowSubjectDropdown(!showSubjectDropdown)
                      }
                      disabled={isSubmitting}
                    >
                      <Text
                        className={`${value ? "text-gray-900" : "text-gray-500"} ${
                          isSubmitting ? "opacity-50" : ""
                        }`}
                      >
                        {value || "Select a subject"}
                      </Text>
                      <Ionicons
                        name={
                          showSubjectDropdown ? "chevron-up" : "chevron-down"
                        }
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>

                    {errors.subject && (
                      <Text className="text-red-500 text-sm mt-2 ml-1">
                        {errors.subject.message}
                      </Text>
                    )}
                  </View>
                )}
                name="subject"
              />
            </View>

            {/* Message */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">
                Message *
              </Text>
              <Controller
                control={control}
                rules={{
                  required: "Message is required",
                  minLength: {
                    value: 10,
                    message: "Message must be at least 10 characters",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border-2 rounded-xl px-4 py-4 bg-white min-h-[140px] text-left align-top ${
                      errors.message ? "border-red-400" : "border-gray-200"
                    } ${isSubmitting ? "opacity-50" : ""}`}
                    placeholder="Type your message here..."
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isSubmitting}
                  />
                )}
                name="message"
              />
              {errors.message && (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.message.message}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={`rounded-xl py-5 shadow-lg flex-row items-center justify-center ${
                isSubmitting ? "bg-blue-400" : "bg-blue-600 active:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white text-center font-bold text-lg ml-2">
                    Sending...
                  </Text>
                </>
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Send Message
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View className="bg-gray-50 rounded-3xl p-6 mt-8 border border-gray-200">
            <Text className="text-xl font-bold text-gray-900 mb-6">
              Other Ways to Reach Us
            </Text>

            <View className="space-y-5">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <MaterialIcons name="email" size={24} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-gray-500 text-sm">Email</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    support@studybuddy.com
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <FontAwesome name="phone" size={24} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-gray-500 text-sm">Phone</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    +63 961 213 5234
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <Ionicons name="location" size={24} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-gray-500 text-sm">Address</Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    Philippines
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Subject Dropdown Modal */}
      <Modal
        visible={showSubjectDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubjectDropdown(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowSubjectDropdown(false)}
        >
          <View className="bg-white rounded-2xl w-11/12 max-h-80">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-800 text-center">
                Select Subject
              </Text>
            </View>

            <ScrollView className="max-h-64">
              {subjects.map((subject, index) => (
                <TouchableOpacity
                  key={subject}
                  className={`px-6 py-4 border-b border-gray-100 ${
                    index === subjects.length - 1 ? "border-b-0" : ""
                  }`}
                  onPress={() => handleSubjectSelect(subject)}
                >
                  <Text className="text-gray-800 text-base">{subject}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
