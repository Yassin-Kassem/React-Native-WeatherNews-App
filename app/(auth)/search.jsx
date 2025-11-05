import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
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

const API_KEY = "1665491abe944d3db6b22407250411";

export default function SearchScreen() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const saveSelectedCity = async (cityName) => {
        try {
            await AsyncStorage.setItem("selectedCity", cityName);
        } catch (e) {
            console.error("Failed to save city", e);
        }
    };

    const searchCities = async (text) => {
        setQuery(text);
        if (text.length < 2) {
            setResults([]);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(
                `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(text)}`
            );
            const data = await res.json();
            if (Array.isArray(data)) setResults(data);
            else setResults([]);
        } catch (e) {
            console.error("Error fetching cities:", e);
        } finally {
            setLoading(false);
        }
    };

    const selectCity = async (cityName) => {
        try {
            await saveSelectedCity(cityName);
            router.replace("/weather");
        } catch (e) {
            console.error("Error selecting city:", e);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={hp("2.8%")} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Search Location</Text>
                <View style={{ width: hp("2.8%") }} />
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={hp("2.4%")} color="#555" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search for a city..."
                    placeholderTextColor="#999"
                    value={query}
                    onChangeText={searchCities}
                    style={styles.input}
                />
            </View>

            {/* Results */}
            {loading ? (
                <ActivityIndicator size="large" color="#333" style={{ marginTop: hp("4%") }} />
            ) : (
                <FlatList
                    data={results}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => `${index}-${item.name}`}
                    ListEmptyComponent={
                        query.length > 1 ? (
                            <Text style={styles.emptyText}>No results found.</Text>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => selectCity(item.name)} style={styles.resultCard}>
                            <View style={styles.resultRow}>
                                <Ionicons
                                    name="location-outline"
                                    size={hp("2.5%")}
                                    color="#007AFF"
                                    style={styles.locationIcon}
                                />
                                <View style={{ flexShrink: 1 }}>
                                    <Text style={styles.cityName} numberOfLines={1} ellipsizeMode="tail">
                                        {item.name}
                                    </Text>
                                    <Text style={styles.region} numberOfLines={1} ellipsizeMode="tail">
                                        {item.region ? `${item.region}, ` : ""}
                                        {item.country}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={hp("2.4%")} color="#999" />
                        </TouchableOpacity>
                    )}
                />
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F8FA", // clean neutral background
        paddingHorizontal: wp("5%"),
        paddingTop: hp("6%"),
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: hp("3%"),
    },
    backButton: {
        backgroundColor: "#EDEDED",
        padding: hp("1%"),
        borderRadius: hp("2%"),
    },
    headerTitle: {
        color: "#1A1A1A",
        fontSize: hp("2.4%"),
        fontWeight: "600",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: hp("1.4%"),
        paddingHorizontal: wp("4%"),
        paddingVertical: hp("1%"),
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 2,
        marginBottom: hp("2%"),
    },
    searchIcon: {
        marginRight: wp("2%"),
    },
    input: {
        flex: 1,
        fontSize: hp("2%"),
        color: "#333",
    },
    resultCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: hp("1.2%"),
        paddingVertical: hp("1.8%"),
        paddingHorizontal: wp("4%"),
        marginVertical: hp("0.7%"),
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 1,
    },
    resultRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    locationIcon: {
        marginRight: wp("3%"),
    },
    cityName: {
        fontSize: hp("2.1%"),
        fontWeight: "600",
        color: "#1a1a1a",
    },
    region: {
        fontSize: hp("1.7%"),
        color: "#777",
    },
    emptyText: {
        textAlign: "center",
        color: "#666",
        marginTop: hp("5%"),
        fontSize: hp("2%"),
    },
});
