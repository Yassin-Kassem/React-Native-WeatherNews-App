import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomAlert from "../../components/customAlert";

const SignUp = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("Oops!");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtons, setAlertButtons] = useState({
    confirmText: "OK",
    cancelText: null,
    onConfirm: null,
  });

  const showAlert = (message, title = "Oops!", buttons = {}) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons({
      confirmText: buttons.confirmText || "OK",
      cancelText: buttons.cancelText || null,
      onConfirm: buttons.onConfirm || null,
    });
    setAlertVisible(true);
  };

  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedPassword ||
      !trimmedConfirmPassword
    ) {
      showAlert("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showAlert("Please enter a valid email address.");
      return;
    }

    if (trimmedPassword.length < 6) {
      showAlert("Password must be at least 6 characters long.");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      showAlert("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(
        trimmedEmail,
        trimmedPassword
      );
      // Protected routes will handle navigation automatically
      showAlert("Account created successfully!", "Success");
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        showAlert("That email address is already in use.");
      } else if (error.code === "auth/invalid-email") {
        showAlert("That email address is invalid.");
      } else if (error.code === "auth/weak-password") {
        showAlert("Password should be at least 6 characters.");
      } else {
        showAlert("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>CloudWatch</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "name" && styles.inputFocused,
              ]}
              placeholder="Name"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "email" && styles.inputFocused,
              ]}
              placeholder="you@example.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  focusedInput === "password" && styles.inputFocused,
                ]}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  focusedInput === "confirmPassword" && styles.inputFocused,
                ]}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput("confirmPassword")}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={styles.eyeButton}
              >
                <Ionicons
                  name={
                    showConfirmPassword ? "eye-outline" : "eye-off-outline"
                  }
                  size={22}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Real-time mismatch warning */}
            {confirmPassword && confirmPassword !== password && (
              <Text
                style={{
                  color: "red",
                  fontSize: wp("3.2%"),
                  marginTop: hp("0.5%"),
                  marginLeft: wp("1%"),
                }}
              >
                Passwords do not match
              </Text>
            )}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.signupButton,
              loading && styles.signupButtonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Already have account */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        confirmText={alertButtons.confirmText}
        cancelText={alertButtons.cancelText}
        onClose={() => setAlertVisible(false)}
        onConfirm={
          alertButtons.onConfirm
            ? () => {
              alertButtons.onConfirm();
              setAlertVisible(false);
            }
            : () => setAlertVisible(false)
        }
      />
    </KeyboardAvoidingView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#fff" 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: wp("7%"),
    paddingVertical: hp("5%"),
  },
  headerContainer: { 
    alignItems: "center", 
    marginBottom: hp("3%") 
  },
  title: {
    fontSize: wp("9%"),
    fontWeight: "800",
    color: "#0c4a6e",
    marginBottom: hp("0.8%"),
    letterSpacing: -1.2,
    textAlign: "center",
  },
  subtitle: {
    fontSize: wp("4%"),
    color: "#64748b",
    fontWeight: "400",
  },
  formContainer: {
    width: "100%",
    maxWidth: wp("90%"),
    alignSelf: "center",
  },
  inputContainer: { 
    marginBottom: hp("1.8%") 
  },
  label: {
    fontSize: wp("3.2%"),
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: hp("0.6%"),
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: wp("3.5%"),
    paddingHorizontal: wp("4.5%"),
    paddingVertical: hp("1.6%"),
    fontSize: wp("4%"),
    color: "#0f172a",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  passwordWrapper: { 
    position: "relative", 
    justifyContent: "center" 
  },
  passwordInput: { 
    paddingRight: wp("10%") 
  },
  eyeButton: {
    position: "absolute",
    right: wp("3%"),
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  inputFocused: {
    borderColor: "#0ea5e9",
    borderWidth: 2,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  signupButton: {
    backgroundColor: "#0284c7",
    borderRadius: wp("3.5%"),
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("0.8%"),
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  signupButtonDisabled: { 
    opacity: 0.65 
  },
  signupButtonText: {
    color: "#ffffff",
    fontSize: wp("4%"),
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("2%"),
    paddingTop: hp("1.5%"),
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  loginPrompt: {
    fontSize: wp("3.8%"),
    color: "#64748b",
    fontWeight: "400",
  },
  loginLink: {
    fontSize: wp("3.8%"),
    color: "#0284c7",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

