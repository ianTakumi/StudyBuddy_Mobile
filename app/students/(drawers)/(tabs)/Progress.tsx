import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressChart } from "react-native-chart-kit";
import client from "@/utils/axiosInstance";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  date: string;
  time: string;
  duration: number;
  completed: boolean;
  pomodoro_sessions: number;
  user_id: string;
}

interface Goal {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface WeeklyStat {
  day: string;
  hours: number;
  completed: boolean;
  date: Date;
}

export default function Progress() {
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate weekly stats from sessions
  const calculateWeeklyStats = (sessions: StudySession[]) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Initialize days of the week
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const stats: WeeklyStat[] = daysOfWeek.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        day,
        hours: 0,
        completed: false,
        date,
      };
    });

    // Filter sessions for current week
    const weeklySessions = sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
    });

    // Calculate hours per day
    weeklySessions.forEach((session) => {
      const sessionDate = new Date(session.date);
      const dayIndex = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hours = session.duration / 60; // Convert duration from minutes to hours
      stats[dayIndex].hours += hours;
    });

    // Mark days as completed if they have study hours
    stats.forEach((stat) => {
      stat.completed = stat.hours > 0;
    });

    return stats;
  };

  // Calculate overall statistics
  const calculateOverallStats = (sessions: StudySession[]) => {
    const total = sessions.length;
    const completed = sessions.filter((s) => s.completed).length;
    const totalHoursValue = sessions.reduce(
      (sum, session) => sum + session.duration / 60,
      0,
    );

    setTotalSessions(total);
    setTotalHours(totalHoursValue);
    setCompletionRate(total > 0 ? (completed / total) * 100 : 0);
  };

  const fetchSessions = async () => {
    try {
      const response = await client.get(`/study-sessions/${user.id}`);

      if (response.data.success) {
        const sessionsData = response.data.data;
        setSessions(sessionsData);

        // Calculate stats based on fetched sessions
        const stats = calculateWeeklyStats(sessionsData);
        setWeeklyStats(stats);
        calculateOverallStats(sessionsData);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      // Fallback to sample data
      const fallbackSessions: StudySession[] = [
        {
          id: "1",
          subject: "Mathematics",
          topic: "Algebra Review",
          date: "2024-01-15",
          time: "09:00",
          duration: 25,
          completed: false,
          pomodoro_sessions: 4,
          user_id: user.id,
        },
        {
          id: "2",
          subject: "Science",
          topic: "Biology Lab",
          date: "2024-01-15",
          time: "14:00",
          duration: 25,
          completed: true,
          pomodoro_sessions: 3,
          user_id: user.id,
        },
      ];
      setSessions(fallbackSessions);
      const stats = calculateWeeklyStats(fallbackSessions);
      setWeeklyStats(stats);
      calculateOverallStats(fallbackSessions);
    }
  };

  const fetchGoals = async () => {
    try {
      setLoadingGoals(true);
      const response = await client.get(`/goals/${user.id}`);
      if (response.data.success) {
        setGoals(response.data.goals);
      }
    } catch (error) {
      console.error("Fetch goals error:", error);
    } finally {
      setLoadingGoals(false);
    }
  };

  // Combined refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch both sessions and goals simultaneously
      await Promise.all([fetchSessions(), fetchGoals()]);
    } catch (error) {
      console.error("Refresh error:", error);
      Alert.alert(
        "Refresh Failed",
        "Unable to refresh data. Please try again.",
      );
    } finally {
      setRefreshing(false);
    }
  }, [user.id]);

  // Toggle goal completion
  const toggleGoalCompletion = async (
    goalId: string,
    currentStatus: boolean,
  ) => {
    try {
      if (currentStatus === true) {
        return;
      }

      const response = await client.patch(`/goals/${goalId}/toggle`, {
        completed: !currentStatus,
      });

      if (response.data.success) {
        // Update local state
        setGoals(
          goals.map((goal) =>
            goal.id === goalId ? { ...goal, completed: !currentStatus } : goal,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      Alert.alert("Error", "Failed to update goal status");
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchGoals();
  }, [user.id]);

  // Calculate total weekly hours
  const totalWeeklyHours = weeklyStats.reduce((sum, day) => sum + day.hours, 0);

  // Calculate goal (e.g., 20 hours per week)
  const weeklyGoal = 20;
  const progressPercentage = (totalWeeklyHours / weeklyGoal) * 100;

  // Get subject distribution for statistics
  const subjectStats = sessions.reduce((acc: any, session) => {
    if (!acc[session.subject]) {
      acc[session.subject] = {
        count: 0,
        totalDuration: 0,
        completed: 0,
      };
    }
    acc[session.subject].count++;
    acc[session.subject].totalDuration += session.duration;
    if (session.completed) {
      acc[session.subject].completed++;
    }
    return acc;
  }, {});

  const topSubject =
    Object.keys(subjectStats).length > 0
      ? Object.keys(subjectStats).reduce((a, b) =>
          subjectStats[a].totalDuration > subjectStats[b].totalDuration ? a : b,
        )
      : "None";

  // Calculate goal statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const goalCompletionRate =
    totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Study Progress</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]} // Android
            tintColor="#2563eb" // iOS
            title="Pull to refresh..." // iOS
            titleColor="#6b7280" // iOS
          />
        }
      >
        {/* Weekly Study Hours */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              This Week's Study Hours
            </Text>
            <View className="flex-row justify-between items-end h-32">
              {weeklyStats.map((day, index) => (
                <View key={index} className="items-center flex-1">
                  <View
                    className={`w-8 rounded-t-lg ${
                      day.completed ? "bg-blue-500" : "bg-gray-200"
                    }`}
                    style={{ height: Math.min(day.hours * 8, 64) }} // Max height 64 (8 hours)
                  />
                  <Text className="text-gray-600 text-xs mt-2">{day.day}</Text>
                  <Text className="text-gray-900 text-xs font-medium">
                    {day.hours.toFixed(1)}h
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-gray-600">
                Total: {totalWeeklyHours.toFixed(1)}/{weeklyGoal} hours
              </Text>
            </View>
          </View>
        </View>

        {/* Study Stats */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Study Statistics
            </Text>
            <View className="flex-row justify-between mb-4">
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-500">
                  {totalSessions}
                </Text>
                <Text className="text-gray-600 text-sm">Sessions</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-500">
                  {totalHours.toFixed(1)}
                </Text>
                <Text className="text-gray-600 text-sm">Total Hours</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-500">
                  {Object.keys(subjectStats).length}
                </Text>
                <Text className="text-gray-600 text-sm">Subjects</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-orange-500">
                  {completionRate.toFixed(0)}%
                </Text>
                <Text className="text-gray-600 text-sm">Completion</Text>
              </View>
            </View>
            {topSubject !== "None" && (
              <View className="mt-2 pt-3 border-t border-gray-100">
                <Text className="text-gray-600 text-sm text-center">
                  Most studied:{" "}
                  <Text className="font-semibold text-blue-600">
                    {topSubject}
                  </Text>
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Study Goals - Integrated from CRUD */}
        {/* Study Goals - Integrated from CRUD */}
        <View className="mx-4 mb-8">
          <View className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Study Goals
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/students/StudyGoals")}
                className="bg-blue-100 px-3 py-1 rounded-lg flex-row items-center"
              >
                <Ionicons name="add-circle-outline" size={16} color="#2563eb" />
                <Text className="text-blue-600 text-sm ml-1">Manage</Text>
              </TouchableOpacity>
            </View>

            {loadingGoals && !refreshing ? (
              <View className="items-center py-8">
                <Text className="text-gray-500">Loading goals...</Text>
              </View>
            ) : goals.length === 0 ? (
              <TouchableOpacity
                onPress={() => router.push("/students/StudyGoals")}
                className="items-center py-8"
              >
                <Ionicons name="flag-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 text-center mt-3">
                  No goals set yet
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Tap here to add your first study goal!
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                {/* REPLACE FROM HERE */}
                {/* Show all goals with completed ones at the bottom */}
                {[...goals]
                  .sort((a, b) => {
                    // Sort: incomplete first, then completed
                    if (a.completed === b.completed) return 0;
                    return a.completed ? 1 : -1;
                  })
                  .slice(0, 5) // Show up to 5 goals total
                  .map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      onPress={() =>
                        toggleGoalCompletion(goal.id, goal.completed)
                      }
                      className="flex-row items-center mb-4 last:mb-0"
                      activeOpacity={0.7}
                    >
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                          goal.completed ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        <Ionicons
                          name={goal.completed ? "trophy" : "trophy-outline"}
                          size={24}
                          color={goal.completed ? "#10B981" : "#9CA3AF"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-semibold ${
                            goal.completed
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {goal.title}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-0.5">
                          {goal.completed ? "Completed: " : "Created: "}
                          {new Date(
                            goal.completed ? goal.updated_at : goal.created_at,
                          ).toLocaleDateString()}
                        </Text>
                      </View>
                      {goal.completed ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10B981"
                        />
                      ) : (
                        <View className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </TouchableOpacity>
                  ))}

                {/* Show more button if there are more than 5 goals */}
                {goals.length > 5 && (
                  <TouchableOpacity
                    onPress={() => router.push("/students/StudyGoals")}
                    className="flex-row items-center justify-center mt-3 py-2 border-t border-gray-100"
                  >
                    <Text className="text-blue-600 text-sm">
                      + {goals.length - 5} more goals
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#2563eb"
                    />
                  </TouchableOpacity>
                )}
                {/* REPLACE TO HERE */}

                {/* Goal Progress Summary */}
                {totalGoals > 0 && (
                  <View className="mt-4 pt-4 border-t border-gray-100">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-gray-600">
                        Overall Progress
                      </Text>
                      <Text className="text-sm font-semibold text-blue-600">
                        {completedGoals}/{totalGoals} Completed
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${goalCompletionRate}%` }}
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
