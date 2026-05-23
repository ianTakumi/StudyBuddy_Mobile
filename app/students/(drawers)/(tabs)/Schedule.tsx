import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Circle, Svg } from "react-native-svg";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  date: string;
  time: string;
  duration: number;
  completed: boolean;
  pomodoroSessions: number;
  user_id: string;
}

export default function Schedule() {
  const user = useSelector((state: any) => state.auth.user);
  const [selectedDate, setSelectedDate] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null,
  );
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newSession, setNewSession] = useState({
    subject: "",
    topic: "",
    date: "",
    time: "",
    duration: 25,
    pomodoroSessions: 4,
  });

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPomodoro, setCurrentPomodoro] = useState(1);

  useEffect(() => {
    fetchSessions();
    startSessionChecker();
  }, []);

  // API Functions
  const fetchSessions = async () => {
    try {
      const response = await client.get(`/study-sessions/${user.id}`);
      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      // Fallback to sample data
      setSessions([
        {
          id: "1",
          subject: "Mathematics",
          topic: "Algebra Review",
          date: "2024-01-15",
          time: "09:00",
          duration: 25,
          completed: false,
          pomodoroSessions: 4,
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
          pomodoroSessions: 3,
          user_id: user.id,
        },
      ]);
    }
  };

  // Combined refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchSessions();
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

  // Add this function before the return statement
  const isFormValid = () => {
    return (
      newSession.subject.trim() !== "" &&
      newSession.topic.trim() !== "" &&
      newSession.time !== "" &&
      newSession.duration > 0
    );
  };

  const createSession = async (sessionData: Omit<StudySession, "id">) => {
    try {
      const response = await client.post("/study-sessions", sessionData);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  };

  const updateSession = async (
    sessionId: string,
    updates: Partial<StudySession>,
  ) => {
    try {
      const response = await client.put(
        `/study-sessions/${sessionId}`,
        updates,
      );
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await client.delete(`/study-sessions/${sessionId}`);
      if (response.data.success) {
        return true;
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  };

  // Session checking
  const startSessionChecker = () => {
    setInterval(() => {
      checkUpcomingSessions();
    }, 60000);
  };

  const checkUpcomingSessions = () => {
    const now = new Date();
    const currentTime = now.toTimeString().split(" ")[0].substring(0, 5);
    const currentDate = now.toISOString().split("T")[0];

    const upcomingSession = sessions.find(
      (session) =>
        !session.completed &&
        session.date === currentDate &&
        session.time === currentTime,
    );

    if (upcomingSession && !showSessionModal && !showTimerModal) {
      setCurrentSession(upcomingSession);
      setShowSessionModal(true);
    }
  };

  // Timer functions
  const startTimer = (duration: number) => {
    setTimeLeft(duration * 60); // Convert minutes to seconds
    setIsRunning(true);
    setShowTimerModal(true);
    setShowSessionModal(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setShowTimerModal(false);
    setCurrentPomodoro(1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateProgress = (current: number, total: number) => {
    return (current / total) * 100;
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer finished
      setIsRunning(false);
      Alert.alert(
        "Time's Up! 🎉",
        `Pomodoro ${currentPomodoro} completed! Take a 5-minute break.`,
        [
          {
            text: "Start Next Session",
            onPress: () => {
              if (
                currentSession &&
                currentPomodoro < currentSession.pomodoroSessions
              ) {
                setCurrentPomodoro(currentPomodoro + 1);
                startTimer(currentSession.duration);
              } else {
                // All pomodoros completed
                if (currentSession) {
                  handleCompleteSession(currentSession.id);
                }
                setShowTimerModal(false);
                setCurrentPomodoro(1);
                Alert.alert(
                  "Congratulations! 🎊",
                  "All pomodoro sessions completed!",
                );
              }
            },
          },
          {
            text: "Finish",
            onPress: () => {
              setShowTimerModal(false);
              setCurrentPomodoro(1);
            },
          },
        ],
      );
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentPomodoro]);

  const handleAddSession = async () => {
    if (
      !newSession.subject ||
      !newSession.topic ||
      !newSession.date ||
      !newSession.time
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const sessionData = {
        ...newSession,
        user_id: user.id,
        completed: false,
      };

      const newSessionData = await createSession(sessionData);
      setSessions((prev) => [...prev, newSessionData]);
      setShowAddModal(false);
      resetNewSession();
      Alert.alert("Success", "Study session added!");
    } catch (error) {
      Alert.alert("Error", "Failed to add study session");
    }
  };

  const resetNewSession = () => {
    setNewSession({
      subject: "",
      topic: "",
      date: selectedDate || "",
      time: "",
      duration: 25,
      pomodoroSessions: 4,
    });
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime
        .toTimeString()
        .split(" ")[0]
        .substring(0, 5);
      setNewSession((prev) => ({ ...prev, time: timeString }));
    }
  };

  const toggleSessionComplete = async (sessionId: string) => {
    try {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        const updatedSession = await updateSession(sessionId, {
          completed: !session.completed,
        });
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId ? updatedSession : session,
          ),
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update session");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to delete this study session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSession(sessionId);
              setSessions((prev) =>
                prev.filter((session) => session.id !== sessionId),
              );
            } catch (error) {
              Alert.alert("Error", "Failed to delete session");
            }
          },
        },
      ],
    );
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await updateSession(sessionId, { completed: true });
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, completed: true } : session,
        ),
      );
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const startPomodoroSession = (session: StudySession) => {
    setCurrentSession(session);
    setShowSessionModal(true);
  };

  const handleStartSession = () => {
    if (currentSession) {
      startTimer(currentSession.duration);
    }
  };

  const handleSkipSession = () => {
    setShowSessionModal(false);
  };

  const getSessionsForDate = (date: string) => {
    return sessions.filter((session) => session.date === date);
  };

  // Get upcoming sessions (today and future dates, not completed)
  const getUpcomingSessions = () => {
    const today = new Date().toISOString().split("T")[0];
    return sessions
      .filter((session) => !session.completed && session.date >= today)
      .sort((a, b) => {
        // Sort by date first, then by time
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      });
  };

  const markedDates = sessions.reduce((acc, session) => {
    acc[session.date] = {
      marked: true,
      dotColor: session.completed ? "#10B981" : "#059669",
    };
    return acc;
  }, {} as any);

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: "#10B981",
    };
  }

  const selectedDateSessions = getSessionsForDate(selectedDate);
  const upcomingSessions = getUpcomingSessions();
  const totalTime = currentSession ? currentSession.duration * 60 : 0;
  const progress = calculateProgress(timeLeft, totalTime);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View className="flex-1 bg-emerald-50">
      {/* Header - Pear Deck Style */}
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
        {/* Decorative Circles */}
        <View className="absolute top-8 left-6 w-16 h-16 bg-emerald-400/30 rounded-full" />
        <View className="absolute top-20 right-10 w-24 h-24 bg-emerald-400/20 rounded-full" />
        <View className="absolute bottom-4 left-20 w-12 h-12 bg-emerald-300/40 rounded-full" />
        <View className="absolute top-14 right-32 w-8 h-8 bg-emerald-300/50 rounded-full" />

        <Text className="text-3xl font-bold text-white mb-1">
          Study Schedule
        </Text>
        <Text className="text-emerald-100 text-base">
          Pomodoro Study Tracker
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
            title="Pull to refresh..."
            titleColor="#6b7280"
          />
        }
      >
        {/* Calendar */}
        <View className="mx-4 mt-6 mb-6">
          <View
            className="bg-white rounded-3xl p-4"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <Calendar
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                selectedDayBackgroundColor: "#10B981",
                todayTextColor: "#10B981",
                arrowColor: "#10B981",
                dotColor: "#10B981",
                selectedDotColor: "#ffffff",
                dayTextColor: "#374151",
                textDisabledColor: "#d1d5db",
                monthTextColor: "#10B981",
                textMonthFontWeight: "bold",
              }}
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View className="mx-4 mb-6 flex-row justify-between gap-3">
          <View
            className="bg-white rounded-2xl p-4 flex-1 relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-100 rounded-full opacity-50" />
            <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text className="text-emerald-600 text-2xl font-bold">
              {sessions.filter((s) => s.completed).length}
            </Text>
            <Text className="text-gray-500 text-xs font-medium">Completed</Text>
          </View>

          <View
            className="bg-white rounded-2xl p-4 flex-1 relative overflow-hidden"
            style={{
              shadowColor: "#F59E0B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute -top-2 -right-2 w-10 h-10 bg-amber-100 rounded-full opacity-50" />
            <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="time-outline" size={20} color="#F59E0B" />
            </View>
            <Text className="text-amber-600 text-2xl font-bold">
              {sessions.filter((s) => !s.completed).length}
            </Text>
            <Text className="text-gray-500 text-xs font-medium">Pending</Text>
          </View>

          <View
            className="bg-white rounded-2xl p-4 flex-1 relative overflow-hidden"
            style={{
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="absolute -top-2 -right-2 w-10 h-10 bg-purple-100 rounded-full opacity-50" />
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="stats-chart" size={20} color="#8B5CF6" />
            </View>
            <Text className="text-purple-600 text-2xl font-bold">
              {sessions.length}
            </Text>
            <Text className="text-gray-500 text-xs font-medium">Total</Text>
          </View>
        </View>

        {/* Add Session Button */}
        <TouchableOpacity
          className="mx-4 mb-6 bg-emerald-500 rounded-2xl py-4 flex-row items-center justify-center"
          onPress={() => {
            setNewSession((prev) => ({ ...prev, date: selectedDate || "" }));
            setShowAddModal(true);
          }}
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
            <Ionicons name="add" size={20} color="white" />
          </View>
          <Text className="text-white font-bold text-lg">
            Add Study Session
          </Text>
        </TouchableOpacity>

        {/* Sessions List for Selected Date */}
        <View className="mx-4 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="calendar-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              {selectedDate
                ? `Sessions for ${selectedDate}`
                : "Select a date to view sessions"}
            </Text>
          </View>

          {selectedDateSessions.length > 0
            ? selectedDateSessions.map((session) => (
                <View
                  key={session.id}
                  className="bg-white rounded-3xl p-5 mb-4 relative overflow-hidden"
                  style={{
                    shadowColor: session.completed ? "#10B981" : "#6B7280",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    elevation: 4,
                  }}
                >
                  {/* Decorative circles on card */}
                  <View className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full opacity-70" />
                  <View className="absolute -bottom-3 -left-3 w-12 h-12 bg-emerald-50 rounded-full opacity-70" />

                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                          <Ionicons
                            name="book-outline"
                            size={20}
                            color="#10B981"
                          />
                        </View>
                        <View>
                          <View className="flex-row items-center">
                            <Text className="text-lg font-bold text-gray-900">
                              {session.subject}
                            </Text>
                            {session.completed && (
                              <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center ml-2">
                                <Ionicons
                                  name="checkmark-circle"
                                  size={14}
                                  color="#10B981"
                                />
                              </View>
                            )}
                          </View>
                          <Text className="text-gray-600 text-sm mt-0.5">
                            {session.topic}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center mt-3 ml-13 gap-3">
                        <View className="flex-row items-center bg-emerald-50 rounded-full px-3 py-1">
                          <View className="w-4 h-4 bg-emerald-200 rounded-full items-center justify-center mr-1.5">
                            <Ionicons
                              name="time-outline"
                              size={10}
                              color="#10B981"
                            />
                          </View>
                          <Text className="text-emerald-600 text-xs font-semibold">
                            {session.time}
                          </Text>
                        </View>
                        <View className="flex-row items-center bg-emerald-50 rounded-full px-3 py-1">
                          <View className="w-4 h-4 bg-emerald-200 rounded-full items-center justify-center mr-1.5">
                            <Ionicons
                              name="timer-outline"
                              size={10}
                              color="#10B981"
                            />
                          </View>
                          <Text className="text-emerald-600 text-xs font-semibold">
                            {session.duration}min × {session.pomodoroSessions}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center ml-13 pt-3 border-t border-emerald-50">
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        className="bg-emerald-500 px-4 py-2 rounded-full flex-row items-center"
                        onPress={() => startPomodoroSession(session)}
                        style={{
                          shadowColor: "#10B981",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.2,
                          shadowRadius: 8,
                          elevation: 3,
                        }}
                      >
                        <Ionicons name="play" size={14} color="white" />
                        <Text className="text-white text-xs font-semibold ml-1.5">
                          Start
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className={`px-4 py-2 rounded-full flex-row items-center ${
                          session.completed ? "bg-gray-100" : "bg-emerald-100"
                        }`}
                        onPress={() => toggleSessionComplete(session.id)}
                      >
                        <Ionicons
                          name={session.completed ? "refresh" : "checkmark"}
                          size={14}
                          color={session.completed ? "#6B7280" : "#10B981"}
                        />
                        <Text
                          className={`text-xs font-semibold ml-1.5 ${
                            session.completed
                              ? "text-gray-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {session.completed ? "Redo" : "Complete"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="bg-red-50 px-3 py-2 rounded-full flex-row items-center"
                        onPress={() => handleDeleteSession(session.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={14}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            : selectedDate && (
                <View
                  className="bg-white rounded-3xl p-8 items-center relative overflow-hidden"
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    elevation: 4,
                  }}
                >
                  <View className="absolute -top-8 -right-8 w-20 h-20 bg-emerald-50 rounded-full" />
                  <View className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-50 rounded-full" />

                  <View
                    className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4"
                    style={{
                      shadowColor: "#10B981",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={36}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-gray-800 text-lg font-bold text-center">
                    No study sessions
                  </Text>
                  <Text className="text-gray-500 text-center mt-2 text-sm">
                    Add a session to get started with Pomodoro!
                  </Text>
                </View>
              )}
        </View>

        {/* Upcoming Sessions Section */}
        <View className="mx-4 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-2">
                <Ionicons name="trending-up" size={16} color="#10B981" />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                Upcoming Sessions
              </Text>
            </View>
            {upcomingSessions.length > 0 && (
              <View className="bg-emerald-100 rounded-full px-3 py-1">
                <Text className="text-emerald-600 text-xs font-semibold">
                  {upcomingSessions.length} upcoming
                </Text>
              </View>
            )}
          </View>

          {upcomingSessions.length > 0 ? (
            upcomingSessions.slice(0, 5).map((session) => (
              <TouchableOpacity
                key={session.id}
                className="bg-white rounded-3xl p-5 mb-3 relative overflow-hidden"
                onPress={() => startPomodoroSession(session)}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 3,
                }}
              >
                <View className="absolute -top-4 -right-4 w-14 h-14 bg-emerald-50 rounded-full opacity-70" />

                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                        <Ionicons name="book" size={18} color="#10B981" />
                      </View>
                      <View>
                        <Text className="font-bold text-gray-900">
                          {session.subject}
                        </Text>
                        <Text className="text-gray-600 text-sm mt-0.5">
                          {session.topic}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mt-3 ml-13 gap-3">
                      <View className="flex-row items-center">
                        <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mr-1">
                          <Ionicons
                            name="calendar-outline"
                            size={9}
                            color="#10B981"
                          />
                        </View>
                        <Text className="text-gray-500 text-xs">
                          {session.date}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mr-1">
                          <Ionicons
                            name="time-outline"
                            size={9}
                            color="#10B981"
                          />
                        </View>
                        <Text className="text-gray-500 text-xs">
                          {session.time}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mr-1">
                          <Ionicons
                            name="timer-outline"
                            size={9}
                            color="#10B981"
                          />
                        </View>
                        <Text className="text-gray-500 text-xs">
                          {session.duration}min
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="bg-emerald-500 px-4 py-2 rounded-full ml-2"
                    onPress={() => startPomodoroSession(session)}
                    style={{
                      shadowColor: "#10B981",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    <Text className="text-white text-xs font-bold">Start</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View
              className="bg-white rounded-3xl p-8 items-center relative overflow-hidden"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 4,
              }}
            >
              <View className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-50 rounded-full" />
              <View className="absolute -bottom-4 -left-4 w-12 h-12 bg-emerald-50 rounded-full" />

              <View
                className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={32}
                  color="#10B981"
                />
              </View>
              <Text className="text-gray-800 font-bold text-lg">
                No upcoming sessions
              </Text>
              <Text className="text-gray-500 text-center text-sm mt-1">
                Add a session to start studying!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Session Modal - Pear Deck Style */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <ScrollView
            className="w-full max-h-[90%]"
            contentContainerStyle={{ alignItems: "center" }}
          >
            <View
              className="bg-white rounded-3xl p-6 mx-4 w-11/12 my-8 relative overflow-hidden"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.2,
                shadowRadius: 40,
                elevation: 15,
              }}
            >
              {/* Decorative circles on modal */}
              <View className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-100 rounded-full opacity-50" />
              <View className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-50 rounded-full opacity-50" />
              <View className="absolute top-20 right-8 w-8 h-8 bg-emerald-100 rounded-full opacity-60" />

              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                    <Ionicons
                      name="add-circle-outline"
                      size={22}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-xl font-bold text-gray-900">
                    Add Study Session
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Subject Input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2 ml-1">
                  Subject <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Mathematics, Science, English..."
                  value={newSession.subject}
                  onChangeText={(text) =>
                    setNewSession((prev) => ({ ...prev, subject: text }))
                  }
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Topic Input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2 ml-1">
                  Topic <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Algebra Review, Biology Lab, Essay Writing..."
                  value={newSession.topic}
                  onChangeText={(text) =>
                    setNewSession((prev) => ({ ...prev, topic: text }))
                  }
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 text-gray-900 bg-emerald-50"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Time Picker */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2 ml-1">
                  Time <Text className="text-red-500">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="border-2 border-emerald-200 rounded-2xl px-5 py-4 flex-row items-center justify-between bg-emerald-50"
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-emerald-200 rounded-full items-center justify-center mr-3">
                      <Ionicons
                        name="alarm-outline"
                        size={16}
                        color={newSession.time ? "#10B981" : "#9CA3AF"}
                      />
                    </View>
                    <Text
                      className={`font-medium ${newSession.time ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {newSession.time || "Select Time"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#10B981" />
                </TouchableOpacity>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                />
              )}

              {/* Duration Selection */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-3 ml-1">
                  Session Duration <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() =>
                      setNewSession((prev) => ({ ...prev, duration: 25 }))
                    }
                    className={`flex-1 py-3 rounded-full items-center ${
                      newSession.duration === 25
                        ? "bg-emerald-500"
                        : "bg-gray-100"
                    }`}
                    style={
                      newSession.duration === 25
                        ? {
                            shadowColor: "#10B981",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4,
                          }
                        : {}
                    }
                  >
                    <Text
                      className={`font-semibold ${
                        newSession.duration === 25
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      25 min
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setNewSession((prev) => ({ ...prev, duration: 50 }))
                    }
                    className={`flex-1 py-3 rounded-full items-center ${
                      newSession.duration === 50
                        ? "bg-emerald-500"
                        : "bg-gray-100"
                    }`}
                    style={
                      newSession.duration === 50
                        ? {
                            shadowColor: "#10B981",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4,
                          }
                        : {}
                    }
                  >
                    <Text
                      className={`font-semibold ${
                        newSession.duration === 50
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      50 min
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pomodoro Sessions */}
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-3 ml-1">
                  Pomodoro Sessions
                </Text>
                <View className="flex-row items-center justify-center gap-4">
                  <TouchableOpacity
                    onPress={() =>
                      setNewSession((prev) => ({
                        ...prev,
                        pomodoroSessions: Math.max(
                          1,
                          prev.pomodoroSessions - 1,
                        ),
                      }))
                    }
                    className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="remove" size={24} color="#10B981" />
                  </TouchableOpacity>
                  <View
                    className="w-16 h-16 bg-emerald-500 rounded-full items-center justify-center"
                    style={{
                      shadowColor: "#10B981",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Text className="text-white text-2xl font-bold">
                      {newSession.pomodoroSessions}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setNewSession((prev) => ({
                        ...prev,
                        pomodoroSessions: prev.pomodoroSessions + 1,
                      }))
                    }
                    className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="add" size={24} color="#10B981" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                  onPress={() => setShowAddModal(false)}
                >
                  <Text className="text-gray-700 font-semibold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-4 px-4 rounded-2xl ${
                    isFormValid() ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                  onPress={handleAddSession}
                  disabled={!isFormValid()}
                  style={
                    isFormValid()
                      ? {
                          shadowColor: "#10B981",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.3,
                          shadowRadius: 16,
                          elevation: 8,
                        }
                      : {}
                  }
                >
                  <Text
                    className={`font-bold text-center ${
                      isFormValid() ? "text-white" : "text-gray-500"
                    }`}
                  >
                    Add Session
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Session Time Modal */}
      <Modal visible={showSessionModal} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/70 px-4">
          <View
            className="bg-white rounded-3xl p-8 w-full max-w-md relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.2,
              shadowRadius: 40,
              elevation: 15,
            }}
          >
            <View className="absolute -top-8 -right-8 w-20 h-20 bg-emerald-100 rounded-full opacity-50" />
            <View className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-50 rounded-full opacity-50" />

            <View className="items-center mb-6">
              <View
                className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <Ionicons name="alarm" size={36} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                Study Session Time! 🎯
              </Text>
            </View>

            {currentSession && (
              <>
                <Text className="text-lg font-bold text-emerald-600 text-center mb-1">
                  {currentSession.subject}
                </Text>
                <Text className="text-gray-600 text-center mb-6">
                  {currentSession.topic}
                </Text>

                <View className="bg-emerald-50 rounded-2xl p-5 mb-6">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-emerald-200 rounded-full items-center justify-center mr-2">
                        <Ionicons
                          name="timer-outline"
                          size={16}
                          color="#10B981"
                        />
                      </View>
                      <Text className="text-gray-700 font-medium">
                        Duration:
                      </Text>
                    </View>
                    <Text className="text-gray-900 font-bold">
                      {currentSession.duration} minutes
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-emerald-200 rounded-full items-center justify-center mr-2">
                        <Ionicons
                          name="repeat-outline"
                          size={16}
                          color="#10B981"
                        />
                      </View>
                      <Text className="text-gray-700 font-medium">
                        Sessions:
                      </Text>
                    </View>
                    <Text className="text-gray-900 font-bold">
                      {currentSession.pomodoroSessions} pomodoros
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-500 text-center text-sm mb-6">
                  Ready to focus? Start your Pomodoro session now!
                </Text>
              </>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-2xl"
                onPress={handleSkipSession}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Skip
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 px-4 bg-emerald-500 rounded-2xl"
                onPress={handleStartSession}
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Text className="text-white font-bold text-center">
                  Start Session
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Timer Modal */}
      <Modal visible={showTimerModal} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/70 px-4">
          <View
            className="bg-white rounded-3xl p-8 w-full max-w-md items-center relative overflow-hidden"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.2,
              shadowRadius: 40,
              elevation: 15,
            }}
          >
            <View className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-100 rounded-full opacity-50" />
            <View className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-50 rounded-full opacity-50" />

            <View
              className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Ionicons name="timer" size={30} color="#10B981" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Pomodoro Timer
            </Text>

            {currentSession && (
              <>
                <Text className="text-lg font-bold text-emerald-600 text-center mb-1">
                  {currentSession.subject}
                </Text>
                <Text className="text-gray-600 text-center mb-6">
                  {currentSession.topic}
                </Text>

                <View className="mb-6">
                  <View className="bg-emerald-100 rounded-full px-4 py-1.5 mb-4 self-center">
                    <Text className="text-emerald-600 text-sm font-semibold">
                      Session {currentPomodoro} of{" "}
                      {currentSession.pomodoroSessions}
                    </Text>
                  </View>

                  {/* Circular Progress Bar */}
                  <View className="items-center justify-center mb-4">
                    <Svg width="200" height="200">
                      {/* Background Circle */}
                      <Circle
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke="#D1FAE5"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Progress Circle */}
                      <Circle
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke="#10B981"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90, 100, 100)"
                      />
                    </Svg>
                    <View className="absolute items-center justify-center">
                      <Text className="text-4xl font-bold text-gray-900">
                        {formatTime(timeLeft)}
                      </Text>
                      <Text className="text-emerald-600 text-sm font-medium mt-1">
                        {isRunning ? "Focusing..." : "Paused"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-center gap-4 mb-6">
                  <TouchableOpacity
                    className="bg-emerald-500 rounded-full px-8 py-3 flex-row items-center"
                    onPress={() => setIsRunning(!isRunning)}
                    style={{
                      shadowColor: "#10B981",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Ionicons
                      name={isRunning ? "pause" : "play"}
                      size={20}
                      color="white"
                    />
                    <Text className="text-white font-bold ml-2">
                      {isRunning ? "Pause" : "Resume"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-red-500 rounded-full px-8 py-3 flex-row items-center"
                    onPress={stopTimer}
                    style={{
                      shadowColor: "#EF4444",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Ionicons name="stop" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Stop</Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-emerald-50 rounded-2xl p-5 w-full">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-700 font-medium">
                      Session Progress:
                    </Text>
                    <Text className="text-emerald-600 font-bold">
                      {Math.round(100 - progress)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-700 font-medium">
                      Current Pomodoro:
                    </Text>
                    <Text className="text-emerald-600 font-bold">
                      {currentPomodoro}/{currentSession.pomodoroSessions}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
