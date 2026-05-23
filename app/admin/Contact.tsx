import client from "@/utils/axiosInstance";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

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
          "Failed to send message. Please try again.",
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
      className="flex-1 bg-emerald-50"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          className="bg-emerald-500 px-4 pt-16 pb-8"
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
          <View className="absolute top-8 right-8 w-20 h-20 bg-white/10 rounded-full" />
          <View className="absolute top-16 left-4 w-12 h-12 bg-white/10 rounded-full" />
          <View className="absolute bottom-4 right-16 w-8 h-8 bg-white/10 rounded-full" />

          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              className="bg-white/20 p-2 rounded-xl mr-3"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white text-center">
                Contact Us
              </Text>
            </View>
            <View className="w-10" />
          </View>
          <Text className="text-emerald-100 text-center text-base">
            Get in touch with the PTCIANS team
          </Text>
        </View>

        {/* Contact Form */}
        <View className="px-4 pt-6 pb-4">
          <View
            className="bg-white rounded-3xl p-6"
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
                <Ionicons name="chatbubble-outline" size={22} color="#059669" />
              </View>
              <View>
                <Text className="text-xl font-bold text-gray-800">
                  Send us a message
                </Text>
                <Text className="text-gray-500 text-sm">
                  Fill in the details below
                </Text>
              </View>
            </View>

            {/* First Name & Last Name Row */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-semibold mb-2 ml-1">
                  First Name
                </Text>
                <Controller
                  control={control}
                  render={({ field: { value } }) => (
                    <View className="border-2 rounded-2xl px-4 py-3.5 bg-gray-50 border-gray-200 flex-row items-center">
                      <Ionicons
                        name="person-outline"
                        size={18}
                        color="#9CA3AF"
                      />
                      <TextInput
                        className="flex-1 ml-2 text-gray-600"
                        value={value}
                        editable={false}
                        selectTextOnFocus={false}
                      />
                    </View>
                  )}
                  name="first_name"
                />
              </View>

              <View className="flex-1">
                <Text className="text-gray-700 font-semibold mb-2 ml-1">
                  Last Name
                </Text>
                <Controller
                  control={control}
                  render={({ field: { value } }) => (
                    <View className="border-2 rounded-2xl px-4 py-3.5 bg-gray-50 border-gray-200 flex-row items-center">
                      <Ionicons
                        name="person-outline"
                        size={18}
                        color="#9CA3AF"
                      />
                      <TextInput
                        className="flex-1 ml-2 text-gray-600"
                        value={value}
                        editable={false}
                        selectTextOnFocus={false}
                      />
                    </View>
                  )}
                  name="last_name"
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">
                Email Address
              </Text>
              <Controller
                control={control}
                render={({ field: { value } }) => (
                  <View className="border-2 rounded-2xl px-4 py-3.5 bg-gray-50 border-gray-200 flex-row items-center">
                    <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-2 text-gray-600"
                      value={value}
                      editable={false}
                      selectTextOnFocus={false}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                )}
                name="email"
              />
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">
                Phone Number
              </Text>
              <Controller
                control={control}
                render={({ field: { value } }) => (
                  <View className="border-2 rounded-2xl px-4 py-3.5 bg-gray-50 border-gray-200 flex-row items-center">
                    <Ionicons name="call-outline" size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-2 text-gray-600"
                      value={value}
                      editable={false}
                      selectTextOnFocus={false}
                      keyboardType="phone-pad"
                    />
                  </View>
                )}
                name="phone"
              />
            </View>

            {/* Subject Dropdown */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">
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
                      className={`border-2 rounded-2xl px-4 py-3.5 bg-white flex-row items-center justify-between ${
                        errors.subject
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                      onPress={() =>
                        setShowSubjectDropdown(!showSubjectDropdown)
                      }
                      disabled={isSubmitting}
                    >
                      <View className="flex-row items-center flex-1">
                        <Ionicons
                          name="pricetag-outline"
                          size={18}
                          color={errors.subject ? "#EF4444" : "#059669"}
                        />
                        <Text
                          className={`ml-2 ${value ? "text-gray-900" : "text-gray-400"} ${
                            isSubmitting ? "opacity-50" : ""
                          }`}
                        >
                          {value || "Select a subject"}
                        </Text>
                      </View>
                      <Ionicons
                        name={
                          showSubjectDropdown ? "chevron-up" : "chevron-down"
                        }
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>

                    {errors.subject && (
                      <Text className="text-red-500 text-sm mt-1.5 ml-2">
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
              <Text className="text-gray-700 font-semibold mb-2 ml-1">
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
                  <View
                    className={`border-2 rounded-2xl px-4 py-3.5 bg-white min-h-[140px] ${
                      errors.message
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200"
                    }`}
                  >
                    <TextInput
                      className={`text-left text-base ${isSubmitting ? "opacity-50" : "text-gray-900"}`}
                      placeholder="Type your message here..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={!isSubmitting}
                      style={{ minHeight: 120 }}
                    />
                  </View>
                )}
                name="message"
              />
              {errors.message && (
                <Text className="text-red-500 text-sm mt-1.5 ml-2">
                  {errors.message.message}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={`rounded-2xl py-4 flex-row items-center justify-center ${
                isSubmitting ? "bg-gray-400" : "bg-emerald-500"
              }`}
              style={
                !isSubmitting && {
                  shadowColor: "#059669",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }
              }
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white text-center font-bold text-lg ml-2">
                    Sending...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="white" />
                  <Text className="text-white text-center font-bold text-lg ml-2">
                    Send Message
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View
            className="bg-white rounded-3xl p-6 mt-6 mb-8"
            style={{
              shadowColor: "#059669",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View className="bg-emerald-100 rounded-xl p-2 mr-3">
                <Ionicons name="call-outline" size={22} color="#059669" />
              </View>
              <Text className="text-xl font-bold text-gray-800">
                Other Ways to Reach Us
              </Text>
            </View>

            <View className="gap-4">
              <View className="flex-row items-center bg-emerald-50 rounded-2xl p-4">
                <View className="w-12 h-12 bg-emerald-100 rounded-xl items-center justify-center mr-4">
                  <MaterialIcons name="email" size={24} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm">Email</Text>
                  <Text className="text-gray-900 font-semibold">
                    support@PTCIANS.com
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center bg-green-50 rounded-2xl p-4">
                <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-4">
                  <FontAwesome name="phone" size={24} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm">Phone</Text>
                  <Text className="text-gray-900 font-semibold">
                    +63 961 213 5234
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center bg-teal-50 rounded-2xl p-4">
                <View className="w-12 h-12 bg-teal-100 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="location" size={24} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm">Address</Text>
                  <Text className="text-gray-900 font-semibold">
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
          <View className="bg-white rounded-3xl w-11/12 max-h-80 overflow-hidden">
            <View className="p-5 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-800 text-center">
                Select Subject
              </Text>
            </View>

            <ScrollView className="max-h-64">
              {subjects.map((subject, index) => (
                <TouchableOpacity
                  key={subject}
                  className={`px-6 py-4 flex-row items-center ${
                    index === subjects.length - 1
                      ? ""
                      : "border-b border-gray-50"
                  }`}
                  onPress={() => handleSubjectSelect(subject)}
                >
                  <View className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                  <Text className="text-gray-800 text-base font-medium">
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
