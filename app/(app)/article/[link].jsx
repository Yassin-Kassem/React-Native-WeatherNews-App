import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { WebView } from "react-native-webview";

export default function ArticleWebView() {
  const { link } = useLocalSearchParams();
  const decodedUrl = decodeURIComponent(link);
  const router = useRouter();
  const webViewRef = useRef(null);

  // Robust cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (webViewRef.current) {
        try {
          webViewRef.current.stopLoading?.();
          webViewRef.current.injectJavaScript?.("window.stop(); true;");
          webViewRef.current.reload?.();
        } catch (error) {
          console.warn('WebView cleanup error:', error);
        }
      }
    };
  }, []);

  // Fixed navigation: always go to news page explicitly to prevent wrong navigation
  const handleBack = () => {
    // Always replace to /news to prevent stack growth and ensure correct navigation
    router.replace("/news");
  };

  // Error fallback renderer
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#6d597a" />
      <Text style={styles.errorTitle}>Failed to load article</Text>
      <Text style={styles.errorText}>Please try again later</Text>
      <TouchableOpacity onPress={handleBack} style={styles.errorButton}>
        <Text style={styles.errorButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statusBarBg} />
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <WebView
        ref={webViewRef}
        source={{ uri: decodedUrl }}
        startInLoadingState
        setSupportMultipleWindows={false}
        originWhitelist={["*"]}
        cacheEnabled={false}
        incognito={true}
        androidLayerType="hardware"
        androidHardwareAccelerationDisabled={false}
        onLoadEnd={() => webViewRef.current?.clearCache?.(true)}
        renderError={renderError}
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#6d597a" size="large" />
            <Text style={styles.loadingText}>Loading article...</Text>
          </View>
        )}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  statusBarBg: {
    height: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#6d597a",
  },
  headerContainer: {
    backgroundColor: "#6d597a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: hp("2%"),
    paddingBottom: hp("2%"),
    paddingHorizontal: wp("5%"),
    backgroundColor: "#6d597a",
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: hp("1%"),
    borderRadius: hp("2%"),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: wp("6%"),
    fontWeight: "bold",
    textAlign: "left",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: hp("1.5%"),
    fontSize: wp("4%"),
    color: "#6d597a",
    fontWeight: "500",
  },
  webview: { flex: 1 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: wp("10%"),
  },
  errorTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#6d597a",
    marginTop: hp("2%"),
    marginBottom: hp("1%"),
  },
  errorText: {
    fontSize: wp("4%"),
    color: "#64748B",
    textAlign: "center",
    marginBottom: hp("3%"),
  },
  errorButton: {
    backgroundColor: "#6d597a",
    paddingHorizontal: wp("8%"),
    paddingVertical: hp("1.5%"),
    borderRadius: wp("3%"),
  },
  errorButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "600",
  },
});
