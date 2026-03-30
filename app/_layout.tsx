import GlobalActionSheet from "@/components/GlobalActionSheet";
import StudyNotificationService from "@/services/StudyNotificationService";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "../index.css";
import { persistor, store, RootState } from "../redux/store";

// Create a component that will have access to Redux
function AppContent() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const hasCheckedNotifications = useRef(false);

  useEffect(() => {
    // Check notifications only once when app starts and user is authenticated
    if (isAuthenticated && user?.id && !hasCheckedNotifications.current) {
      console.log(
        "📱 Checking study notifications on app start for user:",
        user.id,
      );

      const service = new StudyNotificationService(user.id);

      service
        .setupNotifications()
        .then((success) => {
          if (success) {
            // Check for today's study sessions
            service.checkStudySessionsOnStart();
            hasCheckedNotifications.current = true;
          }
        })
        .catch((error) => {
          console.error("❌ Error initializing notifications:", error);
        });
    }
  }, [isAuthenticated, user?.id]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="OnboardingScreen" />
        <Stack.Screen name="RoleSelectionScreen" />
        <Stack.Screen name="LoginScreen" />
        <Stack.Screen name="RegisterScreen" />
        <Stack.Screen name="ForgotPassword" />
        <Stack.Screen name="students" />
        <Stack.Screen name="admin" />
      </Stack>
      <StatusBar style="dark" />
      <GlobalActionSheet />
    </>
  );
}

// Main RootLayout with Redux Provider
export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        }
        persistor={persistor}
      >
        <AppContent />
      </PersistGate>
    </Provider>
  );
}
