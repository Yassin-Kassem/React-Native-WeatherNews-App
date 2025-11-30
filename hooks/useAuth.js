import auth from "@react-native-firebase/auth";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const subscriber = auth().onAuthStateChanged(
        (user) => {
          try {
            setUser(user);
            setLoading(false);
          } catch (error) {
            setLoading(false);
          }
        },
        (error) => {
          setUser(null);
          setLoading(false);
        }
      );

      return subscriber;
    } catch (error) {
      // Handle subscription errors
      setUser(null);
      setLoading(false);
    }
  }, []);

  return { user, loading };
}

