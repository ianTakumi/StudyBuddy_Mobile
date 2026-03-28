import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import client from "@/utils/axiosInstance";

export default function UpdateUser() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: params.first_name || "",
    last_name: params.last_name || "",
    email: params.email || "",
    phone: params.phone || "",
    role: params.role || "student",
  });

  const handleSave = async () => {
    // Validate form
    if (!formData.first_name.trim()) {
      Alert.alert("Error", "First name is required");
      return;
    }
    if (!formData.last_name.trim()) {
      Alert.alert("Error", "Last name is required");
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }

    try {
      setLoading(true);
      const response = await client.put(
        `/users/profile/${params.id}`,
        formData,
      );

      if (response.data.success) {
        Alert.alert("Success", "User updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", "Failed to update user");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred");
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-5 py-6 rounded-b-3xl shadow-lg">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-white">Edit User</Text>
            <Text className="text-blue-100 text-sm mt-1">
              Update user information
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* First Name */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">First Name</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
            value={formData.first_name}
            onChangeText={(text) =>
              setFormData({ ...formData, first_name: text })
            }
            placeholder="Enter first name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Last Name */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Last Name</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
            value={formData.last_name}
            onChangeText={(text) =>
              setFormData({ ...formData, last_name: text })
            }
            placeholder="Enter last name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Email</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Phone</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Role */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Role</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setFormData({ ...formData, role: "student" })}
              className={`flex-1 py-3 rounded-xl ${
                formData.role === "student" ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  formData.role === "student" ? "text-white" : "text-gray-700"
                }`}
              >
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFormData({ ...formData, role: "teacher" })}
              className={`flex-1 py-3 rounded-xl ${
                formData.role === "teacher" ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  formData.role === "teacher" ? "text-white" : "text-gray-700"
                }`}
              >
                Teacher
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-gray-300 py-3 rounded-xl"
          >
            <Text className="text-center text-gray-700 font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-500 py-3 rounded-xl"
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-center text-white font-semibold">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
