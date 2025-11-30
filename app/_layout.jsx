import auth from '@react-native-firebase/auth';
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, LogBox } from 'react-native';

export default function RootLayout() {

  LogBox.ignoreLogs([
    "Possible Unhandled Promise Rejection", 
    "FirebaseError:", 
    "[auth/invalid-credential]"
  ]);

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const segments = useSegments();

  const onAuthStateChanged = (user) => {
    console.log("Auth state changed:", user ? "User logged in" : "User logged out");
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;
  
    const inAuthGroup = segments[0] === "(auth)";
    const inArticleGroup = segments[0] === "article";
    const isOnLoginPage = segments.length === 0 || segments[0] === "index" || segments[0] === "signup";
  
    if (user) {
      if (isOnLoginPage) {
        router.replace("/weather");
      }
      return;
    }
  
    if (!user) {
      if (inAuthGroup || inArticleGroup) {
        router.replace("/");
      }
      return;
    }
  
  }, [user, initializing, segments]);
  

  if (initializing) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
