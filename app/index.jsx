import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import CustomAlert from '../components/customAlert';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Custom Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('Oops!');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState({
    confirmText: 'OK',
    cancelText: null,
    onConfirm: null,
  });

  const showAlert = (message, title = 'Oops!', buttons = {}) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons({
      confirmText: buttons.confirmText || 'OK',
      cancelText: buttons.cancelText || null,
      onConfirm: buttons.onConfirm || null,
    });
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      showAlert("Please fill in both email and password fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showAlert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(trimmedEmail, trimmedPassword);
      showAlert("Welcome back!", "Success", {
        confirmText: "Continue",
        onConfirm: () => router.push("/weather"),
      });
    } catch (error) {
      console.error("Login error:", error);

      switch (error.code) {
        case "auth/invalid-email":
          showAlert("That email address is invalid. Please check and try again.");
          break;

        case "auth/user-disabled":
          showAlert("This account has been disabled. Please contact support.");
          break;

        case "auth/user-not-found":
          showAlert("No account found with that email address.");
          break;

        case "auth/wrong-password":
          showAlert("Incorrect password. Please try again.");
          break;

        case "auth/invalid-credential":
          showAlert(
            "Your login credentials are invalid or expired. Please try signing in again."
          );
          break;

        case "auth/too-many-requests":
          showAlert(
            "Too many unsuccessful login attempts. Please wait a few minutes before trying again."
          );
          break;

        case "auth/network-request-failed":
          showAlert(
            "Network error. Please check your internet connection and try again."
          );
          break;

        default:
          showAlert(
            "Something went wrong while signing in. Please try again later."
          );
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>CloudWatch</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'email' && styles.inputFocused,
              ]}
              placeholder="you@example.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={[styles.inputContainer, { position: "relative" }]}>
            <Text style={styles.label}>Password</Text>

            <View style={{ position: "relative" }}>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused,
                ]}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={!showPassword} 
                autoCapitalize="none"
                autoComplete="password"
              />

              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: wp("4%"),
                  top: "30%",
                }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>


          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Redirect */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupPrompt}>{"Don't have an account?"} </Text>
            <TouchableOpacity
              onPress={() => router.push('/signup')}
              activeOpacity={0.7}
            >
              <Text style={styles.signupLink}>Create Account</Text>
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

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: wp('7%'),
    paddingVertical: hp('5%'),
    minHeight: hp('100%'),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: hp('4%'),
  },
  title: {
    fontSize: wp('9%'),
    fontWeight: '800',
    color: '#0c4a6e',
    marginBottom: hp('1%'),
    letterSpacing: -1.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#64748b',
    fontWeight: '400',
  },
  formContainer: {
    width: '100%',
    maxWidth: wp('90%'),
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: wp('3.2%'),
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: hp('0.8%'),
    paddingLeft: wp('0.5%'),
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3.5%'),
    paddingHorizontal: wp('4.5%'),
    paddingVertical: hp('1.8%'),
    fontSize: wp('4%'),
    color: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputFocused: {
    borderColor: '#0ea5e9',
    borderWidth: 2,
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  loginButton: {
    backgroundColor: '#0284c7',
    borderRadius: wp('3.5%'),
    paddingVertical: hp('1.8%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1%'),
    shadowColor: '#0284c7',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    minHeight: hp('6%'),
  },
  loginButtonDisabled: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: wp('4%'),
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('2.5%'),
    paddingTop: hp('2%'),
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  signupPrompt: {
    fontSize: wp('3.8%'),
    color: '#64748b',
    fontWeight: '400',
  },
  signupLink: {
    fontSize: wp('3.8%'),
    color: '#0284c7',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
