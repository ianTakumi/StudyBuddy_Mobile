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
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
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

      const status = role === "teacher" ? "inactive" : "active";

      await client
        .post("/auth/register", {
          firstName,
          lastName,
          phone,
          email,
          password,
          role: role,
          status,
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

  const watchRole = watch("role");

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAwareScrollView
        className="flex-1 bg-green-50"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
        contentContainerStyle={{ paddingBottom: 40 }}
        enableResetScrollToCoords={false}
      >
        {/* Top Header Section - Solid Green */}
        <View
          className="w-full pt-12 pb-8 px-6 items-center justify-center bg-emerald-500"
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
          <View className="absolute top-6 left-4 w-14 h-14 bg-emerald-400/30 rounded-full" />
          <View className="absolute top-16 right-8 w-20 h-20 bg-emerald-400/20 rounded-full" />
          <View className="absolute bottom-2 left-16 w-10 h-10 bg-emerald-300/40 rounded-full" />

          {/* Logo Container */}
          <View
            className="w-24 h-24 rounded-3xl justify-center items-center mb-3 bg-white"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Image
              source={require("../assets/logo/ptc_withoutbg_logo.png")}
              style={{ width: 65, height: 65 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-2xl font-bold text-white text-center mb-1">
            Join PTCIANS - Study Buddy
          </Text>
          <Text className="text-emerald-100 text-sm text-center">
            Create your interactive learning account
          </Text>
        </View>

        {/* Registration Form Card */}
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
                Get Started! 🚀
              </Text>
              <Text className="text-gray-500 text-base">
                Create your account to start learning
              </Text>
            </View>

            {/* Role Selection */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-3 ml-1">
                I am a:
              </Text>
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row gap-x-3">
                    <TouchableOpacity
                      onPress={() => onChange("student")}
                      className={`flex-1 py-3.5 rounded-2xl border-2 flex-row justify-center items-center ${
                        value === "student"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      style={{
                        shadowColor:
                          value === "student" ? "#10B981" : "transparent",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: value === "student" ? 3 : 0,
                      }}
                    >
                      <Ionicons
                        name="school-outline"
                        size={20}
                        color={value === "student" ? "#10B981" : "#9CA3AF"}
                      />
                      <Text
                        className={`text-center font-semibold ml-2 ${
                          value === "student"
                            ? "text-emerald-600"
                            : "text-gray-500"
                        }`}
                      >
                        Student
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onChange("teacher")}
                      className={`flex-1 py-3.5 rounded-2xl border-2 flex-row justify-center items-center ${
                        value === "teacher"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      style={{
                        shadowColor:
                          value === "teacher" ? "#10B981" : "transparent",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: value === "teacher" ? 3 : 0,
                      }}
                    >
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color={value === "teacher" ? "#10B981" : "#9CA3AF"}
                      />
                      <Text
                        className={`text-center font-semibold ml-2 ${
                          value === "teacher"
                            ? "text-emerald-600"
                            : "text-gray-500"
                        }`}
                      >
                        Teacher
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {watchRole === "teacher" && (
                <View className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex-row items-center">
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#D97706"
                  />
                  <Text className="text-amber-700 text-xs ml-2 flex-1">
                    Teacher accounts require admin approval before you can sign
                    in.
                  </Text>
                </View>
              )}
            </View>

            {/* First Name & Last Name - Side by Side */}
            <View className="flex-row gap-x-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2 ml-1">
                  First Name
                </Text>
                <Controller
                  control={control}
                  name="firstName"
                  rules={{ required: "First name is required" }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View
                        className={`flex-row items-center border-2 rounded-2xl px-4 py-3.5 bg-gray-50 ${
                          errors.firstName
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color={errors.firstName ? "#EF4444" : "#10B981"}
                        />
                        <TextInput
                          placeholder="Juan"
                          placeholderTextColor="#9CA3AF"
                          className="flex-1 ml-2 text-base"
                          value={value}
                          onChangeText={onChange}
                          style={{ color: "black" }}
                        />
                      </View>
                      {errors.firstName && (
                        <Text className="text-red-500 text-xs mt-1 ml-2">
                          {errors.firstName.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2 ml-1">
                  Last Name
                </Text>
                <Controller
                  control={control}
                  name="lastName"
                  rules={{ required: "Last name is required" }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View
                        className={`flex-row items-center border-2 rounded-2xl px-4 py-3.5 bg-gray-50 ${
                          errors.lastName
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color={errors.lastName ? "#EF4444" : "#10B981"}
                        />
                        <TextInput
                          placeholder="Dela Cruz"
                          placeholderTextColor="#9CA3AF"
                          className="flex-1 ml-2 text-base"
                          value={value}
                          onChangeText={onChange}
                          style={{ color: "black" }}
                        />
                      </View>
                      {errors.lastName && (
                        <Text className="text-red-500 text-xs mt-1 ml-2">
                          {errors.lastName.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2 ml-1">
                Phone Number
              </Text>
              <Controller
                control={control}
                name="phone"
                rules={{
                  required: "Phone number is required",
                  validate: (v) =>
                    validatePhone(v) || "Invalid phone number format",
                }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <View
                      className={`flex-row items-center border-2 rounded-2xl px-4 py-3.5 bg-gray-50 ${
                        errors.phone
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color={errors.phone ? "#EF4444" : "#10B981"}
                      />
                      <TextInput
                        placeholder="09XXXXXXXXX"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        className="flex-1 ml-3 text-base"
                        value={value}
                        onChangeText={onChange}
                        maxLength={11}
                        style={{ color: "black" }}
                      />
                    </View>
                    {errors.phone && (
                      <Text className="text-red-500 text-xs mt-1 ml-2">
                        {errors.phone.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2 ml-1">
                Email Address
              </Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  validate: (v) => validateEmail(v) || "Invalid email format",
                }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <View
                      className={`flex-row items-center border-2 rounded-2xl px-4 py-3.5 bg-gray-50 ${
                        errors.email
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={errors.email ? "#EF4444" : "#10B981"}
                      />
                      <TextInput
                        placeholder="student@example.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 ml-3 text-base"
                        value={value}
                        onChangeText={onChange}
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
                    {errors.email && (
                      <Text className="text-red-500 text-xs mt-1 ml-2">
                        {errors.email.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Password */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2 ml-1">
                Password
              </Text>
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
                  <View>
                    <View
                      className={`flex-row items-center border-2 rounded-2xl px-4 py-3.5 bg-gray-50 ${
                        errors.password
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={errors.password ? "#EF4444" : "#10B981"}
                      />
                      <TextInput
                        placeholder="Enter your password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        className="flex-1 ml-3 text-base"
                        value={value}
                        onChangeText={onChange}
                        style={{ color: "black" }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="p-1"
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-off-outline" : "eye-outline"
                          }
                          size={22}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text className="text-red-500 text-xs mt-1 ml-2">
                        {errors.password.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2 ml-1">
                Confirm Password
              </Text>
              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: "Confirm your password",
                  validate: (v) => {
                    const trimmedConfirm = v?.trim();
                    const trimmedPassword = watch("password")?.trim();
                    return (
                      trimmedConfirm === trimmedPassword ||
                      "Passwords do not match"
                    );
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <View
                      className={`flex-row items-center border-2 rounded-2xl px-4 py-3.5 bg-gray-50 ${
                        errors.confirmPassword
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={errors.confirmPassword ? "#EF4444" : "#10B981"}
                      />
                      <TextInput
                        placeholder="Confirm your password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        className="flex-1 ml-3 text-base"
                        value={value}
                        onChangeText={onChange}
                        style={{ color: "black" }}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="p-1"
                      >
                        <Ionicons
                          name={
                            showConfirmPassword
                              ? "eye-off-outline"
                              : "eye-outline"
                          }
                          size={22}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text className="text-red-500 text-xs mt-1 ml-2">
                        {errors.confirmPassword.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`rounded-2xl py-4 mb-6 ${
                loading ? "bg-gray-400" : "bg-emerald-500"
              }`}
              disabled={loading}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.8}
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {loading ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white text-center font-bold text-lg ml-2">
                    Creating Account...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500 text-base">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
              <Text className="text-emerald-600 font-bold text-base">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;
