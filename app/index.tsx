import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function Index() {
  const router = useRouter();
  const { hasOnboarded, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  console.log(user);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasOnboarded) {
        if (isAuthenticated) {
          // ✅ Check the role before navigating

          if (user?.role === "student") {
            router.replace("/students/(drawers)/(tabs)");
          } else if (user?.role === "teacher") {
            router.replace("/teachers/(drawers)/(tabs)/Index");
          } else if (user?.role === "admin") {
            router.replace("/admin/(drawers)/(tabs)/Index");
          }
        } else {
          router.replace("/LoginScreen");
        }
      } else {
        router.replace("/Onboarding");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasOnboarded, isAuthenticated, user?.role]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#4A90E2" />
    </View>
  );
}
