import { login, setOnboarded } from "@/redux/slices/authSlice";
import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

const { width } = Dimensions.get("window");

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
    const trimmedData = {
      email: data.email.trim(),
      password: data.password.trim(),
    };

    await client
      .post("/auth/login", trimmedData)
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);

          if (res.data.user.status === "inactive") {
            alert(
              "Your account is currently inactive. Please contact the administrator to activate your account.",
            );
            return;
          }

          dispatch(
            login({
              user: res.data.user,
              access_token: res.data.access_token,
              refresh_token: res.data.refresh_token,
            }),
          );

          dispatch(setOnboarded());
          console.log(res.data.user);

          if (res.data.user.role === "teacher") {
            router.replace("/teachers/(drawers)/(tabs)/Index");
          } else if (res.data.user.role === "admin") {
            router.replace("/admin/(drawers)/(tabs)/Index");
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-green-50"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Section - Solid Green */}
        <View
          className="w-full pt-16 pb-12 px-6 items-center justify-center bg-emerald-500"
          style={{
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Decorative Circles */}
          <View className="absolute top-8 left-6 w-16 h-16 bg-emerald-400/30 rounded-full" />
          <View className="absolute top-20 right-10 w-24 h-24 bg-emerald-400/20 rounded-full" />
          <View className="absolute bottom-4 left-20 w-12 h-12 bg-emerald-300/40 rounded-full" />

          {/* Logo Container */}
          <View
            className="w-28 h-28 rounded-3xl justify-center items-center mb-4 bg-white"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Image
              source={require("../assets/logo/ptc_withoutbg_logo.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-3xl font-bold text-white text-center mb-1">
            PTCIANS - Study Buddy
          </Text>
          <Text className="text-emerald-100 text-base text-center">
            Your Interactive Learning Companion
          </Text>

          {/* Feature Pills */}
          <View className="flex-row mt-5 gap-x-2">
            <View className="bg-emerald-400/40 rounded-full px-4 py-2 flex-row items-center">
              <Ionicons name="school-outline" size={16} color="white" />
              <Text className="text-white text-xs ml-1">Learn</Text>
            </View>
            <View className="bg-emerald-400/40 rounded-full px-4 py-2 flex-row items-center">
              <Ionicons name="people-outline" size={16} color="white" />
              <Text className="text-white text-xs ml-1">Collaborate</Text>
            </View>
            <View className="bg-emerald-400/40 rounded-full px-4 py-2 flex-row items-center">
              <Ionicons name="rocket-outline" size={16} color="white" />
              <Text className="text-white text-xs ml-1">Excel</Text>
            </View>
          </View>
        </View>

        {/* Login Form Card */}
        <View className="px-6 -mt-6 mb-8">
          <View
            className="bg-white rounded-3xl p-6"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 24,
              elevation: 5,
            }}
          >
            {/* Welcome Text */}
            <View className="mb-6">
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                Welcome Back!
              </Text>
              <Text className="text-gray-500 text-base">
                Sign in to continue your learning journey
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-gray-700 font-medium mb-2 ml-1">
                Email Address
              </Text>
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
                  <View
                    className={`flex-row items-center border-2 rounded-2xl px-4 py-3.5 bg-gray-50 ${
                      errors.email
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 focus:border-emerald-400"
                    }`}
                    style={
                      !errors.email && {
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }
                    }
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={errors.email ? "#EF4444" : "#10B981"}
                    />
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="student@example.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="flex-1 ml-3 text-base"
                      style={{ color: "black" }}
                    />
                    {value && !errors.email && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10B981"
                      />
                    )}
                  </View>
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1.5 ml-2">
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-5">
              <Text className="text-gray-700 font-medium mb-2 ml-1">
                Password
              </Text>
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
                  <View
                    className={`flex-row items-center border-2 rounded-2xl px-4 py-3.5 bg-gray-50 ${
                      errors.password
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200"
                    }`}
                    style={
                      !errors.password && {
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }
                    }
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={errors.password ? "#EF4444" : "#10B981"}
                    />
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      className="flex-1 ml-3 text-base"
                      style={{ color: "black" }}
                    />
                    <TouchableOpacity
                      onPress={toggleShowPassword}
                      className="p-1"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1.5 ml-2">
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              className="mb-6 self-end"
              onPress={() => router.push("/ForgotPassword")}
            >
              <Text className="text-emerald-600 text-sm font-semibold">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              className={`rounded-2xl py-4 mb-6 ${
                isSubmitting ? "bg-gray-400" : "bg-emerald-500"
              }`}
              activeOpacity={0.8}
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="flex-row justify-center items-center">
                {isSubmitting && (
                  <Ionicons
                    name="hourglass-outline"
                    size={20}
                    color="white"
                    className="mr-2"
                  />
                )}
                <Text className="text-white text-center font-bold text-lg">
                  {isSubmitting ? "  Signing in..." : "Sign In"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500 text-base">
              Don&apos;t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/RegisterScreen")}>
              <Text className="text-emerald-600 font-bold text-base">
                Sign up here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
