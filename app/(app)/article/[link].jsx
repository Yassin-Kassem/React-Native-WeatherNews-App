import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
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


  return (
    <View style={styles.container}>
      <View style={styles.statusBarBg} />
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/news")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <WebView
        source={{ uri: decodedUrl }}
        startInLoadingState
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
});

