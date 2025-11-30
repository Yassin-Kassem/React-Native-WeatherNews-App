import { Stack } from "expo-router";
import { ActivityIndicator, LogBox } from 'react-native';
import { useAuth } from '../hooks/useAuth';

LogBox.ignoreLogs([
  "Possible Unhandled Promise Rejection", 
  "FirebaseError:", 
  "[auth/invalid-credential]"
]);

export default function RootLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
