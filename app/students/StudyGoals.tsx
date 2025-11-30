import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

export default function StudyGoals() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch goals from API
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/goals/${user.id}`);
      setGoals(response.data.goals);
    } catch (error) {
      console.error("Fetch goals error:", error);
      Alert.alert("Error", "Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchGoals();
    }
  }, [user?.id]);

  const addGoal = async () => {
    if (!newGoal.trim()) {
      Alert.alert("Error", "Please enter a goal");
      return;
    }

    try {
      const response = await client.post(`/goals/${user.id}`, {
        title: newGoal,
      });

      setGoals([response.data.goal, ...goals]);
      setNewGoal("");
    } catch (error) {
      console.error("Add goal error:", error);
      Alert.alert("Error", "Failed to add goal");
    }
  };

  const toggleGoal = async (goalId) => {
    try {
      const response = await client.patch(`/goals/${goalId}/toggle`);
      setGoals(
        goals.map((goal) => (goal.id === goalId ? response.data.goal : goal))
      );
    } catch (error) {
      console.error("Toggle goal error:", error);
      Alert.alert("Error", "Failed to update goal");
    }
  };

  const deleteGoal = async (goalId) => {
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await client.delete(`/goals/${goalId}`);
            setGoals(goals.filter((goal) => goal.id !== goalId));
          } catch (error) {
            console.error("Delete goal error:", error);
            Alert.alert("Error", "Failed to delete goal");
          }
        },
      },
    ]);
  };

  const completedGoals = goals.filter((goal) => goal.completed);
  const activeGoals = goals.filter((goal) => !goal.completed);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 border-b border-blue-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-blue-100 rounded-lg"
        >
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-blue-800">
            Study Goals
          </Text>
        </View>

        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Add Goal Input */}
        <View className="flex-row items-center my-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 mr-2"
            placeholder="Add a new study goal..."
            value={newGoal}
            onChangeText={setNewGoal}
            onSubmitEditing={addGoal}
          />
          <TouchableOpacity
            onPress={addGoal}
            className="bg-blue-600 rounded-lg px-4 py-3"
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text className="text-gray-500 text-center py-4">
            Loading goals...
          </Text>
        ) : (
          <>
            {/* Active Goals */}
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Active Goals ({activeGoals.length})
            </Text>

            {activeGoals.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">
                No active goals. Add one above!
              </Text>
            ) : (
              activeGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 mb-2 flex-row items-center"
                  onPress={() => toggleGoal(goal.id)}
                >
                  <View className="w-6 h-6 border-2 border-blue-500 rounded-full mr-3" />
                  <Text className="flex-1 text-gray-800">{goal.title}</Text>
                  <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}

            {/* Completed Goals */}
            <Text className="text-lg font-semibold text-gray-800 mb-2 mt-6">
              Completed Goals ({completedGoals.length})
            </Text>

            {completedGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 flex-row items-center"
                onPress={() => toggleGoal(goal.id)}
              >
                <View className="w-6 h-6 bg-green-500 rounded-full mr-3 items-center justify-center">
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
                <Text className="flex-1 text-gray-500 line-through">
                  {goal.title}
                </Text>
                <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
