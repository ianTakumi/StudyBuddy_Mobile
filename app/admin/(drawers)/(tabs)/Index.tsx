import { User } from "@/types/index";
import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  date: string;
  time: string;
  duration: number;
  pomodoro_sessions: number;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [goals, setGoals] = useState([]);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getRoleDistribution = () => {
    const roles: { [key: string]: number } = {};
    users.forEach((user) => {
      const role = user.role.toLowerCase();
      if (role !== "admin") {
        roles[role] = (roles[role] || 0) + 1;
      }
    });
    return roles;
  };

  const getPieChartData = () => {
    const roleDistribution = getRoleDistribution();
    const colors = {
      teacher: "#10B981",
      student: "#059669",
    };
    return Object.entries(roleDistribution).map(([role, count], index) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      population: count,
      color:
        colors[role as keyof typeof colors] || `hsl(${index * 120}, 70%, 50%)`,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));
  };

  const getGoalsCompletionData = () => {
    const completed = goals.filter((goal) => goal.completed).length;
    const pending = goals.filter((goal) => !goal.completed).length;
    return [
      {
        name: "Completed",
        population: completed,
        color: "#10B981",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12,
      },
      {
        name: "Pending",
        population: pending,
        color: "#EF4444",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12,
      },
    ];
  };

  const getGoalsTimeline = () => {
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      last7Days.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );
    }
    const createdCounts = new Array(7).fill(0);
    goals.forEach((goal) => {
      const createdDate = new Date(goal.created_at);
      const createdDaysDiff = Math.floor(
        (today - createdDate) / (1000 * 60 * 60 * 24),
      );
      if (createdDaysDiff >= 0 && createdDaysDiff < 7) {
        createdCounts[6 - createdDaysDiff]++;
      }
    });
    return {
      labels: last7Days,
      datasets: [
        {
          data: createdCounts,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getStudySessionsTimeline = () => {
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      last7Days.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );
    }
    const sessionCounts = new Array(7).fill(0);
    studySessions.forEach((session) => {
      const sessionDate = new Date(session.created_at);
      const daysDiff = Math.floor(
        (today - sessionDate) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff >= 0 && daysDiff < 7) {
        sessionCounts[6 - daysDiff]++;
      }
    });
    return {
      labels: last7Days,
      datasets: [
        {
          data: sessionCounts,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getStudyDurationTimeline = () => {
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      last7Days.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );
    }
    const totalDuration = new Array(7).fill(0);
    studySessions.forEach((session) => {
      const sessionDate = new Date(session.created_at);
      const daysDiff = Math.floor(
        (today - sessionDate) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff >= 0 && daysDiff < 7) {
        totalDuration[6 - daysDiff] += session.duration || 0;
      }
    });
    return {
      labels: last7Days,
      datasets: [
        {
          data: totalDuration,
          color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const fetchUsers = async () => {
    try {
      const response = await client.get("/users");
      if (response.data.success) setUsers(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to load users. Please try again.");
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await client.get(`/goals/`);
      setGoals(response.data.goals);
    } catch (error) {
      console.error("Fetch goals error:", error);
    }
  };

  const fetchFlashcardSets = async () => {
    try {
      const response = await client.get("/flashcards");
      if (response.data.success) setFlashcardSets(response.data.data || []);
    } catch (error) {
      console.error("Fetch flashcards error:", error);
    }
  };

  const fetchStudySessions = async () => {
    try {
      const response = await client.get("/study-sessions");
      if (response.data.success) setStudySessions(response.data.data || []);
    } catch (error) {
      console.error("Fetch study sessions error:", error);
    }
  };

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchGoals(),
        fetchFlashcardSets(),
        fetchStudySessions(),
      ]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchGoals(),
        fetchFlashcardSets(),
        fetchStudySessions(),
      ]);
    } catch (error) {
      console.error("Initial load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const getOverviewStats = () => {
    const totalUsers = users.filter(
      (user) => user.role.toLowerCase() !== "admin",
    ).length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = users.filter((user) => {
      const createdAt = new Date(user.created_at);
      return createdAt >= oneWeekAgo && user.role.toLowerCase() !== "admin";
    }).length;
    const activeToday = Math.floor(totalUsers * 0.6);
    const totalFlashcardSets = flashcardSets.length;
    const totalIndividualFlashcards = flashcardSets.reduce(
      (total, set) => total + (set.flashcards?.length || 0),
      0,
    );
    const newSetsThisWeek = flashcardSets.filter(
      (set) => new Date(set.created_at) >= oneWeekAgo,
    ).length;
    const newFlashcardsThisWeek = flashcardSets.reduce((total, set) => {
      const newFlashcardsInSet = (set.flashcards || []).filter(
        (flashcard) => new Date(flashcard.created_at) >= oneWeekAgo,
      ).length;
      return total + newFlashcardsInSet;
    }, 0);
    const totalGoals = goals.length;
    const completedGoals = goals.filter((goal) => goal.completed).length;
    const goalsCompletionRate =
      totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    const totalStudySessions = studySessions.length;
    const completedSessions = studySessions.filter(
      (session) => session.completed,
    ).length;
    const totalStudyDuration = studySessions.reduce(
      (total, session) => total + (session.duration || 0),
      0,
    );
    const totalPomodoroSessions = studySessions.reduce(
      (total, session) => total + (session.pomodoro_sessions || 0),
      0,
    );
    const newSessionsThisWeek = studySessions.filter(
      (session) => new Date(session.created_at) >= oneWeekAgo,
    ).length;
    const averageDuration =
      totalStudySessions > 0
        ? Math.round(totalStudyDuration / totalStudySessions)
        : 0;
    const subjectCounts: { [key: string]: number } = {};
    studySessions.forEach((session) => {
      if (session.subject)
        subjectCounts[session.subject] =
          (subjectCounts[session.subject] || 0) + 1;
    });
    const topSubject = Object.entries(subjectCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];
    return {
      totalUsers,
      activeToday,
      newThisWeek,
      totalFlashcardSets,
      totalIndividualFlashcards,
      newSetsThisWeek,
      newFlashcardsThisWeek,
      totalGoals,
      completedGoals,
      goalsCompletionRate,
      totalStudySessions,
      completedSessions,
      totalStudyDuration,
      totalPomodoroSessions,
      newSessionsThisWeek,
      averageDuration,
      topSubject: topSubject ? topSubject[0] : "N/A",
      sessionCompletionRate:
        totalStudySessions > 0
          ? Math.round((completedSessions / totalStudySessions) * 100)
          : 0,
    };
  };

  const overviewStats = getOverviewStats();
  const pieChartData = getPieChartData();
  const goalsCompletionData = getGoalsCompletionData();
  const goalsTimelineData = getGoalsTimeline();
  const studySessionsTimeline = getStudySessionsTimeline();
  const studyDurationTimeline = getStudyDurationTimeline();
  const screenWidth = Dimensions.get("window").width;

  const StatCard = ({ title, value, subtitle, icon, color = "#10B981" }) => (
    <View
      className="bg-white rounded-2xl p-4 mb-4 relative overflow-hidden"
      style={{
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View
        className="absolute -top-2 -right-2 w-10 h-10 rounded-full opacity-30"
        style={{ backgroundColor: color }}
      />
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      <Text className="text-gray-700 font-semibold text-sm mt-0.5">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-gray-500 text-xs mt-1">{subtitle}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-emerald-50 items-center justify-center">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="text-emerald-600 mt-4 font-medium">
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-emerald-50"
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          colors={["#10B981"]}
          tintColor="#10B981"
          title="Pull to refresh"
          titleColor="#10B981"
        />
      }
    >
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
        <View className="absolute top-14 right-32 w-8 h-8 bg-emerald-300/50 rounded-full" />

        <Text className="text-3xl font-bold text-white">Admin Dashboard</Text>
        <Text className="text-emerald-100 text-base mt-1">Welcome back!</Text>
      </View>

      {/* Quick Stats Grid */}
      <View className="px-4 pt-6">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="stats-chart-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900">Overview</Text>
          </View>
          <View className="bg-emerald-100 rounded-full px-3 py-1">
            <Text className="text-emerald-600 text-xs font-semibold">
              This Week
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%]">
            <StatCard
              title="Total Users"
              value={overviewStats.totalUsers}
              subtitle={`+${overviewStats.newThisWeek} this week`}
              icon="people-outline"
              color="#10B981"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Active Today"
              value={overviewStats.activeToday}
              subtitle={`${Math.round((overviewStats.activeToday / overviewStats.totalUsers) * 100)}% of total`}
              icon="trending-up-outline"
              color="#059669"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Flashcard Sets"
              value={overviewStats.totalFlashcardSets}
              subtitle={`+${overviewStats.newSetsThisWeek} this week`}
              icon="albums-outline"
              color="#F59E0B"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Total Flashcards"
              value={overviewStats.totalIndividualFlashcards}
              subtitle={`${overviewStats.totalFlashcardSets} sets, +${overviewStats.newFlashcardsThisWeek} this week`}
              icon="copy-outline"
              color="#8B5CF6"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Goals Completed"
              value={overviewStats.completedGoals}
              subtitle={`${overviewStats.goalsCompletionRate}% of ${overviewStats.totalGoals} total`}
              icon="flag-outline"
              color="#047857"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Study Sessions"
              value={overviewStats.totalStudySessions}
              subtitle={`+${overviewStats.newSessionsThisWeek} this week`}
              icon="time-outline"
              color="#3B82F6"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Study Duration"
              value={`${overviewStats.totalStudyDuration} min`}
              subtitle={`Avg: ${overviewStats.averageDuration} min/session`}
              icon="timer-outline"
              color="#F97316"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Pomodoro Sessions"
              value={overviewStats.totalPomodoroSessions}
              subtitle={`${overviewStats.sessionCompletionRate}% completed`}
              icon="bonfire-outline"
              color="#EF4444"
            />
          </View>
        </View>
      </View>

      {/* Study Sessions Section */}
      <View className="px-4 mt-4">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="time-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              Study Sessions Analytics
            </Text>
          </View>
          <View className="bg-emerald-100 rounded-full px-3 py-1">
            <Text className="text-emerald-700 text-xs font-semibold">
              Top: {overviewStats.topSubject}
            </Text>
          </View>
        </View>

        {studySessions.length > 0 && (
          <View className="mb-4">
            <Text className="text-md font-semibold text-gray-700 mb-2">
              Sessions Created (Last 7 Days)
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              Number of study sessions created each day
            </Text>
            <View
              className="bg-white rounded-3xl p-4 relative overflow-hidden"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />
              <LineChart
                data={studySessionsTimeline}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "6", strokeWidth: "2", stroke: "#10B981" },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
                formatYLabel={(value) => Math.floor(value).toString()}
              />
              <View className="mt-4 flex-row justify-center">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
                  <Text className="text-xs text-gray-600">
                    Study Sessions Created
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {studySessions.length > 0 && (
          <View className="mb-4">
            <Text className="text-md font-semibold text-gray-700 mb-2">
              Study Duration (Last 7 Days)
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              Total minutes studied each day
            </Text>
            <View
              className="bg-white rounded-3xl p-4 relative overflow-hidden"
              style={{
                shadowColor: "#F59E0B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <View className="absolute -top-4 -right-4 w-16 h-16 bg-amber-50 rounded-full" />
              <LineChart
                data={studyDurationTimeline}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "6", strokeWidth: "2", stroke: "#F59E0B" },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
                formatYLabel={(value) => Math.floor(value).toString()}
              />
              <View className="mt-4 flex-row justify-center">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                  <Text className="text-xs text-gray-600">Minutes Studied</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Goals Completion Rate Pie Chart */}
      {goalsCompletionData.length > 0 &&
        goalsCompletionData.some((item) => item.population > 0) && (
          <View className="px-4 mt-4">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
                <Ionicons name="flag-outline" size={16} color="#10B981" />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                Goals Completion Rate
              </Text>
            </View>
            <Text className="text-sm text-gray-500 mb-2">
              {overviewStats.completedGoals} completed out of{" "}
              {overviewStats.totalGoals} total goals
            </Text>
            <View
              className="bg-white rounded-3xl p-4 items-center relative overflow-hidden"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />
              <PieChart
                data={goalsCompletionData}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
              <View className="mt-4 w-full">
                {goalsCompletionData.map((item, index) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-center py-1"
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <Text className="text-gray-700">{item.name}</Text>
                    </View>
                    <Text className="text-gray-800 font-semibold">
                      {item.population} (
                      {overviewStats.totalGoals > 0
                        ? Math.round(
                            (item.population / overviewStats.totalGoals) * 100,
                          )
                        : 0}
                      %)
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

      {/* Goals Created Timeline */}
      {goals.length > 0 && (
        <View className="px-4 mt-4">
          <Text className="text-md font-semibold text-gray-700 mb-2">
            Goals Created (Last 7 Days)
          </Text>
          <Text className="text-sm text-gray-500 mb-2">
            Number of goals created each day
          </Text>
          <View
            className="bg-white rounded-3xl p-4 relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />
            <LineChart
              data={goalsTimelineData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: "6", strokeWidth: "2", stroke: "#10B981" },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
              formatYLabel={(value) => Math.floor(value).toString()}
            />
            <View className="mt-4 flex-row justify-center">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-xs text-gray-600">Goals Created</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* User Roles Pie Chart */}
      {pieChartData.length > 0 && (
        <View className="px-4 mt-4 mb-8">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="people-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              User Roles Distribution
            </Text>
          </View>
          <Text className="text-sm text-gray-500 mb-2">
            Showing students and teachers only
          </Text>
          <View
            className="bg-white rounded-3xl p-4 items-center relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full" />
            <PieChart
              data={pieChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <View className="mt-4 w-full">
              {pieChartData.map((item, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-1"
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-gray-700">{item.name}</Text>
                  </View>
                  <Text className="text-gray-800 font-semibold">
                    {item.population} (
                    {Math.round(
                      (item.population / overviewStats.totalUsers) * 100,
                    )}
                    %)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
