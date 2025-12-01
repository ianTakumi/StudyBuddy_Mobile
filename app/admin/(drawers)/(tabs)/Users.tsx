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
import client from "@/utils/axiosInstance";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  joinDate: string;
  lastActive: string;
  flashcardsCreated: number;
  studySessions: number;
}

export default function UsersScreen() {
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
        setUsers(response.data.data || []);
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
      (user.firstName?.toLowerCase() || "").includes(searchLower) ||
      (user.lastName?.toLowerCase() || "").includes(searchLower) ||
      (user.email?.toLowerCase() || "").includes(searchLower);

    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (filteredUsers.length === 0) return;

    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map((user) => user.id).filter(Boolean)
    );
  };

  const handleUserAction = async (action: string, userId?: string) => {
    const usersToAction = userId ? [userId] : selectedUsers;

    if (usersToAction.length === 0) {
      Alert.alert("No users selected", "Please select at least one user.");
      return;
    }

    Alert.alert(
      `${action} Users`,
      `Are you sure you want to ${action.toLowerCase()} ${usersToAction.length} user(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            try {
              // Handle different actions
              switch (action.toLowerCase()) {
                case "activate":
                  // await client.patch(`/users/${userId}/activate`);
                  break;
                case "suspend":
                  // await client.patch(`/users/${userId}/suspend`);
                  break;
                case "delete":
                  // await client.delete(`/users/${userId}`);
                  break;
                case "edit":
                  // Navigate to edit screen or show modal
                  break;
                default:
                  break;
              }

              // Refresh the users list after action
              fetchUsers();
              setSelectedUsers([]);

              Alert.alert(
                "Success",
                `User(s) ${action.toLowerCase()}ed successfully`
              );
            } catch (error: any) {
              Alert.alert("Error", `Failed to ${action.toLowerCase()} user(s)`);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      case "suspended":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500";
      case "teacher":
        return "bg-blue-500";
      case "student":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Safe user data accessor functions
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

  const UserCard = ({ user }: { user: User }) => (
    <TouchableOpacity
      className={`bg-white p-4 rounded-lg mb-3 border-2 ${
        selectedUsers.includes(user.id)
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200"
      }`}
      onPress={() => toggleUserSelection(user.id)}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-semibold text-gray-900">
              {getUserName(user)}
            </Text>
            <View
              className={`ml-2 px-2 py-1 rounded-full ${getRoleColor(user.role || "student")}`}
            >
              <Text className="text-white text-xs font-medium capitalize">
                {user.role || "student"}
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm">{getUserEmail(user)}</Text>
          <Text className="text-gray-500 text-sm">{getUserPhone(user)}</Text>
        </View>

        <View className="items-end">
          <View
            className={`w-3 h-3 rounded-full ${getStatusColor(user.status || "inactive")} mb-1`}
          />
          <Text className="text-gray-500 text-xs capitalize">
            {user.status || "inactive"}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
        <View className="flex-row space-x-4">
          <View className="items-center">
            <Ionicons name="copy-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 text-xs mt-1">
              {user.flashcardsCreated || 0}
            </Text>
          </View>
          <View className="items-center">
            <Ionicons name="school-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 text-xs mt-1">
              {user.studySessions || 0}
            </Text>
          </View>
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="p-2 bg-gray-100 rounded-lg"
            onPress={() => handleUserAction("Edit", user.id)}
          >
            <Ionicons name="create-outline" size={16} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-gray-100 rounded-lg"
            onPress={() =>
              handleUserAction(
                user.status === "suspended" ? "Activate" : "Suspend",
                user.id
              )
            }
          >
            <Ionicons
              name={
                user.status === "suspended"
                  ? "checkmark-circle-outline"
                  : "pause-circle-outline"
              }
              size={16}
              color={user.status === "suspended" ? "#10B981" : "#EF4444"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between mt-2">
        <Text className="text-gray-500 text-xs">
          Joined: {user.joinDate || "Unknown"}
        </Text>
        <Text className="text-gray-500 text-xs">
          Last active: {user.lastActive || "Unknown"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50 pt-14 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading users...</Text>
      </View>
    );
  }

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
        <View className="flex-row space-x-3 mb-3">
          <View className="flex-1 bg-gray-100 rounded-lg px-3 py-2 flex-row items-center">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-gray-800"
            />
          </View>
          <TouchableOpacity
            className="bg-gray-100 rounded-lg px-3 py-2 items-center justify-center"
            onPress={fetchUsers}
          >
            <Ionicons name="refresh" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1"
          >
            <View className="flex-row space-x-2">
              {["all", "student", "teacher", "admin"].map((role) => (
                <TouchableOpacity
                  key={role}
                  className={`px-4 py-2 rounded-full ${
                    selectedRole === role ? "bg-blue-500" : "bg-gray-200"
                  }`}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text
                    className={`font-medium ${
                      selectedRole === role ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {role === "all"
                      ? "All User"
                      : role.charAt(0).toUpperCase() + role.slice(1)}
                    s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <View className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-blue-800 font-medium">
              {selectedUsers.length} user(s) selected
            </Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="px-3 py-1 bg-green-500 rounded-lg flex-row items-center"
                onPress={() => handleUserAction("Activate")}
              >
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text className="text-white text-sm ml-1">Activate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-3 py-1 bg-red-500 rounded-lg flex-row items-center"
                onPress={() => handleUserAction("Suspend")}
              >
                <Ionicons name="pause-circle" size={16} color="white" />
                <Text className="text-white text-sm ml-1">Suspend</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-3 py-1 bg-gray-500 rounded-lg flex-row items-center"
                onPress={() => handleUserAction("Delete")}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text className="text-white text-sm ml-1">Delete</Text>
              </TouchableOpacity>
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
            Showing {filteredUsers.length} user(s)
          </Text>
          {filteredUsers.length > 0 && (
            <TouchableOpacity onPress={selectAllUsers}>
              <Text className="text-blue-500 font-medium">
                {selectedUsers.length === filteredUsers.length
                  ? "Deselect All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}

        {filteredUsers.length === 0 && (
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
