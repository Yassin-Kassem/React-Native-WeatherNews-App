// imports (same as before)
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
const NEWSDATA_API_KEY = "pub_ffab93546f794a52ad26d4f8de5f312c";

dayjs.extend(relativeTime);

const BASE_URL = "https://newsdata.io/api/1/news";

const categories = [
  "All",
  "Business",
  "Entertainment",
  "Health",
  "Science",
  "Sports",
  "Tech",
  "World",
];

export default function NewsScreen() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async (customQuery) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        apikey: NEWSDATA_API_KEY,
        language: "en",
        ...(category !== "All" ? { category: category.toLowerCase() } : {}),
        ...(customQuery ? { q: customQuery } : {}),
      });

      const res = await fetch(`${BASE_URL}?${params}`);
      const data = await res.json();

      if (data.status === "success" && Array.isArray(data.results)) {
        setArticles(data.results.filter((a) => a.title && a.link));
      } else {
        setArticles([]);
      }
    } catch (_err) {
      setError("Network error");
      setArticles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews(searchTerm);
  }, [fetchNews, searchTerm]);

  const handleSearch = () => {
    Keyboard.dismiss();
    fetchNews(searchTerm);
  };

  const openArticle = (url) => {
    if (!url || !url.startsWith("http")) return;
    router.push({
      pathname: "/article/[link]",
      params: { link: encodeURIComponent(url) },
    });    
  };

  const renderArticle = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => openArticle(item.link)}>
      <View style={styles.card}>
        {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
        {item.category && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.category[0]?.toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.source}>{item.source_id}</Text>
            <Text style={styles.time}>{dayjs(item.pubDate).fromNow()}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Latest News</Text>
        <Text style={styles.headerDate}>{dayjs().format("dddd, MMM D, YYYY")}</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles, topics, sources..."
            placeholderTextColor =  "#A0A0A0"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="arrow-forward-circle" size={26} color="#6d597a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.9}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryButton,
                category === cat && styles.activeCategory,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.activeCategoryText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Articles */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6d597a" />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : articles.length === 0 ? (
        <View style={styles.noResults}>
          <Ionicons name="newspaper-outline" size={50} color="#6d597a" />
          <Text style={styles.noResultsText}>No articles found</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item, index) => item.link + index}
          renderItem={renderArticle}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6d597a"]}
              tintColor="#6d597a"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#6d597a",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("8%"),
    paddingBottom: hp("2%"),
  },
  headerTitle: { color: "white", fontSize: wp("6%"), fontWeight: "bold" },
  headerDate: {
    color: "white",
    opacity: 0.9,
    marginBottom: hp("1%"),
    fontSize: wp("3.5%"),
  },
  searchContainer: {
    backgroundColor: "white",
    borderRadius: wp("2.5%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.8%"),
  },
  searchInput: { 
    flex: 1, 
    paddingLeft: wp("2%"), 
    fontSize: wp("3.5%"), 
  },

  categoriesWrapper: {
    backgroundColor: "#fff",
    paddingVertical: hp("1%"),
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoriesContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: wp("6%"),
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1%"),
    marginRight: wp("2%"),
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    color: "#334155",
    fontSize: 15, // ✅ fixed point size — text renders accurately
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  activeCategory: {
    backgroundColor: "#6d597a",
    borderColor: "#6d597a",
  },
  activeCategoryText: {
    color: "white",
    fontWeight: "700",
  },

  listContent: { paddingHorizontal: wp("5%"), paddingBottom: hp("10%") },
  card: {
    backgroundColor: "white",
    borderRadius: wp("4%"),
    marginBottom: hp("2%"),
    overflow: "hidden",
    elevation: 3,
  },
  image: { width: "100%", height: hp("25%") },
  tagContainer: {
    position: "absolute",
    top: hp("1%"),
    left: wp("3%"),
    backgroundColor: "#6d597a",
    borderRadius: wp("2%"),
    paddingHorizontal: wp("2.5%"),
    paddingVertical: hp("0.3%"),
    maxWidth: wp("40%"),
  },
  tagText: {
    color: "white",
    fontSize: wp("2.8%"),
    fontWeight: "600",
  },
  cardContent: { padding: wp("4%") },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  source: { color: "#6d597a", fontWeight: "600", fontSize: wp("3.2%") },
  time: { color: "#64748B", fontSize: wp("3.2%") },
  title: {
    fontSize: wp("4.3%"),
    fontWeight: "700",
    color: "#0F172A",
    marginVertical: hp("0.8%"),
  },
  description: { color: "#475569", fontSize: wp("3.5%") },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp("3%"),
    marginTop: hp("1%"),
  },
  loaderContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: {
    color: "#6d597a",
    marginTop: hp("1%"),
    fontSize: wp("3.8%"),
    fontWeight: "500",
  },
  noResults: { alignItems: "center", marginTop: hp("10%") },
  noResultsText: {
    color: "#6d597a",
    fontSize: wp("4%"),
    marginTop: hp("1%"),
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginTop: hp("3%"),
    fontSize: wp("4%"),
  },
});

