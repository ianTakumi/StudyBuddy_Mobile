import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import client from "@/utils/axiosInstance";

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  date: string; // "2026-03-30"
  time: string; // "15:00:00"
  duration: number;
  pomodoro_sessions: number;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

class StudyNotificationService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async setupNotifications() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("❌ Notification permissions not granted");
        return false;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      this.setupNotificationListeners();
      console.log("✅ Study notification service initialized");
      return true;
    } catch (error) {
      console.error("❌ Error setting up notifications:", error);
      return false;
    }
  }

  private async fetchStudySessions(): Promise<StudySession[]> {
    try {
      const response = await client.get(`/study-sessions/${this.userId}`);

      if (response.data.success && Array.isArray(response.data.data)) {
        // Filter out completed sessions
        const activeSessions = response.data.data.filter(
          (session: StudySession) => !session.completed,
        );
        console.log(`📚 Found ${activeSessions.length} active study sessions`);
        return activeSessions;
      }
      return [];
    } catch (error) {
      console.error("❌ Error fetching study sessions:", error);
      return [];
    }
  }

  // Format time from "15:00:00" to "3:00 PM"
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours);
    const minute = minutes;
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    hour = hour ? hour : 12; // Convert 0 to 12

    return `${hour}:${minute} ${ampm}`;
  }

  // Get today's date in YYYY-MM-DD format (Philippine time)
  private getTodayDate(): string {
    const now = new Date();
    // Add 8 hours for Philippine time
    const phTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    return phTime.toISOString().split("T")[0];
  }

  // Check if session is today
  private isSessionToday(session: StudySession): boolean {
    const today = this.getTodayDate();
    return session.date === today;
  }

  // Send notification for today's study sessions
  private async sendDailySummaryNotification(sessions: StudySession[]) {
    const sessionCount = sessions.length;

    let title = "📚 Study Session Today!";
    let body = "";

    if (sessionCount === 1) {
      const session = sessions[0];
      const formattedTime = this.formatTime(session.time);
      const sessionName = session.topic || session.subject;
      body = `You have a study session for "${sessionName}" at ${formattedTime}. Don't forget to study! 📖`;
    } else {
      const sessionList = sessions
        .map((s) => {
          const formattedTime = this.formatTime(s.time);
          return `${s.topic || s.subject} (${formattedTime})`;
        })
        .join(", ");
      body = `You have ${sessionCount} study sessions today: ${sessionList}. Don't forget to study! 📖`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: "study_session_daily",
          date: this.getTodayDate(),
          sessionCount,
          sessions: sessions.map((s) => ({
            id: s.id,
            topic: s.topic,
            subject: s.subject,
            time: s.time,
            formattedTime: this.formatTime(s.time),
          })),
        },
        sound: true,
      },
      trigger: null, // Show immediately
    });

    console.log(`📨 Sent daily study notification: ${body}`);
  }

  // Main method to check and send notifications (called on app start)
  async checkStudySessionsOnStart() {
    console.log("🔍 Checking study sessions on app start...");

    try {
      const sessions = await this.fetchStudySessions();

      if (sessions.length === 0) {
        console.log("📚 No active study sessions found");
        return;
      }

      const today = this.getTodayDate();
      console.log(`📅 Today's date (Philippine): ${today}`);

      // Filter sessions for today
      const todaySessions = sessions.filter((session) =>
        this.isSessionToday(session),
      );

      if (todaySessions.length === 0) {
        console.log("📭 No study sessions for today");
        return;
      }

      console.log(
        `✅ Found ${todaySessions.length} study session(s) for today`,
      );
      todaySessions.forEach((s) => {
        const formattedTime = this.formatTime(s.time);
        console.log(`   - ${s.topic || s.subject} at ${formattedTime}`);
      });

      // Send ONE notification for all today's sessions
      await this.sendDailySummaryNotification(todaySessions);
    } catch (error) {
      console.error("❌ Error checking study sessions:", error);
    }
  }

  // Handle notification taps - Navigate to Schedule screen
  private setupNotificationListeners() {
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("👆 Notification tapped:", data);

      if (data?.type === "study_session_daily") {
        // Navigate to Schedule screen
        router.push("/students/(drawers)/(tabs)/Schedule");
        console.log("📱 Navigated to Schedule screen");
      }
    });
  }

  // Send test notification
  async sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🧪 Test Notification",
        body: "This is a test notification for study sessions.",
        data: { type: "test" },
        sound: true,
      },
      trigger: null,
    });
    console.log("📨 Sent test notification");
  }
}

export default StudyNotificationService;
