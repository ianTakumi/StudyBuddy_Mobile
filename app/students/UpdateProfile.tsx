import { updateProfile } from "@/redux/slices/authSlice";
import client from "@/utils/axiosInstance";
import {
  formatPhoneNumber,
  validateEmail,
  validatePhone,
} from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function UpdateProfile() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (data) => {
    console.log("Updated profile data:", data);

    // Validate required personal fields
    if (!data.first_name || !data.last_name || !data.email || !data.phone) {
      alert("Please fill in all required personal information fields.");
      return;
    }

    // Validate phone number format
    if (!validatePhone(data.phone)) {
      alert(
        "Please enter a valid 11-digit phone number starting with 09 (e.g., 09613886156).",
      );
      return;
    }

    // Validate email format
    if (!validateEmail(data.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      await client.put(`/users/profile/${user.id}`, data).then((res) => {
        if (res.status === 200) {
          alert("Profile updated successfully!");
          dispatch(updateProfile(res.data.user));
          router.back();
        }
      });
    } catch (error) {
      alert("Failed to update profile. Please try again.");
      console.error("Update profile error:", error);
    }
  };

  // Check if phone number is valid
  const isPhoneValid = validatePhone(watch("phone"));

  return (
    <SafeAreaView className="flex-1 bg-emerald-50">
      {/* Header - Pear Deck Style */}
      <View
        className="w-full pt-4 pb-6 px-6 bg-emerald-500"
        style={{
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Decorative Circles */}
        <View className="absolute top-2 right-8 w-12 h-12 bg-emerald-400/30 rounded-full" />
        <View className="absolute bottom-2 left-10 w-16 h-16 bg-emerald-400/20 rounded-full" />

        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-white">Update Profile</Text>

          <View className="w-10" />
        </View>
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
            {/* Profile Avatar Section */}
            <View className="items-center mb-6">
              <View className="relative">
                <View
                  className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center"
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 5,
                  }}
                >
                  <Text className="text-3xl font-bold text-emerald-600">
                    {watch("first_name")?.[0] || "?"}
                    {watch("last_name")?.[0] || "?"}
                  </Text>
                </View>
                <View className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
                <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
              </View>
            </View>

            {/* Personal Information Section */}
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
              {/* Decorative circles */}
              <View className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-50 rounded-full" />
              <View className="absolute -bottom-4 -left-4 w-16 h-16 bg-emerald-50 rounded-full opacity-70" />

              <View className="flex-row items-center mb-6">
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person-outline" size={20} color="#10B981" />
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  Personal Information
                </Text>
              </View>

              {/* First Name */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  First Name <Text className="text-red-500">*</Text>
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "First name is required",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border-2 rounded-2xl px-5 py-4 text-gray-900 ${
                        errors.first_name
                          ? "border-red-300 bg-red-50"
                          : "border-emerald-200 bg-emerald-50"
                      }`}
                      placeholder="Enter first name"
                      placeholderTextColor="#9CA3AF"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="first_name"
                />
                {errors.first_name && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-2">
                    {errors.first_name.message}
                  </Text>
                )}
              </View>

              {/* Last Name */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Last Name <Text className="text-red-500">*</Text>
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Last name is required",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border-2 rounded-2xl px-5 py-4 text-gray-900 ${
                        errors.last_name
                          ? "border-red-300 bg-red-50"
                          : "border-emerald-200 bg-emerald-50"
                      }`}
                      placeholder="Enter last name"
                      placeholderTextColor="#9CA3AF"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="last_name"
                />
                {errors.last_name && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-2">
                    {errors.last_name.message}
                  </Text>
                )}
              </View>

              {/* Email */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Email <Text className="text-red-500">*</Text>
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email format",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border-2 rounded-2xl px-5 py-4 text-gray-900 ${
                        errors.email
                          ? "border-red-300 bg-red-50"
                          : "border-emerald-200 bg-emerald-50"
                      }`}
                      placeholder="Enter email"
                      placeholderTextColor="#9CA3AF"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                  name="email"
                />
                {errors.email && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-2">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Phone */}
              <View className="mb-2">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Phone <Text className="text-red-500">*</Text>
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Phone number is required",
                    pattern: {
                      value: /^09\d{9}$/,
                      message: "Invalid phone number format (09XXXXXXXXX)",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        className={`border-2 rounded-2xl px-5 py-4 text-gray-900 ${
                          errors.phone
                            ? "border-red-300 bg-red-50"
                            : value && isPhoneValid
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-emerald-200 bg-emerald-50"
                        }`}
                        placeholder="09613886156"
                        placeholderTextColor="#9CA3AF"
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          const formatted = formatPhoneNumber(text);
                          onChange(formatted);
                        }}
                        value={value}
                        keyboardType="phone-pad"
                        maxLength={11}
                      />
                      {value && isPhoneValid && (
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
                  name="phone"
                />
                {errors.phone && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-2">
                    {errors.phone.message}
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
                    Format: 09XXXXXXXXX (11 digits)
                  </Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="bg-emerald-500 rounded-2xl py-4 flex-row items-center justify-center mb-6"
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
                <Ionicons name="save-outline" size={18} color="white" />
              </View>
              <Text className="text-white text-center font-bold text-lg">
                Update Profile
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
