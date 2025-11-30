import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CustomAlert from "../../components/customAlert";

const API_KEY = "1665491abe944d3db6b22407250411";

const WeatherScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [city, setCity] = useState(null);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertButtons, setAlertButtons] = useState({
        confirmText: "OK",
        cancelText: null,
        onConfirm: null,
    });

    const showAlert = (message, title = "Alert", buttons = {}) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertButtons({
            confirmText: buttons.confirmText || "OK",
            cancelText: buttons.cancelText || null,
            onConfirm: buttons.onConfirm || null,
        });
        setAlertVisible(true);
    };

    const saveSelectedCity = async (cityName) => {
        try {
            await AsyncStorage.setItem("selectedCity", cityName);
        } catch (e) {
            console.error("Failed to save city", e);
        }
    };

    const getSelectedCity = async () => {
        try {
            const value = await AsyncStorage.getItem("selectedCity");
            return value;
        } catch (e) {
            console.error("Failed to load city", e);
            return null;
        }
    };

    // ✅ Fetch weather by city name or coordinates (optimized)
    const fetchWeather = async (cityNameOrCoords) => {
        try {
            setLoading(true);
            // Support both city name (string) and coordinates (object with lat/lon)
            const query = typeof cityNameOrCoords === 'string' 
                ? encodeURIComponent(cityNameOrCoords)
                : `${cityNameOrCoords.latitude},${cityNameOrCoords.longitude}`;
            
            const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=6&aqi=no&alerts=no`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                showAlert(
                    data.error?.message || "Unable to fetch weather data.",
                    "WeatherAPI Error"
                );
                throw new Error(data.error?.message || "Error fetching weather");
            }

            setWeather(data);
            setError(null);
        } catch (err) {
            console.error("Weather fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch user's current location and weather (optimized - uses coordinates directly)
    const fetchWeatherByLocation = async () => {
        try {
            setLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setError("Location permission denied");
                setLoading(false);
                return;
            }

            // Use Balanced accuracy for faster location (instead of BestAvailable)
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                maximumAge: 60000, // Use cached location if less than 1 minute old
                timeout: 10000, // 10 second timeout
            });

            const { latitude, longitude } = loc.coords;
            
            // Fetch weather directly with coordinates (faster than reverse geocoding first)
            await fetchWeather({ latitude, longitude });
            
            // Get city name in parallel (non-blocking) for display
            Location.reverseGeocodeAsync({ latitude, longitude })
                .then((reverse) => {
                    if (reverse?.length > 0) {
                        const locationData = reverse[0];
                        const cityName =
                            locationData.city || locationData.subregion || locationData.region || "Unknown";
                        setCity(cityName);
                        saveSelectedCity(cityName); // Save in background
                    }
                })
                .catch((err) => {
                    console.log("Reverse geocoding failed (non-critical):", err);
                    // Set a fallback city name from coordinates
                    setCity(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                });
        } catch (err) {
            console.error("Error detecting location:", err);
            setError(err.message);

            // Show alert when location fails
            showAlert(
                "We couldn't detect your location. Please select a city manually.",
                "Location Unavailable",
                {
                    confirmText: "Choose City",
                    onConfirm: () => router.push("/search"),
                }
            );
        } finally {
            setLoading(false);
        }
    };

    // Manual refresh button action (optimized)
    const handleRefreshLocation = async () => {
        try {
            setLoading(true);
            setError(null); // Clear any previous errors
            
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                showAlert(
                    "Location permission is required to refresh your current location.",
                    "Permission Denied",
                    {
                        confirmText: "OK",
                    }
                );
                setError("Location permission denied");
                setLoading(false);
                return;
            }

            // Use Balanced accuracy for faster location
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                maximumAge: 30000, // Use cached location if less than 30 seconds old
                timeout: 10000, // 10 second timeout
            });

            const { latitude, longitude } = loc.coords;
            
            // Fetch weather directly with coordinates (faster)
            await fetchWeather({ latitude, longitude });
            setError(null); // Clear error on success
            
            // Get city name in parallel (non-blocking)
            Location.reverseGeocodeAsync({ latitude, longitude })
                .then((reverse) => {
                    if (reverse?.length > 0) {
                        const locationData = reverse[0];
                        const cityName =
                            locationData.city || locationData.subregion || locationData.region || "Unknown";
                        setCity(cityName);
                        saveSelectedCity(cityName); // Save in background
                    }
                })
                .catch((err) => {
                    console.log("Reverse geocoding failed (non-critical):", err);
                    setCity(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                });
        } catch (err) {
            console.error("Error refreshing location:", err);
            const errorMessage = err.message || "Failed to refresh location";
            setError(errorMessage);
            showAlert(
                "We couldn't refresh your location. Please try again or select a city manually.",
                "Location Refresh Failed",
                {
                    confirmText: "Choose City",
                    onConfirm: () => router.push("/search"),
                }
            );
        } finally {
            setLoading(false);
        }
    };

    // Lifecycle hooks
    useFocusEffect(
        useCallback(() => {
            const loadWeather = async () => {
                try {
                    const savedCity = await AsyncStorage.getItem("selectedCity");
                    if (savedCity) {
                        setCity(savedCity);
                        await fetchWeather(savedCity);
                    } else {
                        await fetchWeatherByLocation();
                    }
                } catch (e) {
                    console.error("Error loading city:", e);
                    await fetchWeatherByLocation();
                }
            };

            loadWeather();
        }, [])
    );

    useEffect(() => {
        if (params.updated) {
            (async () => {
                const storedCity = await getSelectedCity();
                if (storedCity) {
                    setCity(storedCity);
                    await fetchWeather(storedCity);
                }
            })();
        }
    }, [params.updated]);

    // Helpers
    const formatHeaderDate = useMemo(() => {
        const now = new Date();
        return now.toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }, []);

    const toDayAbbrev = (isoDate) => {
        try {
            return new Date(isoDate).toLocaleDateString(undefined, { weekday: "short" });
        } catch {
            return "";
        }
    };

    const iconForCondition = (text) => {
        if (!text) return "cloud-outline";
        const t = String(text).toLowerCase();
        if (t.includes("rain") || t.includes("drizzle")) return "rainy-outline";
        if (t.includes("storm") || t.includes("thunder")) return "thunderstorm-outline";
        if (t.includes("snow") || t.includes("sleet")) return "snow-outline";
        if (t.includes("cloud")) return "cloud-outline";
        if (t.includes("sun") || t.includes("clear")) return "sunny-outline";
        return "partly-sunny-outline";
    };

    const ForecastRow = ({ day, icon, high, low, progress }) => (
        <View style={styles.row}>
            <Text style={styles.dayText}>{day}</Text>
            <Ionicons style={styles.weatherIcon} name={icon} />
            <Text style={styles.tempText}>{high}°</Text>
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
            </View>
            <Text style={styles.tempText}>{low}°</Text>
        </View>
    );

    // Loading / error states
    if (loading) {
        return (
            <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error && !weather) {
        return (
            <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
                <Text style={{ color: "red" }}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never" contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Forecast</Text>
                        <Text style={styles.headerDate}>{formatHeaderDate}</Text>
                    </View>

                    <TouchableOpacity 
                        onPress={handleRefreshLocation} 
                        style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons
                                name="location-outline"
                                size={22}
                                color="#fff"
                            />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.locationBar}>
                        <View style={styles.locationLeft}>
                            <Ionicons name="navigate-circle-outline" style={styles.locationIcon} />
                            <Text style={styles.locationText}>{city || "..."}</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push("/search")}>
                            <Text style={styles.changeButton}>Change</Text>
                        </TouchableOpacity>
                    </View>

                    {/* WEATHER CARD */}
                    <LinearGradient
                        colors={["#2E7DFF", "#1FB5E8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.weatherCard}
                    >
                        <View style={styles.cloudContainer}>
                            <Ionicons
                                name={iconForCondition(weather?.current?.condition?.text)}
                                size={hp("5%")}
                                color="#fff"
                            />
                        </View>
                        <Text style={styles.temperature}>
                            {Math.round(weather?.current?.temp_c ?? 0)}°
                        </Text>
                        <Text style={styles.weatherCondition}>
                            {weather?.current?.condition?.text || ""}
                        </Text>
                        <Text style={styles.feelsLike}>
                            Feels like {Math.round(weather?.current?.feelslike_c ?? 0)}°C
                        </Text>

                        {/* STATS GRID */}
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <View style={styles.statHeader}>
                                    <Ionicons name="airplane-outline" style={styles.statIcon} />
                                    <Text style={styles.statLabel}>Wind Speed</Text>
                                </View>
                                <Text style={styles.statValue}>
                                    {Math.round(weather?.current?.wind_kph ?? 0)} km/h
                                </Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statHeader}>
                                    <Ionicons name="water-outline" style={styles.statIcon} />
                                    <Text style={styles.statLabel}>Humidity</Text>
                                </View>
                                <Text style={styles.statValue}>
                                    {Math.round(weather?.current?.humidity ?? 0)}%
                                </Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statHeader}>
                                    <Ionicons name="eye-outline" style={styles.statIcon} />
                                    <Text style={styles.statLabel}>Visibility</Text>
                                </View>
                                <Text style={styles.statValue}>{weather?.current?.vis_km ?? 0} km</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statHeader}>
                                    <Ionicons name="speedometer-outline" style={styles.statIcon} />
                                    <Text style={styles.statLabel}>Pressure</Text>
                                </View>
                                <Text style={styles.statValue}>
                                    {Math.round(weather?.current?.pressure_mb ?? 0)} mb
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* 7-DAY FORECAST */}
                    {!!weather?.forecast?.forecastday?.length && (
                        <View style={styles.forecastCard}>
                            <View style={styles.forecastHeader}>
                                <Text style={styles.forecastTitle}>7-Day Forecast</Text>
                            </View>
                            <View style={styles.forecastList}>
                                {weather.forecast.forecastday.slice(0, 7).map((f, index) => (
                                    <ForecastRow
                                        key={index}
                                        day={toDayAbbrev(f?.date)}
                                        icon={iconForCondition(f?.day?.condition?.text)}
                                        high={Math.round(f?.day?.maxtemp_c ?? 0)}
                                        low={Math.round(f?.day?.mintemp_c ?? 0)}
                                        progress={Number(f?.day?.daily_chance_of_rain ?? 0) / 100}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

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
        </View>
    );
};

export default WeatherScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1
    },
    header: {
        paddingTop: hp("8%"),
        paddingBottom: hp("2%"),
        paddingHorizontal: wp("5%"),
        backgroundColor: "#1261A0",
        flexDirection: "row"
    },
    headerTitle: {
        fontSize: hp('4%'),
        fontWeight: "bold",
        color: "white",
        marginBottom: hp('0.5%')
    },
    headerDate: {
        fontSize: hp('2%'),
        color: 'rgba(255, 255, 255, 0.9)',
    },
    content: {
        paddingHorizontal: wp("5%"),
        paddingTop: hp("2%"),
        paddingBottom: hp("5%"),
    },
    refreshButton: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        width: wp("10%"),
        padding: hp("1%"),
        borderRadius: hp("2.5%"),
        alignItems: "center",
        justifyContent: "center",
        height: hp("5%"),
        marginLeft: wp("25%"),
    },
    refreshButtonDisabled: {
        opacity: 0.6,
    },
    locationBar: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
    },
    locationLeft: {
        flexDirection: "row",
        alignItems: "center"
    },
    locationIcon: {
        fontSize: hp('2.8%'),
        marginRight: wp('2%'),
        color: "#1261A0"
    },
    locationText: {
        fontSize: hp('2%'),
        fontWeight: "500",
        flexShrink: 1,
        textAlignVertical: "center",
        marginHorizontal: wp("2.5%"),
        width: '65%',
    },

    changeButton: {
        fontSize: hp('1.9%'),
        color: '#1E6FFF',
        fontWeight: '600',
    },
    weatherCard: {
        borderRadius: hp("4%"),
        padding: hp("4%"),
        marginBottom: hp("2.5%"),
        marginTop: hp("2%")
    },
    temperature: {
        fontSize: hp('9%'),
        fontWeight: '200',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: -4,
        marginBottom: hp('0.5%'),
    },
    weatherCondition: {
        fontSize: hp('2.5%'),
        fontWeight: '500',
        color: '#fff',
        textAlign: 'center',
        marginBottom: hp('0.3%'),
    },
    feelsLike: {
        fontSize: hp('1.8%'),
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        marginBottom: hp('2.5%'),
    },
    cloudContainer: {
        alignSelf: 'center',
        marginBottom: hp('1.5%'),
        marginTop: hp('0.5%'),
        height: hp('5%'),
    },
    cloudPart: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    statCard: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: wp('4%'),
        padding: wp('3.5%'),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: hp('1.5%'), // Vertical spacing between rows
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('0.8%'),
        paddingRight: wp('1%'),
    },
    statIcon: {
        fontSize: hp('2.2%'),
        marginRight: wp('1.5%'),
        color: 'rgba(255, 255, 255, 0.9)',
    },
    statLabel: {
        fontSize: hp('1.5%'),
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
        paddingRight: wp('0.5%'),
    },
    statValue: {
        fontSize: hp('2.2%'),
        color: '#fff',
        fontWeight: '600',
    },
    forecastCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: wp('4%'),
        padding: wp('5%'),
        marginVertical: hp('2%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    forecastHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('2%'),
    },
    forecastTitle: {
        fontSize: hp('2.3%'),
        fontWeight: '600',
        color: '#1a1a1a',
    },
    linkButton: {
        fontSize: hp('1.5%'),
        color: '#1E6FFF',
        fontWeight: '500',
    },
    forecastList: {
        gap: hp('1.5%'),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp('1.2%'),
    },
    dayText: {
        width: wp('12%'),
        fontSize: hp('1.9%'),
        color: '#333',
        fontWeight: '500',
    },
    weatherIcon: {
        width: wp('10%'),
        fontSize: hp('2.8%'),
        textAlign: 'center',
        color: "#1261A0"
    },
    tempText: {
        width: wp('12%'),
        fontSize: hp('1.9%'),
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
    },
    progressBarContainer: {
        flex: 1,
        marginHorizontal: wp('3%'),
    },
    progressBarBg: {
        height: hp('0.6%'),
        backgroundColor: '#E0E0E0',
        borderRadius: hp('0.3%'),
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1E6FFF',
        borderRadius: hp('0.3%'),
    },
});

