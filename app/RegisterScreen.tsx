import { setOnboarded } from "@/redux/slices/authSlice";
import client from "@/utils/axiosInstance";
import {
  validateEmail,
  validatePassword,
  validatePhone,
} from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

interface RegisterForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "student" | "teacher";
}

const RegisterScreen: React.FC = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      const { firstName, lastName, phone, email, password, role } = data;

      await client
        .post("/auth/register", {
          firstName,
          lastName,
          phone,
          email,
          password,
          role,
        })
        .then((res) => {
          if (res.status === 201) {
            dispatch(setOnboarded());
            alert("Registration successful! Please log in.");
            router.push("/LoginScreen");
          } else {
            alert("Registration failed. Please try again.");
          }
        });
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-10">
      {/* Centered Icon */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-blue-600 rounded-full justify-center items-center mb-4">
          <Ionicons name="person-add" size={48} color="white" />
        </View>
        <Text className="text-2xl font-bold text-gray-800">
          Join StudyBuddy
        </Text>
        <Text className="text-gray-500 mt-1">Create your learning account</Text>
      </View>

      <Text className="text-2xl font-semibold text-gray-800 mb-1">
        Get Started
      </Text>
      <Text className="text-gray-400 mb-6">
        Create your account to start learning
      </Text>

      {/* Role Selection */}
      <View className="mb-6">
        <Text className="text-gray-700 font-medium mb-3">I am a:</Text>
        <View className="flex-row space-x-4">
          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  onPress={() => onChange("student")}
                  className={`flex-1 py-3 rounded-xl border-2 ${
                    value === "student"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      value === "student" ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    Student
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onChange("teacher")}
                  className={`flex-1 py-3 rounded-xl border-2 ${
                    value === "teacher"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      value === "teacher" ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    Teacher
                  </Text>
                </TouchableOpacity>
              </>
            )}
          />
        </View>
      </View>

      {/* First Name */}
      <Controller
        control={control}
        name="firstName"
        rules={{ required: "First name is required" }}
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">First Name</Text>
            <TextInput
              placeholder="Enter your first name"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
              value={value}
              onChangeText={onChange}
            />
            {errors.firstName && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Last Name */}
      <Controller
        control={control}
        name="lastName"
        rules={{ required: "Last name is required" }}
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">Last Name</Text>
            <TextInput
              placeholder="Enter your last name"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
              value={value}
              onChangeText={onChange}
            />
            {errors.lastName && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Phone */}
      <Controller
        control={control}
        name="phone"
        rules={{
          required: "Phone number is required",
          validate: (v) => validatePhone(v) || "Invalid phone number format",
        }}
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">Phone Number</Text>
            <TextInput
              placeholder="09XXXXXXXXX"
              keyboardType="phone-pad"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
              value={value}
              onChangeText={onChange}
              maxLength={11}
            />
            {errors.phone && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Email */}
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          validate: (v) => validateEmail(v) || "Invalid email format",
        }}
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">Email</Text>
            <TextInput
              placeholder="student@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
              value={value}
              onChangeText={onChange}
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Password */}
      <Controller
        control={control}
        name="password"
        rules={{
          required: "Password is required",
          validate: (v) =>
            validatePassword(v) ||
            "Must contain uppercase, lowercase, number, special char, and 8+ length",
        }}
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl bg-white px-4">
              <TextInput
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="flex-1 py-3"
                value={value}
                onChangeText={onChange}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Confirm Password */}
      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: "Confirm your password",
          validate: (v) => v === watch("password") || "Passwords do not match",
        }}
        render={({ field: { onChange, value } }) => (
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-1">
              Confirm Password
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl bg-white px-4">
              <TextInput
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                className="flex-1 py-3"
                value={value}
                onChangeText={onChange}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={22}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Submit Button */}
      <TouchableOpacity
        className={`rounded-xl py-4 mb-6 ${
          loading ? "bg-blue-400" : "bg-blue-600"
        }`}
        disabled={loading}
        onPress={handleSubmit(onSubmit)}
      >
        {loading ? (
          <View className="flex-row justify-center items-center">
            <ActivityIndicator size="small" color="#fff" />
            <Text className="text-white text-center font-semibold text-base ml-2">
              Creating Account...
            </Text>
          </View>
        ) : (
          <Text className="text-white text-center font-semibold text-base">
            Create Account
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center mt-4 mb-10">
        <Text className="text-gray-500">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-blue-600 font-medium">Sign in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
