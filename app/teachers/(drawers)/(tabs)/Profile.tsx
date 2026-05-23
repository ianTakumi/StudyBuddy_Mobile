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

export default function TeacherProfile() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.replace("/LoginScreen");
    setTimeout(() => {
      dispatch(logout());
    }, 200);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = (): void => {
    ActionSheetHelper.showLogoutConfirmation(() => {
      router.replace("/LoginScreen");
      setTimeout(() => {
        dispatch(logout());
      }, 200);
    });
  };

  if (!user) {
    return (
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center">
            <Ionicons name="person-outline" size={28} color="#10B981" />
          </View>
          <View className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-200 rounded-full opacity-50" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading teacher profile...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-emerald-50 pt-5">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6">
        <Text className="text-2xl font-bold text-gray-900">
          Teacher Profile
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Teacher Header */}
        <View
          className="bg-emerald-500 mx-4 mt-6 py-8 items-center rounded-3xl relative overflow-hidden"
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <View className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full" />
          <View className="absolute -bottom-8 -left-8 w-20 h-20 bg-white/10 rounded-full" />
          <View className="absolute top-4 left-6 w-10 h-10 bg-white/10 rounded-full" />
          <View className="absolute bottom-6 right-8 w-12 h-12 bg-white/10 rounded-full" />

          <View
            className="bg-white w-20 h-20 rounded-full items-center justify-center mb-4 z-10"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Ionicons name="person-outline" size={32} color="#10B981" />
          </View>
          <Text className="text-xl font-bold text-white mb-1 z-10">
            {user.first_name + " " + user.last_name}
          </Text>
          <Text className="text-emerald-100 text-base z-10">Teacher</Text>
          <Text className="text-emerald-200 text-sm mt-1 z-10">
            {user.email}
          </Text>
        </View>

        {/* Account Settings Section */}
        <View
          className="bg-white mt-6 mx-4 rounded-3xl overflow-hidden relative"
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />

          <View className="px-6 py-4 border-b border-emerald-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
                <Ionicons name="settings-outline" size={16} color="#10B981" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-900">
                  Account Settings
                </Text>
                <Text className="text-gray-500 text-sm mt-0.5">
                  Manage your account preferences
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-emerald-100"
            onPress={() => router.push("/students/UpdateProfile")}
          >
            <View className="flex-row items-center">
              <View className="bg-emerald-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-gray-900 font-semibold">
                  Personal Information
                </Text>
                <Text className="text-gray-500 text-sm">
                  Update your profile details
                </Text>
              </View>
            </View>
            <View className="w-7 h-7 bg-emerald-100 rounded-full items-center justify-center">
              <Ionicons name="chevron-forward" size={14} color="#10B981" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between"
            onPress={() => router.push("/students/ChangePassword")}
          >
            <View className="flex-row items-center">
              <View className="bg-emerald-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <View>
                <Text className="text-gray-900 font-semibold">
                  Change Password
                </Text>
                <Text className="text-gray-500 text-sm">
                  Update your password
                </Text>
              </View>
            </View>
            <View className="w-7 h-7 bg-emerald-100 rounded-full items-center justify-center">
              <Ionicons name="chevron-forward" size={14} color="#10B981" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View
          className="bg-white mt-6 mx-4 rounded-3xl overflow-hidden relative"
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />

          <View className="px-6 py-4 border-b border-emerald-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
                <Ionicons name="headset-outline" size={16} color="#10B981" />
              </View>
              <Text className="text-lg font-bold text-gray-900">Support</Text>
            </View>
          </View>

          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-b border-emerald-100"
            onPress={() => router.push("/students/Contact")}
          >
            <View className="flex-row items-center">
              <View className="bg-emerald-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <Text className="text-gray-900 font-semibold">
                Help & Support
              </Text>
            </View>
            <View className="w-7 h-7 bg-emerald-100 rounded-full items-center justify-center">
              <Ionicons name="chevron-forward" size={14} color="#10B981" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between"
            onPress={() => router.push("/students/AboutUs")}
          >
            <View className="flex-row items-center">
              <View className="bg-emerald-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <Text className="text-gray-900 font-semibold">About PTCIANS</Text>
            </View>
            <View className="w-7 h-7 bg-emerald-100 rounded-full items-center justify-center">
              <Ionicons name="chevron-forward" size={14} color="#10B981" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          className="bg-white mt-6 mx-4 rounded-3xl px-6 py-4 flex-row items-center justify-between relative overflow-hidden"
          onPress={handleLogout}
          style={{
            shadowColor: "#EF4444",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          <View className="absolute -top-4 -right-4 w-16 h-16 bg-red-50 rounded-full" />

          <View className="flex-row items-center">
            <View className="bg-red-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View>
              <Text className="text-red-600 font-semibold">Log out</Text>
              <Text className="text-gray-500 text-sm">
                Sign out of your account
              </Text>
            </View>
          </View>
          <View className="w-7 h-7 bg-red-100 rounded-full items-center justify-center">
            <Ionicons name="chevron-forward" size={14} color="#EF4444" />
          </View>
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
              <View
                className="bg-white rounded-3xl p-8 mx-4 w-80 relative overflow-hidden"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 20 },
                  shadowOpacity: 0.2,
                  shadowRadius: 40,
                  elevation: 15,
                }}
              >
                <View className="absolute -top-8 -right-8 w-20 h-20 bg-emerald-50 rounded-full" />
                <View className="absolute -bottom-6 -left-6 w-16 h-16 bg-red-50 rounded-full" />

                <View
                  className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mx-auto mb-4"
                  style={{
                    shadowColor: "#EF4444",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Ionicons name="log-out-outline" size={28} color="#EF4444" />
                </View>

                <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                  Confirm Logout
                </Text>
                <Text className="text-gray-600 text-center mb-6">
                  Are you sure you want to logout from PTCIANS?
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                    onPress={cancelLogout}
                  >
                    <Text className="text-gray-700 font-semibold text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-4 px-4 bg-red-500 rounded-2xl"
                    onPress={confirmLogout}
                    style={{
                      shadowColor: "#EF4444",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 5,
                    }}
                  >
                    <Text className="text-white font-bold text-center">
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
