import { logout } from "@/redux/slices/authSlice";
import ActionSheetHelper from "@/utils/ActionSheetHelper";
import Ionicons from "@expo/vector-icons/Ionicons";
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
    router.push("/LoginScreen");
    setTimeout(() => {
      dispatch(logout());
    }, 100);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = (): void => {
    ActionSheetHelper.showLogoutConfirmation(() => {
      router.push("/LoginScreen");
      // Add a small delay before dispatching logout
      setTimeout(() => {
        dispatch(logout());
      }, 100);
    });
  };

  if (!user) {
    return (
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <Text className="text-emerald-600">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-emerald-50 pt-5">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6">
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header */}
        <View className="bg-emerald-500 mx-4 py-8 items-center rounded-xl relative overflow-hidden">
          {/* Decorative Circles - positioned at edges only */}
          <View className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full" />
          <View className="absolute -bottom-8 -left-8 w-20 h-20 bg-white/10 rounded-full" />
          <View className="absolute top-2 left-4 w-8 h-8 bg-white/10 rounded-full" />
          <View className="absolute bottom-4 right-6 w-10 h-10 bg-white/10 rounded-full" />

          <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-4 z-10">
            <Ionicons name="person-outline" size={32} color="#059669" />
          </View>
          <Text className="text-xl font-bold text-white mb-1 z-10">
            {user.first_name + " " + user.last_name}
          </Text>
          <Text className="text-emerald-100 text-base z-10">Student</Text>
          <Text className="text-emerald-200 text-sm mt-1 z-10">
            {user.email}
          </Text>
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
            onPress={() => router.push("/students/StudyGoals")}
          >
            <View className="flex-row items-center">
              <View className="bg-emerald-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="flag-outline" size={20} color="#059669" />
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
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200 mb-10"
            onPress={() => router.push("/students/UpdateProfile")}
          >
            <View className="flex-row items-center">
              <View className="bg-emerald-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#059669" />
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
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/students/ChangePassword")}
          >
            <View className="flex-row items-center">
              <View className="bg-emerald-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#059669"
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

        {/* Support Section */}
        <View className="bg-white mt-6 mx-4 rounded-2xl overflow-hidden border border-gray-200">
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Support</Text>
          </View>

          {/* Help & Support */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200"
            onPress={() => router.push("/students/Contact")}
          >
            <View className="flex-row items-center">
              <View className="bg-emerald-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#059669"
                />
              </View>
              <Text className="text-gray-900 font-medium">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* About PTCIANS */}
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between"
            onPress={() => router.push("/students/AboutUs")}
          >
            <View className="flex-row items-center">
              <View className="bg-emerald-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#059669"
                />
              </View>
              <Text className="text-gray-900 font-medium">About PTCIANS</Text>
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
                  Are you sure you want to logout from PTCIANS?
                </Text>
                <View className="flex-row justify-between gap-3">
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
