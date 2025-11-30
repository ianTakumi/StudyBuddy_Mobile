import { logout } from "@/redux/slices/authSlice";
import ActionSheetHelper from "@/utils/ActionSheetHelper";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const dispatch = useDispatch();
  console.log(user);
  const userData = {
    name: user?.first_name + " " + user?.last_name || "Student",
    username: "@" + (user?.username || "student"),
    email: user?.email || "student@example.com",
  };

  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [studyRemindersEnabled, setStudyRemindersEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    dispatch(logout());
    router.push("/LoginScreen");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = (): void => {
    ActionSheetHelper.showLogoutConfirmation(() => {
      dispatch(logout());
      router.push("/LoginScreen");
    });
  };

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-5">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6">
        <Text className="text-2xl font-bold text-gray-900">Prodfile</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-[#4A90E2] mx-4 py-8 items-center border-b border-gray-200 rounded-xl">
          <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="person-outline" size={32} color="#4A90E2" />
          </View>
          <Text className="text-xl font-bold text-white mb-1">
            {user.first_name + " " + user.last_name}
          </Text>
          <Text className="text-gray-200 text-base">Student</Text>
          <Text className="text-gray-300 text-sm mt-1">{user.email}</Text>
        </View>

        {/* Study Settings Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Study Settings
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Customize your learning experience
            </Text>
          </View>

          {/* Study Goals */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/StudyGoals")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="flag-outline" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">Study Goals</Text>
                <Text className="text-gray-500 text-sm">
                  Set and track your learning objectives
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Study Preferences */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/StudyPreferences")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="settings-outline" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Study Preferences
                </Text>
                <Text className="text-gray-500 text-sm">
                  Customize your study environment
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Account</Text>
            <Text className="text-gray-500 text-sm mt-1">
              Manage your account information
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
                  Update your personal details
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Change Password */}
          <TouchableOpacity className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#4A90E2"
                />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Change Password
                </Text>
                <Text className="text-gray-500 text-sm">
                  Update your password
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              App Settings
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Customize your app experience
            </Text>
          </View>

          {/* Study Reminders */}
          <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#4A90E2"
                />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Study Reminders
                </Text>
                <Text className="text-gray-500 text-sm">
                  Get notified about study sessions
                </Text>
              </View>
            </View>
            <Switch
              value={studyRemindersEnabled}
              onValueChange={setStudyRemindersEnabled}
              trackColor={{ false: "#D1D5DB", true: "#4A90E2" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Dark Mode */}
          <View className="px-6 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="moon-outline" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">Dark Mode</Text>
                <Text className="text-gray-500 text-sm">
                  Switch to dark theme
                </Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: "#D1D5DB", true: "#4A90E2" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Support Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Support</Text>
          </View>

          {/* Help & Support */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/users/Contact")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#4A90E2"
                />
              </View>
              <Text className="text-gray-900 font-medium">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* About StudyBuddy */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between"
            onPress={() => router.push("/students/AboutUs")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#4A90E2"
                />
              </View>
              <Text className="text-gray-900 font-medium">
                About StudyBuddy
              </Text>
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
