import client from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

export default function Index() {
  const user = useSelector((state) => state.auth.user);
  const firstName = user?.first_name?.split(" ")[0] || "Student";
  const router = useRouter();

  const [flashcards, setFlashcards] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("");

  // Dynamic greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);

      const flashcardsResponse = await client.get(
        `/flashcards/sets/${user.id}`,
      );
      const sessionsResponse = await client.get(`/study-sessions/${user.id}`);

      if (flashcardsResponse.data.success) {
        setFlashcards(flashcardsResponse.data.data || []);
      }

      if (sessionsResponse.data.success) {
        setStudySessions(sessionsResponse.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const getIconForSubject = (subject: string) => {
    if (!subject)
      return <Ionicons name="book-outline" size={22} color="#059669" />;

    switch (subject.toLowerCase()) {
      case "math":
      case "mathematics":
        return <Ionicons name="calculator-outline" size={22} color="#059669" />;
      case "science":
      case "biology":
        return <Ionicons name="flask-outline" size={22} color="#059669" />;
      case "history":
        return <Ionicons name="time-outline" size={22} color="#059669" />;
      case "english":
      case "language":
        return <Ionicons name="book-outline" size={22} color="#059669" />;
      default:
        return <Ionicons name="book-outline" size={22} color="#059669" />;
    }
  };

  const getBgColorForSubject = (subject: string) => {
    if (!subject) return "bg-emerald-100";

    switch (subject.toLowerCase()) {
      case "math":
      case "mathematics":
        return "bg-emerald-100";
      case "science":
      case "biology":
        return "bg-green-100";
      case "history":
        return "bg-teal-100";
      case "english":
      case "language":
        return "bg-lime-100";
      default:
        return "bg-emerald-100";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const startPomodoroSession = (session: any) => {
    router.push("/students/(drawers)/(tabs)/Schedule");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <View className="bg-white p-8 rounded-3xl items-center shadow-lg">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-emerald-600 mt-4 font-medium text-lg">
            Preparing your dashboard...
          </Text>
        </View>
      </View>
    );
  }

  // Get today's date
  const today = new Date().toLocaleDateString("en-CA");

  // Filter today's sessions
  const todaySessions = studySessions.filter(
    (session) => session.date === today && !session.completed,
  );

  const completedTodaySessions = studySessions.filter(
    (session) => session.date === today && session.completed,
  ).length;

  const totalTodaySessions = todaySessions.length + completedTodaySessions;

  // Calculate card count for each flashcard set
  const flashcardsWithCount = flashcards.map((set) => ({
    ...set,
    cardCount: set.flashcards?.length || 0,
    lastStudied: set.last_reviewed
      ? formatRelativeTime(set.last_reviewed)
      : "Not studied yet",
  }));

  function formatRelativeTime(dateString: string) {
    if (!dateString) return "Not studied yet";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
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

  // Calculate weekly stats
  const weeklyCompleted = studySessions.filter(
    (session) => session.completed,
  ).length;
  const totalPomodoros = studySessions.reduce(
    (acc, session) => acc + (session.pomodoroSessions || 0),
    0,
  );

  return (
    <ScrollView
      className="flex-1 bg-emerald-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#059669"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section with Gradient-like effect */}
      <View
        className="bg-emerald-500 px-6 pt-16 pb-8"
        style={{
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          shadowColor: "#059669",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {/* Decorative elements */}
        <View className="absolute top-8 right-8 w-20 h-20 bg-white/10 rounded-full" />
        <View className="absolute top-24 left-4 w-14 h-14 bg-white/10 rounded-full" />
        <View className="absolute bottom-2 right-20 w-8 h-8 bg-white/10 rounded-full" />

        {/* Greeting */}
        <View className="mb-6">
          <View className="flex-row items-center">
            <Ionicons name="sunny-outline" size={24} color="#D1FAE5" />
            <Text className="text-emerald-100 ml-2 text-lg">{greeting}</Text>
          </View>
          <Text className="text-3xl font-bold text-white mt-1">
            {firstName}! 👋
          </Text>
          <Text className="text-emerald-200 mt-1">
            Ready to crush your goals today?
          </Text>
        </View>

        {/* Stats Cards Row */}
        <View className="flex-row gap-3 -mt-4">
          <View
            className="flex-1 bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#059669",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="bg-emerald-100 rounded-xl p-2">
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color="#059669"
                />
              </View>
              <View className="bg-emerald-50 rounded-full px-2.5 py-0.5">
                <Text className="text-emerald-600 text-xs font-semibold">
                  Today
                </Text>
              </View>
            </View>
            <Text className="text-gray-800 text-3xl font-bold tracking-tight">
              {completedTodaySessions}
            </Text>
            <Text className="text-gray-500 text-sm mt-1 font-medium">
              Sessions Done
            </Text>
          </View>

          <View
            className="flex-1 bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#059669",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="bg-emerald-100 rounded-xl p-2">
                <Ionicons name="timer-outline" size={20} color="#059669" />
              </View>
              <View className="bg-emerald-50 rounded-full px-2.5 py-0.5">
                <Text className="text-emerald-600 text-xs font-semibold">
                  Total
                </Text>
              </View>
            </View>
            <Text className="text-gray-800 text-3xl font-bold tracking-tight">
              {totalPomodoros}
            </Text>
            <Text className="text-gray-500 text-sm mt-1 font-medium">
              Pomodoros
            </Text>
          </View>
        </View>
      </View>

      <View className="px-6 pt-6 pb-8">
        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-5 items-center"
              onPress={() => router.push("/students/(drawers)/(tabs)/Schedule")}
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="bg-emerald-100 rounded-xl p-3 mb-3">
                <Ionicons name="play-circle" size={28} color="#059669" />
              </View>
              <Text className="text-gray-800 font-semibold text-center">
                Start Study
              </Text>
              <Text className="text-gray-500 text-xs mt-1 text-center">
                Begin session
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-5 items-center"
              onPress={() =>
                router.push("/students/(drawers)/(tabs)/FlashCards")
              }
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="bg-green-100 rounded-xl p-3 mb-3">
                <Ionicons name="layers-outline" size={28} color="#059669" />
              </View>
              <Text className="text-gray-800 font-semibold text-center">
                Flashcards
              </Text>
              <Text className="text-gray-500 text-xs mt-1 text-center">
                Review cards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-5 items-center"
              onPress={() => router.push("/students/(drawers)/(tabs)/Schedule")}
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="bg-teal-100 rounded-xl p-3 mb-3">
                <Ionicons name="calendar-outline" size={28} color="#059669" />
              </View>
              <Text className="text-gray-800 font-semibold text-center">
                Schedule
              </Text>
              <Text className="text-gray-500 text-xs mt-1 text-center">
                Plan sessions
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Focus Sessions */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Ionicons name="today-outline" size={22} color="#059669" />
              <Text className="text-xl font-bold text-gray-800 ml-2">
                Today's Focus
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/students/(drawers)/(tabs)/Schedule")}
              className="bg-emerald-100 px-4 py-2 rounded-full"
            >
              <Text className="text-emerald-600 font-semibold text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {totalTodaySessions === 0 ? (
            <View
              className="bg-white rounded-3xl p-8 items-center justify-center"
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="bg-emerald-100 rounded-full p-6 mb-4">
                <Ionicons name="calendar-outline" size={48} color="#059669" />
              </View>
              <Text className="text-gray-800 font-bold text-xl mb-2">
                No Sessions Yet
              </Text>
              <Text className="text-gray-500 text-center mb-6">
                Plan your first study session and start achieving your goals!
              </Text>
              <TouchableOpacity
                className="bg-emerald-500 px-8 py-3 rounded-2xl"
                onPress={() =>
                  router.push("/students/(drawers)/(tabs)/Schedule")
                }
                style={{
                  shadowColor: "#059669",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text className="text-white font-bold ml-2 text-lg">
                    Plan Session
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Progress Bar */}
              {totalTodaySessions > 0 && (
                <View className="bg-white rounded-2xl p-5 mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-800 font-semibold">
                      Daily Progress
                    </Text>
                    <Text className="text-emerald-600 font-bold">
                      {Math.round(
                        (completedTodaySessions / totalTodaySessions) * 100,
                      )}
                      %
                    </Text>
                  </View>
                  <View className="bg-gray-100 rounded-full h-3">
                    <View
                      className="bg-emerald-500 rounded-full h-3"
                      style={{
                        width: `${totalTodaySessions > 0 ? (completedTodaySessions / totalTodaySessions) * 100 : 0}%`,
                        shadowColor: "#059669",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    />
                  </View>
                  <Text className="text-gray-500 text-sm mt-2">
                    {completedTodaySessions} of {totalTodaySessions} sessions
                    completed
                  </Text>
                </View>
              )}

              {/* Session Cards */}
              {todaySessions.map((session) => (
                <View
                  key={session.id}
                  className="bg-white rounded-2xl p-5 mb-3"
                  style={{
                    shadowColor: "#059669",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                    borderLeftWidth: 4,
                    borderLeftColor: "#059669",
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`${getBgColorForSubject(session.subject)} rounded-xl p-3 mr-4`}
                      >
                        {getIconForSubject(session.subject)}
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-800 text-lg">
                          {session.subject || "Study Session"}
                        </Text>
                        {session.topic && (
                          <Text className="text-gray-500 text-sm mt-0.5">
                            {session.topic}
                          </Text>
                        )}
                        <View className="flex-row items-center mt-2">
                          <View className="flex-row items-center mr-3">
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color="#059669"
                            />
                            <Text className="text-gray-500 text-xs ml-1">
                              {formatTime(session.time)}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Ionicons
                              name="hourglass-outline"
                              size={14}
                              color="#059669"
                            />
                            <Text className="text-gray-500 text-xs ml-1">
                              {session.duration} min
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="bg-emerald-500 px-5 py-3 rounded-xl ml-3"
                      onPress={() => startPomodoroSession(session)}
                      style={{
                        shadowColor: "#059669",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                      }}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="play" size={16} color="white" />
                        <Text className="text-white font-semibold ml-1">
                          Start
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Completed Message */}
              {todaySessions.length === 0 && completedTodaySessions > 0 && (
                <View className="bg-emerald-50 rounded-2xl p-6 items-center border-2 border-emerald-200">
                  <Ionicons name="trophy-outline" size={48} color="#059669" />
                  <Text className="text-emerald-700 font-bold text-lg mt-3">
                    All Done! 🎉
                  </Text>
                  <Text className="text-emerald-600 text-center mt-1">
                    You've completed all your sessions for today. Amazing work!
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Recent Flashcards */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Ionicons name="layers-outline" size={22} color="#059669" />
              <Text className="text-xl font-bold text-gray-800 ml-2">
                Flashcard Sets
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push("/students/(drawers)/(tabs)/FlashCards")
              }
              className="bg-emerald-100 px-4 py-2 rounded-full"
            >
              <Text className="text-emerald-600 font-semibold text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {flashcardsWithCount.length === 0 ? (
            <View
              className="bg-white rounded-3xl p-8 items-center justify-center"
              style={{
                shadowColor: "#059669",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="bg-green-100 rounded-full p-6 mb-4">
                <Ionicons name="documents-outline" size={48} color="#059669" />
              </View>
              <Text className="text-gray-800 font-bold text-xl mb-2">
                Create Your First Set
              </Text>
              <Text className="text-gray-500 text-center mb-6">
                Build flashcards to boost your learning and retention!
              </Text>
              <TouchableOpacity
                className="bg-emerald-500 px-8 py-3 rounded-2xl"
                onPress={() =>
                  router.push("/students/(drawers)/(tabs)/FlashCards")
                }
                style={{
                  shadowColor: "#059669",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text className="text-white font-bold ml-2 text-lg">
                    Create Set
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {flashcardsWithCount.slice(0, 4).map((flashcard) => (
                <TouchableOpacity
                  key={flashcard.id}
                  className="bg-white rounded-2xl p-5 mr-4"
                  style={{
                    width: width * 0.42,
                    shadowColor: "#059669",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                  onPress={() =>
                    router.push(`/students/(drawers)/(tabs)/FlashCards`)
                  }
                >
                  <View
                    className={`${getBgColorForSubject(flashcard.subject)} rounded-xl w-14 h-14 items-center justify-center mb-4`}
                  >
                    {getIconForSubject(flashcard.subject)}
                  </View>
                  <Text
                    className="font-bold text-gray-800 mb-1"
                    numberOfLines={2}
                  >
                    {flashcard.title}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="copy-outline" size={14} color="#059669" />
                    <Text className="text-emerald-600 text-sm font-medium ml-1">
                      {flashcard.cardCount} cards
                    </Text>
                  </View>
                  <View className="flex-row items-center pt-2 border-t border-gray-100">
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">
                      {flashcard.lastStudied}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Motivational Section */}
        <View
          className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl p-6 relative overflow-hidden"
          style={{
            backgroundColor: "#059669",
            shadowColor: "#059669",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Decorative circles */}
          <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />

          <View className="flex-row items-start">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Ionicons name="star" size={20} color="#FBBF24" />
                <Text className="text-yellow-300 font-bold ml-2">
                  Study Tip
                </Text>
              </View>
              <Text className="text-white text-lg font-bold leading-relaxed">
                "Small daily improvements are the key to staggering long-term
                results."
              </Text>
              <Text className="text-emerald-200 mt-3 text-sm">
                Keep up the great work! 💪
              </Text>
            </View>
            <Ionicons name="bulb" size={32} color="#FBBF24" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
