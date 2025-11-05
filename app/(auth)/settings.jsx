import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export default function SettingsScreen() {
    const router = useRouter();
    const currentUser = auth().currentUser;
    const email = currentUser?.email || "Not signed in";

    const handleSignOut = async () => {
        try {
            await auth().signOut();
            console.log("User signed out");
        } catch (error) {
            console.error("Sign-out error:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={22} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: wp("6%") }} />
            </View>

            {/* CONTENT */}
            <View style={styles.content}>
                <View style={styles.infoCard}>
                    <Ionicons name="mail-outline" size={22} color="#6d597a" />
                    <Text
                        style={styles.emailText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {String(email)}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                    activeOpacity={0.85}
                >
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC", // soft neutral white-gray
        paddingTop: hp("6%"),
        paddingHorizontal: wp("5%"),
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: hp("4%"),
    },
    backButton: {
        borderRadius: hp("2%"),
        backgroundColor: "#fff",
        padding: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    headerTitle: {
        color: "#111827",
        fontSize: hp("2.8%"),
        fontWeight: "700",
    },

    content: {
        marginTop: hp("2%"),
        alignItems: "center",
    },

    infoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingVertical: hp("2%"),
        paddingHorizontal: wp("4%"),
        width: "100%",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 2,
    },
    emailText: {
        flex: 1,
        fontSize: hp("2%"),
        color: "#333",
        marginLeft: wp("3%"),
    },

    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#cc2f26",
        paddingVertical: hp("1.8%"),
        borderRadius: 12,
        width: "100%",
        marginTop: hp("4%"),
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        elevation: 3,
    },
    signOutText: {
        color: "#fff",
        fontSize: hp("2.1%"),
        fontWeight: "600",
        marginLeft: wp("2%"),
    },
});
