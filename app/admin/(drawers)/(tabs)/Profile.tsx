// app/Profile.tsx - Admin Profile Screen
import { logout } from "@/redux/slices/authSlice";
import ActionSheetHelper from "@/utils/ActionSheetHelper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function AdminProfile() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const dispatch = useDispatch();

  console.log("Admin user:", user);

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
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
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
          <Text className="text-gray-200 text-base capitalize">
            {user.role?.replace("_", " ") || "Administrator"}
          </Text>
          <Text className="text-gray-300 text-sm mt-1">{user.email}</Text>
        </View>

        {/* Admin Statistics Section */}
        {/* <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Admin Statistics
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Your platform management overview
            </Text>
          </View>

          <View className="px-6 py-4">
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] items-center mb-4">
                <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="flash-outline" size={24} color="#4A90E2" />
                </View>
                <Text className="text-2xl font-bold text-gray-900">245</Text>
                <Text className="text-gray-500 text-sm text-center">
                  Total Actions
                </Text>
              </View>

              <View className="w-[48%] items-center mb-4">
                <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="people-outline" size={24} color="#34C759" />
                </View>
                <Text className="text-2xl font-bold text-gray-900">156</Text>
                <Text className="text-gray-500 text-sm text-center">
                  Users Managed
                </Text>
              </View>

              <View className="w-[48%] items-center">
                <View className="bg-orange-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color="#FF9500"
                  />
                </View>
                <Text className="text-2xl font-bold text-gray-900">89</Text>
                <Text className="text-gray-500 text-sm text-center">
                  Content Reviewed
                </Text>
              </View>

              <View className="w-[48%] items-center">
                <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="flag-outline" size={24} color="#AF52DE" />
                </View>
                <Text className="text-2xl font-bold text-gray-900">34</Text>
                <Text className="text-gray-500 text-sm text-center">
                  Reports Resolved
                </Text>
              </View>
            </View>
          </View>
        </View> */}

        {/* Account Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Account</Text>
            <Text className="text-gray-500 text-sm mt-1">
              Manage your admin account
            </Text>
          </View>

          {/* Personal Information */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/admin/UpdateProfile")}
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
                  Update your admin details
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Change Password */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/admin/ChangePassword")}
          >
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
                  Update your admin password
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* System Settings */}
          {/* <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between"
            onPress={() => router.push("/admin/SystemSettings")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="settings-outline" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  System Settings
                </Text>
                <Text className="text-gray-500 text-sm">
                  Manage platform configuration
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity> */}
        </View>

        {/* Admin Tools Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Admin Tools
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Platform management utilities
            </Text>
          </View>

          {/* User Management */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/admin/(drawers)/(tabs)/Users")}
          >
            <View className="flex-row items-center">
              <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="people-outline" size={20} color="#34C759" />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  User Management
                </Text>
                <Text className="text-gray-500 text-sm">
                  Manage all platform users
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Content Moderation */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/admin/(drawers)/(tabs)/Content")}
          >
            <View className="flex-row items-center">
              <View className="bg-orange-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#FF9500"
                />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Content Moderation
                </Text>
                <Text className="text-gray-500 text-sm">
                  Review and manage content
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Analytics & Reports */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between"
            onPress={() => router.push("/admin/(drawers)/(tabs)/Analytics")}
          >
            <View className="flex-row items-center">
              <View className="bg-purple-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="stats-chart-outline"
                  size={20}
                  color="#AF52DE"
                />
              </View>
              <View>
                <Text className="text-gray-900 font-medium">
                  Analytics & Reports
                </Text>
                <Text className="text-gray-500 text-sm">
                  View platform insights
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Support</Text>
          </View>

          {/* Help & Support */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/admin/Contact")}
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
            onPress={() => router.push("/admin/AboutUs")}
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
                Sign out of your admin account
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
                  Are you sure you want to logout from StudyBuddy Admin?
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
