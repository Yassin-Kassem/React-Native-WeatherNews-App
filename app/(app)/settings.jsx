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
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            {/* CONTENT */}
            <View style={styles.content}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={hp("4%")} color="#1261A0" />
                    </View>
                    <Text style={styles.profileName}>Account</Text>
                </View>

                {/* Account Info Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="mail-outline" size={hp("2.5%")} color="#1261A0" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email Address</Text>
                            <Text
                                style={styles.emailText}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {String(email)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Sign Out Button */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={styles.signOutButton}
                        onPress={handleSignOut}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="log-out-outline" size={hp("2.5%")} color="#fff" />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC", // soft neutral white-gray
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#1261A0",
        paddingTop: hp("8%"),
        paddingBottom: hp("2%"),
        paddingHorizontal: wp("5%"),
    },
    headerTitle: {
        color: "#fff",
        fontSize: wp("9%"),
        fontWeight: "bold",
    },

    content: {
        flex: 1,
        paddingTop: hp("3%"),
        paddingHorizontal: wp("5%"),
    },

    profileSection: {
        alignItems: "center",
        marginBottom: hp("4%"),
    },
    avatarContainer: {
        width: hp("10%"),
        height: hp("10%"),
        borderRadius: hp("5%"),
        backgroundColor: "#E3F2FD",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: hp("1.5%"),
        borderWidth: 3,
        borderColor: "#1261A0",
    },
    profileName: {
        fontSize: wp("5%"),
        fontWeight: "700",
        color: "#1a1a1a",
        letterSpacing: 0.3,
    },

    section: {
        marginBottom: hp("3%"),
    },
    sectionTitle: {
        fontSize: wp("3.5%"),
        fontWeight: "600",
        color: "#64748b",
        marginBottom: hp("1.5%"),
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    infoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: wp("3%"),
        paddingVertical: hp("2.5%"),
        paddingHorizontal: wp("4%"),
        width: "100%",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    iconContainer: {
        width: hp("5%"),
        height: hp("5%"),
        borderRadius: hp("2.5%"),
        backgroundColor: "#E3F2FD",
        justifyContent: "center",
        alignItems: "center",
        marginRight: wp("3%"),
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: wp("3%"),
        fontWeight: "500",
        color: "#64748b",
        marginBottom: hp("0.3%"),
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    emailText: {
        fontSize: wp("4%"),
        fontWeight: "600",
        color: "#1a1a1a",
    },

    actionSection: {
        marginTop: hp("2%"),
        marginBottom: hp("3%"),
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#dc2626",
        paddingVertical: hp("2%"),
        borderRadius: wp("3%"),
        width: "100%",
        shadowColor: "#dc2626",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    signOutText: {
        color: "#fff",
        fontSize: wp("4%"),
        fontWeight: "700",
        marginLeft: wp("2%"),
        letterSpacing: 0.5,
    },
});

