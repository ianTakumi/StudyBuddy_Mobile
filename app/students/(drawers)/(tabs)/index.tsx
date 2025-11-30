import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import client from "@/utils/axiosInstance";

export default function Index() {
  const user = useSelector((state) => state.auth.user);
  const firstName = user?.first_name?.split(" ")[0] || "Student";
  const router = useRouter();

  const [flashcards, setFlashcards] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch flashcards data
      const flashcardsResponse = await client.get(
        `/flashcards/sets/${user.id}`
      );

      // Fetch study sessions data
      const sessionsResponse = await client.get(`/study-sessions/${user.id}`);

      // Set the actual data from API responses
      if (flashcardsResponse.data.success) {
        setFlashcards(flashcardsResponse.data.data || []);
      }

      if (sessionsResponse.data.success) {
        setStudySessions(sessionsResponse.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to empty arrays if API fails
      setFlashcards([]);
      setStudySessions([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const getIconForSubject = (subject) => {
    if (!subject)
      return <Ionicons name="book-outline" size={24} color="#4A90E2" />;

    switch (subject.toLowerCase()) {
      case "math":
      case "mathematics":
        return <Ionicons name="calculator-outline" size={24} color="#4A90E2" />;
      case "science":
      case "biology":
        return <Ionicons name="flask-outline" size={24} color="#10B981" />;
      case "history":
        return <Ionicons name="time-outline" size={24} color="#F59E0B" />;
      case "english":
      case "language":
        return <Ionicons name="book-outline" size={24} color="#EF4444" />;
      default:
        return <Ionicons name="book-outline" size={24} color="#4A90E2" />;
    }
  };

  const getBgColorForSubject = (subject) => {
    if (!subject) return "bg-blue-100";

    switch (subject.toLowerCase()) {
      case "math":
      case "mathematics":
        return "bg-blue-100";
      case "science":
      case "biology":
        return "bg-green-100";
      case "history":
        return "bg-yellow-100";
      case "english":
      case "language":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";

    // Assuming time is stored as "HH:MM:SS" or similar format
    const timeParts = timeString.split(":");
    if (timeParts.length >= 2) {
      const hour = parseInt(timeParts[0]);
      const minute = timeParts[1];
      const period = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minute} ${period}`;
    }
    return timeString;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const startPomodoroSession = (session) => {
    console.log("Starting session:", session);
    router.push("/PomodoroSession");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center mt-10">
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text className="text-gray-600 mt-4">Loading your study data...</Text>
      </View>
    );
  }

  // Get today's date for filtering sessions
  const today = new Date().toISOString().split("T")[0];

  // Filter today's sessions
  const todaySessions = studySessions.filter(
    (session) => session.date === today
  );

  const completedTodaySessions = todaySessions.filter(
    (session) => session.completed
  ).length;
  const totalTodaySessions = todaySessions.length;

  // Calculate card count for each flashcard set
  const flashcardsWithCount = flashcards.map((set) => ({
    ...set,
    cardCount: set.flashcards?.length || 0,
    lastStudied: set.last_reviewed
      ? formatRelativeTime(set.last_reviewed)
      : "Not studied yet",
  }));

  // Helper function for relative time
  function formatRelativeTime(dateString) {
    if (!dateString) return "Not studied yet";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return formatDate(dateString);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-white mt-10"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex-1 p-8 bg-white">
        {/* Greeting */}
        <View className="flex-row items-center mb-4">
          <Text className="text-2xl text-gray-800">Hello </Text>
          <Text className="text-2xl font-bold text-blue-500">{firstName}!</Text>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            className="bg-blue-500 px-4 py-3 rounded-xl flex-1 mr-2 items-center"
            onPress={() => router.push("/students/(drawers)/(tabs)/Schedule")}
          >
            <Ionicons name="timer-outline" size={24} color="white" />
            <Text className="text-white font-bold mt-1">
              Start Study Session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-500 px-4 py-3 rounded-xl flex-1 ml-2 items-center"
            onPress={() => router.push("/students/(drawers)/(tabs)/FlashCards")}
          >
            <Ionicons name="copy-outline" size={24} color="white" />
            <Text className="text-white font-bold mt-1">My Flashcards</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Focus Sessions */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-blue-600">
              Today&apos;s Focus Sessions
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/students/(drawers)/(tabs)/Schedule")}
            >
              <Text className="text-blue-500 font-medium">View all</Text>
            </TouchableOpacity>
          </View>

          {todaySessions.length === 0 ? (
            <View className="bg-blue-50 rounded-2xl p-6 items-center justify-center">
              <Ionicons name="calendar-outline" size={48} color="#4A90E2" />
              <Text className="text-blue-800 font-medium text-lg mt-2 text-center">
                No sessions planned for today
              </Text>
              <Text className="text-blue-600 text-center mt-1 mb-4">
                Schedule your first study session to get started!
              </Text>
              <TouchableOpacity
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={() => router.push("/Schedule/Create")}
              >
                <Text className="text-white font-medium">
                  Plan First Session
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Completed Sessions Progress */}
              <View className="bg-blue-50 rounded-2xl p-4 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-blue-800 font-medium">
                    Daily Progress
                  </Text>
                  <Text className="text-blue-800 font-medium">
                    {completedTodaySessions}/{totalTodaySessions} sessions
                  </Text>
                </View>
                <View className="bg-blue-200 rounded-full h-2">
                  <View
                    className="bg-blue-500 rounded-full h-2"
                    style={{
                      width: `${totalTodaySessions > 0 ? (completedTodaySessions / totalTodaySessions) * 100 : 0}%`,
                    }}
                  ></View>
                </View>
              </View>

              {/* Upcoming Sessions */}
              {todaySessions
                .filter((session) => !session.completed)
                .map((session) => (
                  <View
                    key={session.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View
                          className={`${getBgColorForSubject(session.subject)} p-2 rounded-lg mr-3`}
                        >
                          {getIconForSubject(session.subject)}
                        </View>
                        <View>
                          <Text className="font-bold text-gray-800">
                            {session.subject || "Study Session"}
                          </Text>
                          <Text className="text-gray-500">
                            {formatTime(session.time)}
                          </Text>
                          {session.duration && (
                            <Text className="text-gray-400 text-xs">
                              {session.duration} minutes
                            </Text>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        className="bg-blue-500 px-3 py-1 rounded-lg"
                        onPress={() => startPomodoroSession(session)}
                      >
                        <Text className="text-white text-sm">Start</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </>
          )}
        </View>

        {/* Recent Flashcards */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-blue-600">
              Recent Flashcards
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push("/students/(drawers)/(tabs)/FlashCards")
              }
            >
              <Text className="text-blue-500 font-medium">View all</Text>
            </TouchableOpacity>
          </View>

          {flashcardsWithCount.length === 0 ? (
            <View className="bg-green-50 rounded-2xl p-6 items-center justify-center">
              <Ionicons name="documents-outline" size={48} color="#10B981" />
              <Text className="text-green-800 font-medium text-lg mt-2 text-center">
                No flashcards yet
              </Text>
              <Text className="text-green-600 text-center mt-1 mb-4">
                Create your first flashcard set to start studying!
              </Text>
              <TouchableOpacity
                className="bg-green-500 px-4 py-2 rounded-lg"
                onPress={() =>
                  router.push("/students/(drawers)/(tabs)/FlashCards")
                }
              >
                <Text className="text-white font-medium">Create First Set</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {flashcardsWithCount.slice(0, 3).map((flashcard) => (
                <TouchableOpacity
                  key={flashcard.id}
                  className="bg-white rounded-2xl p-4 mr-4 shadow-sm border border-gray-100 w-48"
                  onPress={() =>
                    router.push(
                      `/students/(drawers)/(tabs)/FlashCards/${flashcard.id}`
                    )
                  }
                >
                  <View
                    className={`${getBgColorForSubject(flashcard.subject)} rounded-xl w-12 h-12 items-center justify-center mb-3`}
                  >
                    {getIconForSubject(flashcard.subject)}
                  </View>
                  <Text className="font-bold text-gray-800 mb-1">
                    {flashcard.title}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {flashcard.cardCount} cards
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-xs ml-1">
                      {flashcard.lastStudied}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Motivational Quote */}
        <View className="bg-blue-50 rounded-2xl p-6 mb-6">
          <Text className="text-blue-800 text-lg font-medium text-center">
            &quot;Small daily improvements are the key to staggering long-term
            results.&quot;
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
