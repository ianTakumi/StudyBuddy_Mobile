// app/Users.tsx - Users Management Screen
import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  created_at: string;
  flashcardsCreated: number;
  studySessions: number;
}

export default function UsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await client.get("/users");
      if (response.data.success) {
        const allUsers = response.data.data || [];
        const nonAdminUsers = allUsers.filter(
          (user: User) => user.role !== "admin",
        );
        setUsers(nonAdminUsers);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to load users. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (user.first_name?.toLowerCase() || "").includes(searchLower) ||
      (user.last_name?.toLowerCase() || "").includes(searchLower) ||
      (user.email?.toLowerCase() || "").includes(searchLower);
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getInactiveTeachers = () => {
    return filteredUsers.filter(
      (user) => user.role === "teacher" && user.status === "inactive",
    );
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const selectAllInactiveTeachers = () => {
    const inactiveTeachers = getInactiveTeachers();
    if (inactiveTeachers.length === 0) return;
    const inactiveTeacherIds = inactiveTeachers.map((user) => user.id);
    if (
      selectedUsers.length === inactiveTeacherIds.length &&
      inactiveTeacherIds.every((id) => selectedUsers.includes(id))
    ) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(inactiveTeacherIds);
    }
  };

  const handleEditUser = (user: User) => {
    router.push({
      pathname: "/admin/updateUser",
      params: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
      },
    });
  };

  const activateTeachers = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert(
        "No teachers selected",
        "Please select at least one teacher to activate.",
      );
      return;
    }
    Alert.alert(
      "Activate Teachers",
      `Are you sure you want to activate ${selectedUsers.length} teacher(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const activationPromises = selectedUsers.map((userId) =>
                client.put(`/users/${userId}/activate`, { status: "active" }),
              );
              await Promise.all(activationPromises);
              fetchUsers();
              setSelectedUsers([]);
              Alert.alert(
                "Success",
                `${selectedUsers.length} teacher(s) activated successfully`,
              );
            } catch (error: any) {
              console.error("Error activating teachers:", error);
              Alert.alert(
                "Error",
                "Failed to activate teacher(s). Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "teacher":
        return "bg-emerald-500";
      case "student":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-red-50 text-red-600";
  };

  const getUserName = (user: User) =>
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown User";
  const getUserEmail = (user: User) => user.email || "No email";
  const getUserPhone = (user: User) => user.phone || "No phone";

  const UserCard = ({ user }: { user: User }) => {
    const isTeacher = user.role === "teacher";
    const canSelect = isTeacher;

    return (
      <TouchableOpacity
        className={`bg-white p-5 rounded-3xl mb-4 border-2 relative overflow-hidden ${
          selectedUsers.includes(user.id) && canSelect
            ? "border-emerald-500 bg-emerald-50"
            : "border-emerald-100"
        }`}
        onPress={() => canSelect && toggleUserSelection(user.id)}
        activeOpacity={canSelect ? 0.7 : 1}
        style={{
          shadowColor: selectedUsers.includes(user.id) ? "#10B981" : "#10B981",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-50 rounded-full opacity-70" />

        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1 flex-wrap gap-2">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-2">
                <Text className="text-emerald-600 font-bold text-base">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">
                {getUserName(user)}
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${getRoleColor(user.role || "student")}`}
              >
                <Text className="text-white text-xs font-semibold capitalize">
                  {user.role || "student"}
                </Text>
              </View>
              {isTeacher && (
                <View
                  className={`px-3 py-1 rounded-full ${getStatusColor(user.status)}`}
                >
                  <Text className="text-xs font-semibold capitalize">
                    {user.status}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-gray-500 text-sm ml-12">
              {getUserEmail(user)}
            </Text>
            <Text className="text-gray-400 text-sm ml-12">
              {getUserPhone(user)}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center border-t border-emerald-100 pt-3 ml-12">
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
              <Ionicons name="calendar-outline" size={9} color="#10B981" />
            </View>
            <Text className="text-gray-400 text-xs">
              Joined: {formatDate(user.created_at)}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="w-9 h-9 bg-emerald-100 rounded-full items-center justify-center"
              onPress={() => handleEditUser(user)}
            >
              <Ionicons name="create-outline" size={16} color="#10B981" />
            </TouchableOpacity>
            {isTeacher && user.status === "inactive" && (
              <TouchableOpacity
                className="w-9 h-9 bg-emerald-500 rounded-full items-center justify-center"
                onPress={() => {
                  setSelectedUsers([user.id]);
                  activateTeachers();
                }}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading users...
        </Text>
      </View>
    );
  }

  const displayUsers = filteredUsers;
  const inactiveTeachersCount = getInactiveTeachers().length;
  const selectedInactiveCount = selectedUsers.filter((id) =>
    users.find(
      (u) => u.id === id && u.role === "teacher" && u.status === "inactive",
    ),
  ).length;

  return (
    <View className="flex-1 bg-emerald-50">
      {/* Header */}
      <View
        className="w-full pt-16 pb-8 px-6 bg-emerald-500"
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
        <View className="absolute top-8 left-6 w-16 h-16 bg-emerald-400/30 rounded-full" />
        <View className="absolute top-20 right-10 w-24 h-24 bg-emerald-400/20 rounded-full" />
        <View className="absolute bottom-4 left-20 w-12 h-12 bg-emerald-300/40 rounded-full" />

        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white">
              Users Management
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white rounded-2xl px-5 py-3 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Ionicons name="person-add" size={20} color="#10B981" />
            <Text className="text-emerald-600 font-bold ml-2">Add User</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View
        className="bg-white mx-4 mt-6 rounded-2xl px-5 py-4"
        style={{
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center bg-emerald-50 rounded-2xl px-4 py-3 mb-3">
          <Ionicons name="search" size={20} color="#10B981" />
          <TextInput
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {["all", "student", "teacher"].map((role) => (
              <TouchableOpacity
                key={role}
                className={`px-5 py-2.5 rounded-full ${
                  selectedRole === role ? "bg-emerald-500" : "bg-emerald-50"
                }`}
                onPress={() => {
                  setSelectedRole(role);
                  setSelectedUsers([]);
                }}
              >
                <Text
                  className={`font-semibold ${
                    selectedRole === role ? "text-white" : "text-emerald-700"
                  }`}
                >
                  {role === "all"
                    ? "All Users"
                    : role.charAt(0).toUpperCase() + role.slice(1) + "s"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bulk Actions */}
      {selectedRole === "teacher" && inactiveTeachersCount > 0 && (
        <View className="bg-emerald-50 mx-4 mt-4 rounded-2xl px-5 py-4 border-2 border-emerald-200">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
                <Ionicons name="people-outline" size={16} color="#10B981" />
              </View>
              <Text className="text-emerald-800 font-semibold">
                {inactiveTeachersCount} inactive teacher(s)
                {selectedUsers.length > 0 &&
                  ` (${selectedUsers.length} selected)`}
              </Text>
            </View>
            {selectedUsers.length > 0 && (
              <TouchableOpacity
                className="px-5 py-2.5 bg-emerald-500 rounded-full flex-row items-center"
                onPress={activateTeachers}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text className="text-white text-sm font-semibold ml-1.5">
                  Activate
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Users List */}
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
          />
        }
      >
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="list-outline" size={12} color="#10B981" />
            </View>
            <Text className="text-gray-600 font-medium">
              Showing {displayUsers.length} user(s)
            </Text>
          </View>
          {selectedRole === "teacher" && inactiveTeachersCount > 0 && (
            <TouchableOpacity onPress={selectAllInactiveTeachers}>
              <Text className="text-emerald-600 font-semibold">
                {selectedInactiveCount === inactiveTeachersCount &&
                inactiveTeachersCount > 0
                  ? "Deselect All"
                  : "Select All Inactive"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {displayUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}

        {displayUsers.length === 0 && (
          <View className="items-center justify-center py-12">
            <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="people-outline" size={36} color="#10B981" />
            </View>
            <Text className="text-gray-800 text-lg font-bold">
              {users.length === 0 ? "No users found" : "No matching users"}
            </Text>
            <Text className="text-gray-500 text-center mt-2 text-sm">
              {users.length === 0
                ? "There are no users in the system"
                : "Try adjusting your search or filters"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
