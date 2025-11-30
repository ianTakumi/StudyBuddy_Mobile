import { login, setOnboarded } from "@/redux/slices/authSlice";
import client from "@/utils/axiosInstance";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const dispatch = useDispatch();

  const onSubmit = async (data: { email: string; password: string }) => {
    // Trim the data before sending to API
    const trimmedData = {
      email: data.email.trim(),
      password: data.password.trim(),
    };

    await client
      .post("/auth/login", trimmedData)
      .then((res) => {
        if (res.status === 200) {
          // Updated for StudyBuddy roles
          console.log(res.data);
          dispatch(
            login({
              user: res.data.user,
              access_token: res.data.access_token,
              refresh_token: res.data.refresh_token,
            })
          );

          dispatch(setOnboarded());
          console.log(res.data.user);
          // Redirect based on role
          if (res.data.user.role === "teacher") {
            router.replace("/teachers/(drawers)/(tabs)/Index");
          } else {
            router.replace("/students/(drawers)/(tabs)");
          }
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Invalid email or password. Please try again.");
      });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-20">
      {/* Centered Icon */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-blue-600 rounded-full justify-center items-center mb-4">
          <Ionicons name="school" size={48} color="white" />
        </View>
        <Text className="text-2xl font-bold text-gray-800">StudyBuddy</Text>
        <Text className="text-gray-500 mt-1">Your Learning Companion</Text>
      </View>

      <Text className="text-2xl font-semibold text-gray-800 mb-1">
        Welcome Back
      </Text>
      <Text className="text-gray-400 mb-6">
        Sign in to continue your learning journey
      </Text>

      {/* Email */}
      <Text className="text-gray-700 mb-2">Email</Text>
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: "Enter a valid email address",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="student@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            className={`border rounded-xl px-4 py-3 mb-1 text-black ${
              errors.email ? "border-red-400" : "border-gray-300"
            }`}
            style={{ color: "black" }}
          />
        )}
      />

      {errors.email && (
        <Text className="text-red-500 text-sm mb-3">
          {errors.email.message}
        </Text>
      )}

      {/* Password */}
      <Text className="text-gray-700 mb-2">Password</Text>
      <View className="relative mb-1">
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className={`border rounded-xl px-4 py-3 text-black pr-12 ${
                errors.password ? "border-red-400" : "border-gray-300"
              }`}
              style={{ color: "black" }}
            />
          )}
        />
        <TouchableOpacity
          onPress={toggleShowPassword}
          className="absolute right-3 top-3"
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      {errors.password && (
        <Text className="text-red-500 text-sm mb-3">
          {errors.password.message}
        </Text>
      )}

      <TouchableOpacity
        className="mb-6 self-end"
        onPress={() => router.push("/ForgotPassword")}
      >
        <Text className="text-blue-600 text-sm font-medium">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        className={`rounded-xl py-4 mb-6 ${
          isSubmitting ? "bg-blue-400" : "bg-blue-600"
        }`}
      >
        <Text className="text-white text-center font-semibold text-base">
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-4">
        <Text className="text-gray-500">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/RegisterScreen")}>
          <Text className="text-blue-600 font-medium">Sign up here</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
