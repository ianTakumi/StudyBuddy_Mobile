import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import client from "@/utils/axiosInstance";
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
        data
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
          "Failed to update password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const newPassword = watch("newPassword");

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 border-b border-blue-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-blue-100 rounded-lg"
        >
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-blue-800">
            Change Password
          </Text>
        </View>

        <View className="w-10" />
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
            <View className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-800">
                  Update Your Password
                </Text>
                {/* Show/Hide All Passwords Button */}
                <TouchableOpacity
                  onPress={() => setShowAllPasswords(!showAllPasswords)}
                  className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
                >
                  <Ionicons
                    name={showAllPasswords ? "eye-off" : "eye"}
                    size={18}
                    color="#2563eb"
                  />
                  <Text className="text-blue-600 text-sm font-medium ml-2">
                    {showAllPasswords ? "Hide" : "Show"} All
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Current Password */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Current Password *
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
                    <TextInput
                      className={`border rounded-lg px-4 py-3 ${
                        errors.currentPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your current password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showAllPasswords}
                    />
                  )}
                  name="currentPassword"
                />
                {errors.currentPassword && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.currentPassword.message}
                  </Text>
                )}
              </View>

              {/* New Password */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  New Password *
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
                    <TextInput
                      className={`border rounded-lg px-4 py-3 ${
                        errors.newPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your new password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showAllPasswords}
                    />
                  )}
                  name="newPassword"
                />
                {errors.newPassword && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.newPassword.message}
                  </Text>
                )}
                <Text className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </Text>
              </View>

              {/* Confirm Password */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-lg px-4 py-3 ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirm your new password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showAllPasswords}
                    />
                  )}
                  name="confirmPassword"
                />
                {errors.confirmPassword && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Password Requirements */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
              <Text className="text-sm font-semibold text-blue-800 mb-2">
                Password Requirements:
              </Text>
              <View className="space-y-1">
                <Text className="text-xs text-blue-700">
                  • At least 6 characters long
                </Text>
                <Text className="text-xs text-blue-700">
                  • Use a combination of letters and numbers
                </Text>
                <Text className="text-xs text-blue-700">
                  • Avoid using common words or personal information
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              className={`rounded-lg py-4 flex-row items-center justify-center shadow-lg ${
                isLoading ? "bg-blue-400" : "bg-blue-600 active:bg-blue-700"
              }`}
            >
              <Ionicons
                name={isLoading ? "lock-closed" : "lock-open"}
                size={20}
                color="white"
              />
              <Text className="text-white text-center font-semibold text-lg ml-2">
                {isLoading ? "Updating Password..." : "Change Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
