import ActionSheetHelper from "@/utils/ActionSheetHelper";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function TeacherProfile() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    // Add logout logic here
    // dispatch(logout());
    router.push("/LoginScreen");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = (): void => {
    ActionSheetHelper.showLogoutConfirmation(() => {
      // dispatch(logout());
      router.push("/LoginScreen");
    });
  };

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Loading teacher profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-5">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6">
        <Text className="text-2xl font-bold text-gray-900">
          Teacher Profile
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Teacher Header */}
        <View className="bg-[#4A90E2] mx-4 py-8 items-center border-b border-gray-200 rounded-xl">
          <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="person-outline" size={32} color="#4A90E2" />
          </View>
          <Text className="text-xl font-bold text-white mb-1">
            {user.first_name + " " + user.last_name}
          </Text>
          <Text className="text-gray-200 text-base">Teacher</Text>
          <Text className="text-gray-300 text-sm mt-1">{user.email}</Text>
        </View>

        {/* Teaching Overview Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Teaching Overview
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Your teaching summary and statistics
            </Text>
          </View>

          {/* Teaching Stats */}
          <View className="px-6 py-4 border-b border-gray-200">
            <View className="flex-row justify-between mb-4">
              <View className="flex-1">
                <Text className="text-gray-500 text-sm">Active Classes</Text>
                <Text className="text-gray-900 font-bold text-lg">4</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm">Total Students</Text>
                <Text className="text-blue-600 font-bold text-lg">156</Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-gray-500 text-sm">Assignments</Text>
                <Text className="text-gray-900 font-bold text-lg">12</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm">Avg. Score</Text>
                <Text className="text-green-600 font-bold text-lg">87%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Teaching Management Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Teaching Management
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Manage your classes and teaching materials
            </Text>
          </View>

          {/* Class Management */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/Classes")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="school-outline" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Class Management
                </Text>
                <Text className="text-gray-500 text-sm">
                  Manage classes and students
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Assignment Management */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/Assignments")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#4A90E2"
                />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Assignment Management
                </Text>
                <Text className="text-gray-500 text-sm">
                  Create and grade assignments
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Analytics & Reports */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/Analytics")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="bar-chart-outline" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Analytics & Reports
                </Text>
                <Text className="text-gray-500 text-sm">
                  Student performance analytics
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Teaching Resources */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between"
            onPress={() => router.push("/Resources")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="library-outline" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Teaching Resources
                </Text>
                <Text className="text-gray-500 text-sm">
                  Manage teaching materials
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Account Settings Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Account Settings
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Manage your account preferences
            </Text>
          </View>

          {/* Personal Information */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/users/UpdateProfile")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Personal Information
                </Text>
                <Text className="text-gray-500 text-sm">
                  Update your profile details
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Teaching Preferences */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/TeacherPreferences")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="settings-outline" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Teaching Preferences
                </Text>
                <Text className="text-gray-500 text-sm">
                  Customize your teaching settings
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between"
            onPress={() => router.push("/Notifications")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#4A90E2"
                />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">Notifications</Text>
                <Text className="text-gray-500 text-sm">
                  Manage your alerts and notifications
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          className="bg-white mt-6 mx-4 rounded-2xl px-6 py-4 flex-row items-center justify-between border border-gray-200 mb-8"
          onPress={handleLogout}
        >
          <View className="flex-row items-center">
            <View className="bg-red-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View>
              <Text className="text-red-600 font-medium">Log out</Text>
              <Text className="text-gray-500 text-sm">
                Sign out of your account
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={cancelLogout}
      >
        <TouchableWithoutFeedback onPress={cancelLogout}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-2xl p-6 mx-4 w-80">
                <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                  Confirm Logout
                </Text>
                <Text className="text-gray-600 text-center mb-6">
                  Are you sure you want to logout from StudyBuddy?
                </Text>
                <View className="flex-row justify-between space-x-3">
                  <TouchableOpacity
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                    onPress={cancelLogout}
                  >
                    <Text className="text-gray-700 font-medium text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 px-4 bg-red-600 rounded-xl"
                    onPress={confirmLogout}
                  >
                    <Text className="text-white font-medium text-center">
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
