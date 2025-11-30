import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Svg, Circle } from "react-native-svg";
import { useSelector } from "react-redux";
import client from "@/utils/axiosInstance";

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
    null
  );
  const [sessions, setSessions] = useState<StudySession[]>([]);
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
    updates: Partial<StudySession>
  ) => {
    try {
      const response = await client.put(
        `/study-sessions/${sessionId}`,
        updates
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
        session.time === currentTime
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
                  "All pomodoro sessions completed!"
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
        ]
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
            session.id === sessionId ? updatedSession : session
          )
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
                prev.filter((session) => session.id !== sessionId)
              );
            } catch (error) {
              Alert.alert("Error", "Failed to delete session");
            }
          },
        },
      ]
    );
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await updateSession(sessionId, { completed: true });
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, completed: true } : session
        )
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

  const markedDates = sessions.reduce((acc, session) => {
    acc[session.date] = {
      marked: true,
      dotColor: session.completed ? "#10B981" : "#4A90E2",
    };
    return acc;
  }, {} as any);

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: "#4A90E2",
    };
  }

  const selectedDateSessions = getSessionsForDate(selectedDate);
  const totalTime = currentSession ? currentSession.duration * 60 : 0;
  const progress = calculateProgress(timeLeft, totalTime);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Study Schedule</Text>
        <Text className="text-gray-600 mt-1">Pomodoro Study Tracker</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View className="mx-4 mb-6">
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: "#4A90E2",
              todayTextColor: "#4A90E2",
              arrowColor: "#4A90E2",
              dotColor: "#4A90E2",
            }}
          />
        </View>

        {/* Stats */}
        <View className="mx-4 mb-6 flex-row justify-between">
          <View className="bg-blue-50 rounded-xl p-4 flex-1 mr-2">
            <Text className="text-blue-600 text-lg font-bold">
              {sessions.filter((s) => s.completed).length}
            </Text>
            <Text className="text-blue-600 text-xs">Completed</Text>
          </View>
          <View className="bg-green-50 rounded-xl p-4 flex-1 mx-2">
            <Text className="text-green-600 text-lg font-bold">
              {sessions.filter((s) => !s.completed).length}
            </Text>
            <Text className="text-green-600 text-xs">Pending</Text>
          </View>
          <View className="bg-purple-50 rounded-xl p-4 flex-1 ml-2">
            <Text className="text-purple-600 text-lg font-bold">
              {sessions.length}
            </Text>
            <Text className="text-purple-600 text-xs">Total</Text>
          </View>
        </View>

        {/* Add Session Button */}
        <TouchableOpacity
          className="mx-4 mb-6 bg-blue-500 rounded-xl py-4 flex-row items-center justify-center"
          onPress={() => {
            setNewSession((prev) => ({ ...prev, date: selectedDate || "" }));
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">
            Add Study Session
          </Text>
        </TouchableOpacity>

        {/* Sessions List */}
        <View className="mx-4 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDate
              ? `Sessions for ${selectedDate}`
              : "Select a date to view sessions"}
          </Text>

          {selectedDateSessions.length > 0 ? (
            selectedDateSessions.map((session) => (
              <View
                key={session.id}
                className={`bg-white rounded-xl p-4 mb-3 border-2 ${
                  session.completed ? "border-green-200" : "border-gray-200"
                } shadow-sm`}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-lg font-semibold text-gray-900">
                        {session.subject}
                      </Text>
                      {session.completed && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#10B981"
                          className="ml-2"
                        />
                      )}
                    </View>
                    <Text className="text-gray-600 text-sm mt-1">
                      {session.topic}
                    </Text>
                    <View className="flex-row items-center mt-2 space-x-4">
                      <Text className="text-blue-500 text-sm font-semibold">
                        ⏰ {session.time}
                      </Text>
                      <Text className="text-purple-500 text-sm">
                        🍅 {session.duration}min × {session.pomodoroSessions}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      className="bg-blue-100 px-3 py-2 rounded-lg flex-row items-center"
                      onPress={() => startPomodoroSession(session)}
                    >
                      <Ionicons name="play" size={14} color="#3B82F6" />
                      <Text className="text-blue-600 text-xs font-medium ml-1">
                        Start
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={`px-3 py-2 rounded-lg flex-row items-center ${
                        session.completed ? "bg-gray-100" : "bg-green-100"
                      }`}
                      onPress={() => toggleSessionComplete(session.id)}
                    >
                      <Ionicons
                        name={session.completed ? "refresh" : "checkmark"}
                        size={14}
                        color={session.completed ? "#6B7280" : "#10B981"}
                      />
                      <Text
                        className={`text-xs font-medium ml-1 ${
                          session.completed ? "text-gray-600" : "text-green-600"
                        }`}
                      >
                        {session.completed ? "Redo" : "Complete"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-red-100 px-3 py-2 rounded-lg flex-row items-center"
                      onPress={() => handleDeleteSession(session.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#EF4444"
                      />
                      <Text className="text-red-600 text-xs font-medium ml-1">
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-gray-50 rounded-xl p-8 items-center">
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4 font-medium">
                No study sessions scheduled for this date
              </Text>
              <Text className="text-gray-400 text-center mt-2 text-sm">
                Add a session to get started with Pomodoro!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Session Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <ScrollView
            className="w-full max-h-[90%]"
            contentContainerClassName="items-center"
          >
            <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 my-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-900">
                  Add Study Session
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Subject (e.g., Mathematics)"
                value={newSession.subject}
                onChangeText={(text) =>
                  setNewSession((prev) => ({ ...prev, subject: text }))
                }
                className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                placeholder="Topic (e.g., Algebra Review)"
                value={newSession.topic}
                onChangeText={(text) =>
                  setNewSession((prev) => ({ ...prev, topic: text }))
                }
                className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
              >
                <Text
                  className={`${newSession.time ? "text-gray-900" : "text-gray-400"}`}
                >
                  {newSession.time || "Select Time"}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                />
              )}

              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700">
                  Session Duration (minutes)
                </Text>
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity
                    onPress={() =>
                      setNewSession((prev) => ({ ...prev, duration: 25 }))
                    }
                    className={`px-3 py-1 rounded-lg ${
                      newSession.duration === 25 ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={
                        newSession.duration === 25
                          ? "text-white"
                          : "text-gray-700"
                      }
                    >
                      25
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setNewSession((prev) => ({ ...prev, duration: 50 }))
                    }
                    className={`px-3 py-1 rounded-lg ${
                      newSession.duration === 50 ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={
                        newSession.duration === 50
                          ? "text-white"
                          : "text-gray-700"
                      }
                    >
                      50
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700">Pomodoro Sessions</Text>
                <View className="flex-row items-center space-x-2">
                  <Text className="text-gray-900 font-medium">
                    {newSession.pomodoroSessions}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setNewSession((prev) => ({
                        ...prev,
                        pomodoroSessions: Math.max(
                          1,
                          prev.pomodoroSessions - 1
                        ),
                      }))
                    }
                    className="bg-gray-200 w-8 h-8 rounded-lg items-center justify-center"
                  >
                    <Text>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setNewSession((prev) => ({
                        ...prev,
                        pomodoroSessions: prev.pomodoroSessions + 1,
                      }))
                    }
                    className="bg-gray-200 w-8 h-8 rounded-lg items-center justify-center"
                  >
                    <Text>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row justify-between space-x-3">
                <TouchableOpacity
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                  onPress={() => setShowAddModal(false)}
                >
                  <Text className="text-gray-700 font-medium text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 px-4 bg-blue-500 rounded-xl"
                  onPress={handleAddSession}
                >
                  <Text className="text-white font-medium text-center">
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
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12">
            <View className="items-center mb-4">
              <Ionicons name="alarm" size={48} color="#4A90E2" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              Study Session Time! 🎯
            </Text>

            {currentSession && (
              <>
                <Text className="text-lg font-semibold text-blue-600 text-center mb-1">
                  {currentSession.subject}
                </Text>
                <Text className="text-gray-600 text-center mb-4">
                  {currentSession.topic}
                </Text>

                <View className="bg-blue-50 rounded-xl p-4 mb-6">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-700">Duration:</Text>
                    <Text className="text-gray-900 font-semibold">
                      {currentSession.duration} minutes
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-700">Sessions:</Text>
                    <Text className="text-gray-900 font-semibold">
                      {currentSession.pomodoroSessions} pomodoros
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-500 text-center text-sm mb-6">
                  Ready to focus? Start your Pomodoro session now!
                </Text>
              </>
            )}

            <View className="flex-row justify-between space-x-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                onPress={handleSkipSession}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Skip
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 px-4 bg-green-500 rounded-xl"
                onPress={handleStartSession}
              >
                <Text className="text-white font-medium text-center">
                  Start Session
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Timer Modal */}
      <Modal visible={showTimerModal} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white rounded-2xl p-6 mx-4 w-11/12 items-center">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Pomodoro Timer
            </Text>

            {currentSession && (
              <>
                <Text className="text-lg font-semibold text-blue-600 text-center mb-1">
                  {currentSession.subject}
                </Text>
                <Text className="text-gray-600 text-center mb-6">
                  {currentSession.topic}
                </Text>

                <View className="mb-6">
                  <Text className="text-center text-gray-500 mb-2">
                    Session {currentPomodoro} of{" "}
                    {currentSession.pomodoroSessions}
                  </Text>

                  {/* Circular Progress Bar */}
                  <View className="items-center justify-center mb-4">
                    <Svg width="200" height="200">
                      {/* Background Circle */}
                      <Circle
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      {/* Progress Circle */}
                      <Circle
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke="#4A90E2"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90, 100, 100)"
                      />
                    </Svg>
                    <View className="absolute items-center justify-center">
                      <Text className="text-3xl font-bold text-gray-900">
                        {formatTime(timeLeft)}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        {isRunning ? "Time remaining" : "Paused"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-center space-x-4 mb-6">
                  <TouchableOpacity
                    className="bg-blue-500 rounded-xl px-6 py-3 flex-row items-center"
                    onPress={() => setIsRunning(!isRunning)}
                  >
                    <Ionicons
                      name={isRunning ? "pause" : "play"}
                      size={20}
                      color="white"
                    />
                    <Text className="text-white font-medium ml-2">
                      {isRunning ? "Pause" : "Resume"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-red-500 rounded-xl px-6 py-3 flex-row items-center"
                    onPress={stopTimer}
                  >
                    <Ionicons name="stop" size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Stop</Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-gray-50 rounded-xl p-4 w-full">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-700">Session Progress:</Text>
                    <Text className="text-gray-900 font-semibold">
                      {Math.round(100 - progress)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-gray-700">Current Pomodoro:</Text>
                    <Text className="text-gray-900 font-semibold">
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
