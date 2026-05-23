import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function ChangePassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      console.log("Change password data:", data);
      setIsLoading(true);

      const response = await client.put(
        `/auth/update-password/${user.id}`,
        data,
      );

      if (response.data.success) {
        Alert.alert("Success", "Your password has been changed successfully!", [
          {
            text: "OK",
            onPress: () => {
              reset();
              router.back();
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Password update error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          "Failed to update password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const newPassword = watch("newPassword");

  return (
    <SafeAreaView className="flex-1 bg-emerald-50">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-4 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Change Password</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-6">
            {/* Password Form Section */}
            <View
              className="bg-white rounded-3xl p-6 mb-6 relative overflow-hidden"
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

              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">
                    Update Your Password
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAllPasswords(!showAllPasswords)}
                  className="flex-row items-center bg-emerald-100 px-4 py-2 rounded-full"
                >
                  <Ionicons
                    name={showAllPasswords ? "eye-off" : "eye"}
                    size={16}
                    color="#10B981"
                  />
                  <Text className="text-emerald-600 text-xs font-semibold ml-1.5">
                    {showAllPasswords ? "Hide" : "Show"} All
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Current Password */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Current Password <Text className="text-red-500">*</Text>
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Current password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        className={`border-2 rounded-2xl px-5 py-4 text-gray-900 ${
                          errors.currentPassword
                            ? "border-red-300 bg-red-50"
                            : "border-emerald-200 bg-emerald-50"
                        }`}
                        placeholder="Enter your current password"
                        placeholderTextColor="#9CA3AF"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry={!showAllPasswords}
                      />
                    </View>
                  )}
                  name="currentPassword"
                />
                {errors.currentPassword && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-2">
                    {errors.currentPassword.message}
                  </Text>
                )}
              </View>

              {/* New Password */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  New Password <Text className="text-red-500">*</Text>
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        className={`border-2 rounded-2xl px-5 py-4 text-gray-900 ${
                          errors.newPassword
                            ? "border-red-300 bg-red-50"
                            : "border-emerald-200 bg-emerald-50"
                        }`}
                        placeholder="Enter your new password"
                        placeholderTextColor="#9CA3AF"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry={!showAllPasswords}
                      />
                    </View>
                  )}
                  name="newPassword"
                />
                {errors.newPassword && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-2">
                    {errors.newPassword.message}
                  </Text>
                )}
                <View className="flex-row items-center mt-2 ml-2">
                  <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                    <Ionicons
                      name="information-circle-outline"
                      size={10}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </Text>
                </View>
              </View>

              {/* Confirm Password */}
              <View className="mb-2">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Confirm New Password <Text className="text-red-500">*</Text>
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        className={`border-2 rounded-2xl px-5 py-4 text-gray-900 ${
                          errors.confirmPassword
                            ? "border-red-300 bg-red-50"
                            : value && value === newPassword
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-emerald-200 bg-emerald-50"
                        }`}
                        placeholder="Confirm your new password"
                        placeholderTextColor="#9CA3AF"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry={!showAllPasswords}
                      />
                      {value && value === newPassword && (
                        <View className="absolute right-4 top-4">
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#10B981"
                          />
                        </View>
                      )}
                    </View>
                  )}
                  name="confirmPassword"
                />
                {errors.confirmPassword && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-2">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Password Requirements */}
            <View
              className="bg-white rounded-3xl p-5 mb-6 relative overflow-hidden"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <View className="absolute -top-4 -right-4 w-14 h-14 bg-emerald-50 rounded-full" />

              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color="#10B981"
                  />
                </View>
                <Text className="text-sm font-bold text-emerald-800">
                  Password Requirements:
                </Text>
              </View>
              <View className="gap-2 ml-10">
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                  <Text className="text-xs text-emerald-700 font-medium">
                    At least 6 characters long
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                  <Text className="text-xs text-emerald-700 font-medium">
                    Use a combination of letters and numbers
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                  <Text className="text-xs text-emerald-700 font-medium">
                    Avoid using common words or personal information
                  </Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              className={`rounded-2xl py-4 flex-row items-center justify-center mb-6 ${
                isLoading ? "bg-emerald-400" : "bg-emerald-500"
              }`}
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
              activeOpacity={0.8}
            >
              <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
                <Ionicons
                  name={isLoading ? "lock-closed" : "lock-open"}
                  size={18}
                  color="white"
                />
              </View>
              <Text className="text-white text-center font-bold text-lg">
                {isLoading ? "Updating Password..." : "Change Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
