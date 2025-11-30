import React from "react";
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
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import {
  validatePhone,
  validateEmail,
  formatPhoneNumber,
} from "@/utils/helpers";
import client from "@/utils/axiosInstance";
import { updateProfile } from "@/redux/slices/authSlice";

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
        "Please enter a valid 11-digit phone number starting with 09 (e.g., 09613886156)."
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pt-3 border-b border-blue-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-blue-100 rounded-lg"
        >
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-blue-800">
            Update Profile
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
            {/* Personal Information Section */}
            <View className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Personal Information
              </Text>

              {/* First Name */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "First name is required",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-lg px-4 py-3 ${
                        errors.first_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter first name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="first_name"
                />
                {errors.first_name && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.first_name.message}
                  </Text>
                )}
              </View>

              {/* Last Name */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </Text>
                <Controller
                  control={control}
                  rules={{
                    required: "Last name is required",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-lg px-4 py-3 ${
                        errors.last_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter last name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="last_name"
                />
                {errors.last_name && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.last_name.message}
                  </Text>
                )}
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email *
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
                      className={`border rounded-lg px-4 py-3 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter email"
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
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Phone */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Phone *
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
                    <TextInput
                      className={`border rounded-lg px-4 py-3 ${
                        errors.phone
                          ? "border-red-500"
                          : value && isPhoneValid
                            ? "border-blue-500"
                            : "border-gray-300"
                      }`}
                      placeholder="09613886156"
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        const formatted = formatPhoneNumber(text);
                        onChange(formatted);
                      }}
                      value={value}
                      keyboardType="phone-pad"
                      maxLength={11}
                    />
                  )}
                  name="phone"
                />
                {errors.phone && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </Text>
                )}
                <Text className="text-xs text-gray-500 mt-1">
                  Format: 09XXXXXXXXX (11 digits)
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="bg-blue-600 rounded-lg py-4 flex-row items-center justify-center shadow-lg active:bg-blue-700"
            >
              <Ionicons name="save-outline" size={20} color="white" />
              <Text className="text-white text-center font-semibold text-lg ml-2">
                Update Profile
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
