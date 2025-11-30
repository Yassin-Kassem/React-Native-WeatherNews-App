import { Stack } from "expo-router";
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  "Possible Unhandled Promise Rejection", 
  "FirebaseError:", 
  "[auth/invalid-credential]"
]);

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
