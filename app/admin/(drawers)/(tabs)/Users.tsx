// app/Users.tsx - Users Management Screen
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import client from "@/utils/axiosInstance";

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

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await client.get("/users");

      if (response.data.success) {
        // Filter out admin users
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

  // Safe filter function with null checks
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

  // Get only inactive teachers for selection when role is teacher
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

    // If all inactive teachers are already selected, deselect them
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
              // Activate each selected teacher
              const activationPromises = selectedUsers.map((userId) =>
                client.put(`/users/${userId}/activate`, { status: "active" }),
              );

              await Promise.all(activationPromises);

              // Refresh the users list after activation
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
        return "bg-blue-500";
      case "student":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getUserName = (user: User) => {
    return (
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      "Unknown User"
    );
  };

  const getUserEmail = (user: User) => {
    return user.email || "No email";
  };

  const getUserPhone = (user: User) => {
    return user.phone || "No phone";
  };

  const UserCard = ({ user }: { user: User }) => {
    const isTeacher = user.role === "teacher";
    const isInactiveTeacher = isTeacher && user.status === "inactive";
    const canSelect = isTeacher; // Only teachers can be selected

    return (
      <TouchableOpacity
        className={`bg-white p-4 rounded-lg mb-3 border-2 ${
          selectedUsers.includes(user.id) && canSelect
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200"
        }`}
        onPress={() => canSelect && toggleUserSelection(user.id)}
        activeOpacity={canSelect ? 0.7 : 1}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1 flex-wrap gap-2">
              <Text className="text-lg font-semibold text-gray-900">
                {getUserName(user)}
              </Text>
              <View
                className={`px-2 py-1 rounded-full ${getRoleColor(user.role || "student")}`}
              >
                <Text className="text-white text-xs font-medium capitalize">
                  {user.role || "student"}
                </Text>
              </View>
              {isTeacher && (
                <View
                  className={`px-2 py-1 rounded-full ${getStatusColor(user.status)}`}
                >
                  <Text className={`text-xs font-medium capitalize`}>
                    {user.status}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-gray-600 text-sm">{getUserEmail(user)}</Text>
            <Text className="text-gray-500 text-sm">{getUserPhone(user)}</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
          <Text className="text-gray-500 text-xs">
            Joined: {formatDate(user.created_at)}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="p-2 bg-gray-100 rounded-lg"
              onPress={() => handleEditUser(user)}
            >
              <Ionicons name="create-outline" size={16} color="#4B5563" />
            </TouchableOpacity>
            {isTeacher && user.status === "inactive" && (
              <TouchableOpacity
                className="p-2 bg-green-100 rounded-lg"
                onPress={() => {
                  setSelectedUsers([user.id]);
                  activateTeachers();
                }}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color="#10B981"
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
      <View className="flex-1 bg-gray-50 pt-14 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading users...</Text>
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
    <View className="flex-1 bg-gray-50 pt-14">
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">
            Users Management
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
            onPress={() => {
              /* Navigate to add user */
            }}
          >
            <Ionicons name="person-add" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Add User</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View className="bg-white px-4 py-3 shadow-sm">
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-gray-100 rounded-lg px-3 py-2 flex-row items-center">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-gray-800"
              placeholderTextColor={"#9CA3AF"}
            />
          </View>
        </View>

        <View className="flex-row justify-between">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1"
          >
            <View className="flex-row gap-2">
              {["all", "student", "teacher"].map((role) => (
                <TouchableOpacity
                  key={role}
                  className={`px-4 py-2 rounded-full ${
                    selectedRole === role ? "bg-blue-500" : "bg-gray-200"
                  }`}
                  onPress={() => {
                    setSelectedRole(role);
                    // Clear selections when changing filters
                    setSelectedUsers([]);
                  }}
                >
                  <Text
                    className={`font-medium ${
                      selectedRole === role ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {role === "all"
                      ? "All Users"
                      : role.charAt(0).toUpperCase() + role.slice(1)}
                    {role !== "all" ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Bulk Actions - Only show when teachers filter is selected and there are inactive teachers */}
      {selectedRole === "teacher" && inactiveTeachersCount > 0 && (
        <View className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-blue-800 font-medium">
              {inactiveTeachersCount} inactive teacher(s) available
              {selectedUsers.length > 0 &&
                ` (${selectedUsers.length} selected)`}
            </Text>
            <View className="flex-row gap-2">
              {selectedUsers.length > 0 && (
                <TouchableOpacity
                  className="px-3 py-1 bg-green-500 rounded-lg flex-row items-center"
                  onPress={activateTeachers}
                >
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                  <Text className="text-white text-sm ml-1">Activate</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Users List */}
      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-600">
            Showing {displayUsers.length} user(s)
          </Text>
          {/* Only show Select All when viewing teachers and there are inactive teachers */}
          {selectedRole === "teacher" && inactiveTeachersCount > 0 && (
            <TouchableOpacity onPress={selectAllInactiveTeachers}>
              <Text className="text-blue-500 font-medium">
                {selectedInactiveCount === inactiveTeachersCount &&
                inactiveTeachersCount > 0
                  ? "Deselect All"
                  : "Select All Inactive Teachers"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {displayUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}

        {displayUsers.length === 0 && (
          <View className="items-center justify-center py-12">
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4">
              {users.length === 0 ? "No users found" : "No matching users"}
            </Text>
            <Text className="text-gray-400 text-center mt-2">
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
