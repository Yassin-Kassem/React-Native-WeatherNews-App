import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
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
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const router = useRouter();
  const segments = useSegments();
  
  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log("user", user);
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (user) {
      if (!inAuthGroup) router.replace("/weather"); 
    } else {
      if (inAuthGroup) router.replace("/");
    }
  }, [user, initializing]);

  if(initializing) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
