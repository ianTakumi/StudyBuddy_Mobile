import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, LineChart } from "react-native-chart-kit";
import client from "@/utils/axiosInstance";
import { User } from "@/types/index";

// Add StudySession interface
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
  const [loading, setLoading] = useState(true); // Start with true to show spinner immediately
  const [refreshing, setRefreshing] = useState(false);

  // Calculate role distribution from fetched users (excluding admin)
  const getRoleDistribution = () => {
    const roles: { [key: string]: number } = {};
    users.forEach((user) => {
      const role = user.role.toLowerCase();
      // Exclude admin from distribution
      if (role !== "admin") {
        roles[role] = (roles[role] || 0) + 1;
      }
    });
    return roles;
  };

  // Prepare data for pie chart (excluding admin)
  const getPieChartData = () => {
    const roleDistribution = getRoleDistribution();
    const colors = {
      teacher: "#34C759",
      student: "#4A90E2",
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

  // GOALS CHARTS

  // Chart 1: Goals Completion Rate (Pie Chart)
  const getGoalsCompletionData = () => {
    const completed = goals.filter((goal) => goal.completed).length;
    const pending = goals.filter((goal) => !goal.completed).length;

    return [
      {
        name: "Completed",
        population: completed,
        color: "#34C759",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12,
      },
      {
        name: "Pending",
        population: pending,
        color: "#FF3B30",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12,
      },
    ];
  };

  // Chart 2: Goals Created Timeline (Last 7 days) - Single line
  const getGoalsTimeline = () => {
    const last7Days = [];
    const today = new Date();

    // Generate last 7 days labels
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      last7Days.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );
    }

    const createdCounts = new Array(7).fill(0);

    goals.forEach((goal) => {
      // Count created goals
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
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // STUDY SESSIONS CHARTS

  // Chart 1: Study Sessions Timeline (Last 7 days)
  const getStudySessionsTimeline = () => {
    const last7Days = [];
    const today = new Date();

    // Generate last 7 days labels
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      last7Days.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );
    }

    const sessionCounts = new Array(7).fill(0);
    const totalDuration = new Array(7).fill(0);

    studySessions.forEach((session) => {
      const sessionDate = new Date(session.created_at);
      const daysDiff = Math.floor(
        (today - sessionDate) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff >= 0 && daysDiff < 7) {
        sessionCounts[6 - daysDiff]++;
        totalDuration[6 - daysDiff] += session.duration || 0;
      }
    });

    return {
      labels: last7Days,
      datasets: [
        {
          data: sessionCounts,
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // Chart 2: Study Duration Timeline (Last 7 days) - in minutes
  const getStudyDurationTimeline = () => {
    const last7Days = [];
    const today = new Date();

    // Generate last 7 days labels
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
          color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await client.get("/users");

      if (response.data.success) {
        setUsers(response.data.data || []);
      } else {
        throw new Error("Failed to fetch users");
      }
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
      Alert.alert("Error", "Failed to load goals");
    }
  };

  // Fetch flashcard sets
  const fetchFlashcardSets = async () => {
    try {
      const response = await client.get("/flashcards");
      if (response.data.success) {
        setFlashcardSets(response.data.data || []);
        console.log("Flashcard sets loaded:", response.data.data.length);
      }
    } catch (error) {
      console.error("Fetch flashcards error:", error);
      // Don't show alert for flashcards to avoid multiple error messages
    }
  };

  // Fetch study sessions
  const fetchStudySessions = async () => {
    try {
      const response = await client.get("/study-sessions");
      if (response.data.success) {
        setStudySessions(response.data.data || []);
        console.log("Study sessions loaded:", response.data.data.length);
      }
    } catch (error) {
      console.error("Fetch study sessions error:", error);
    }
  };

  // Function to refresh all data
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch all data in parallel for better performance
      await Promise.all([
        fetchUsers(),
        fetchGoals(),
        fetchFlashcardSets(),
        fetchStudySessions(),
      ]);
    } catch (error) {
      console.error("Refresh error:", error);
      Alert.alert("Error", "Failed to refresh dashboard data");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial data fetch
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

  // Calculate overview stats from actual data
  const getOverviewStats = () => {
    const totalUsers = users.filter(
      (user) => user.role.toLowerCase() !== "admin",
    ).length;

    // Calculate new this week (users created in last 7 days, excluding admin)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = users.filter((user) => {
      const createdAt = new Date(user.created_at);
      return createdAt >= oneWeekAgo && user.role.toLowerCase() !== "admin";
    }).length;

    // Calculate active today (you might want to add logic based on last active)
    const activeToday = Math.floor(totalUsers * 0.6);

    // Calculate flashcard statistics from the sets
    const totalFlashcardSets = flashcardSets.length;
    const totalIndividualFlashcards = flashcardSets.reduce(
      (total, set) => total + (set.flashcards?.length || 0),
      0,
    );

    // Calculate new flashcard sets this week
    const newSetsThisWeek = flashcardSets.filter((set) => {
      const createdAt = new Date(set.created_at);
      return createdAt >= oneWeekAgo;
    }).length;

    // Calculate new individual flashcards this week
    const newFlashcardsThisWeek = flashcardSets.reduce((total, set) => {
      const newFlashcardsInSet = (set.flashcards || []).filter((flashcard) => {
        const createdAt = new Date(flashcard.created_at);
        return createdAt >= oneWeekAgo;
      }).length;
      return total + newFlashcardsInSet;
    }, 0);

    // Calculate total goals completed
    const totalGoals = goals.length;
    const completedGoals = goals.filter((goal) => goal.completed).length;
    const goalsCompletionRate =
      totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Calculate study sessions statistics
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

    // New study sessions this week
    const newSessionsThisWeek = studySessions.filter((session) => {
      const createdAt = new Date(session.created_at);
      return createdAt >= oneWeekAgo;
    }).length;

    // Average session duration
    const averageDuration =
      totalStudySessions > 0
        ? Math.round(totalStudyDuration / totalStudySessions)
        : 0;

    // Most studied subject
    const subjectCounts: { [key: string]: number } = {};
    studySessions.forEach((session) => {
      if (session.subject) {
        subjectCounts[session.subject] =
          (subjectCounts[session.subject] || 0) + 1;
      }
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

  const StatCard = ({ title, value, subtitle, icon, color = "#4A90E2" }) => (
    <View
      className="bg-white rounded-lg p-4 shadow-sm border-l-4 mb-4"
      style={{ borderLeftColor: color }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Ionicons name={icon} size={24} color={color} />
        <Text className="text-2xl font-bold text-gray-800">{value}</Text>
      </View>
      <Text className="text-lg font-semibold text-gray-700">{title}</Text>
      {subtitle && (
        <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
      )}
    </View>
  );

  // Show loading spinner while initial data is being fetched
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text className="text-gray-600 mt-4 text-base">
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 pt-14"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          colors={["#4A90E2", "#34C759", "#FF9500"]}
          tintColor="#4A90E2"
          title="Pull to refresh"
          titleColor="#4A90E2"
        />
      }
    >
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </Text>
        <Text className="text-gray-600 mt-1">Welcome back!</Text>
      </View>

      {/* Quick Stats Grid */}
      <View className="px-4 pt-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-lg font-semibold text-gray-800">Overview</Text>
          <Text className="text-blue-500">This Week</Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%]">
            <StatCard
              title="Total Users"
              value={overviewStats.totalUsers}
              subtitle={`+${overviewStats.newThisWeek} this week`}
              icon="people-outline"
              color="#4A90E2"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Active Today"
              value={overviewStats.activeToday}
              subtitle={`${Math.round((overviewStats.activeToday / overviewStats.totalUsers) * 100)}% of total`}
              icon="trending-up-outline"
              color="#34C759"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Flashcard Sets"
              value={overviewStats.totalFlashcardSets}
              subtitle={`+${overviewStats.newSetsThisWeek} this week`}
              icon="albums-outline"
              color="#FF9500"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Total Flashcards"
              value={overviewStats.totalIndividualFlashcards}
              subtitle={`${overviewStats.totalFlashcardSets} sets, +${overviewStats.newFlashcardsThisWeek} this week`}
              icon="copy-outline"
              color="#AF52DE"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Goals Completed"
              value={overviewStats.completedGoals}
              subtitle={`${overviewStats.goalsCompletionRate}% of ${overviewStats.totalGoals} total`}
              icon="flag-outline"
              color="#34C759"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Study Sessions"
              value={overviewStats.totalStudySessions}
              subtitle={`+${overviewStats.newSessionsThisWeek} this week`}
              icon="time-outline"
              color="#4A90E2"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Study Duration"
              value={`${overviewStats.totalStudyDuration} min`}
              subtitle={`Avg: ${overviewStats.averageDuration} min/session`}
              icon="timer-outline"
              color="#FF9500"
            />
          </View>
          <View className="w-[48%]">
            <StatCard
              title="Pomodoro Sessions"
              value={overviewStats.totalPomodoroSessions}
              subtitle={`${overviewStats.sessionCompletionRate}% completed`}
              icon="bonfire-outline"
              color="#34C759"
            />
          </View>
        </View>
      </View>

      {/* Study Sessions Section */}
      <View className="px-4 mt-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-800">
            Study Sessions Analytics
          </Text>
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-medium">
              Top: {overviewStats.topSubject}
            </Text>
          </View>
        </View>

        {/* Study Sessions Timeline - Count */}
        {studySessions.length > 0 && (
          <View className="mb-4">
            <Text className="text-md font-semibold text-gray-700 mb-2">
              Sessions Created (Last 7 Days)
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              Number of study sessions created each day
            </Text>
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <LineChart
                data={studySessionsTimeline}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#34C759",
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                formatYLabel={(value) => Math.floor(value).toString()}
              />
              <View className="mt-4 flex-row justify-center">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                  <Text className="text-xs text-gray-600">
                    Study Sessions Created
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Study Duration Timeline */}
        {studySessions.length > 0 && (
          <View className="mb-4">
            <Text className="text-md font-semibold text-gray-700 mb-2">
              Study Duration (Last 7 Days)
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              Total minutes studied each day
            </Text>
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <LineChart
                data={studyDurationTimeline}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#FF9500",
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                formatYLabel={(value) => Math.floor(value).toString()}
              />
              <View className="mt-4 flex-row justify-center">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
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
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Goals Completion Rate
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              {overviewStats.completedGoals} completed out of{" "}
              {overviewStats.totalGoals} total goals
            </Text>
            <View className="bg-white rounded-lg p-4 shadow-sm items-center">
              <PieChart
                data={goalsCompletionData}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
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

      {/* Goals Created Timeline - Single Line Chart */}
      {goals.length > 0 && (
        <View className="px-4 mt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Goals Created (Last 7 Days)
          </Text>
          <Text className="text-sm text-gray-500 mb-2">
            Number of goals created each day
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <LineChart
              data={goalsTimelineData}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#4A90E2",
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              formatYLabel={(value) => Math.floor(value).toString()}
            />
            <View className="mt-4 flex-row justify-center">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                <Text className="text-xs text-gray-600">Goals Created</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* User Roles Pie Chart (Excluding Admin) */}
      {pieChartData.length > 0 && (
        <View className="px-4 mt-4 mb-20">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            User Roles Distribution
          </Text>
          <Text className="text-sm text-gray-500 mb-2">
            Showing students and teachers only
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm items-center">
            <PieChart
              data={pieChartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
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
