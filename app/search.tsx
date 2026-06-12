import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { searchMeals } from "@/api/themealdb";
import { MealFull } from "@/types/themealdb";

const COLORS = {
  header: "#0D530E",
  bg: "#FBF5DD",
  surface: "#E2EDCF",
  accent: "#306D29",
  text: "#306D29",
  textMuted: "#8FA990",
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MealFull[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMeals(q);
        setResults(data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ingrédient, plat, occasion…"
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <Text style={styles.statusText}>Recherche…</Text>
      ) : results.length === 0 && query.trim().length >= 2 ? (
        <Text style={styles.statusText}>Aucun résultat pour "{query}".</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.idMeal}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/recipe/${item.idMeal}` as any)}
            >
              <Image source={{ uri: item.strMealThumb }} style={styles.resultImage} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={2}>{item.strMeal}</Text>
                <View style={styles.resultMeta}>
                  {!!item.strArea && <Text style={styles.resultMetaText}>🌍 {item.strArea}</Text>}
                  {!!item.strCategory && <Text style={styles.resultMetaText}>{item.strCategory}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.header,
    gap: 10,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 20, color: "#FFF" },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  statusText: {
    textAlign: "center",
    marginTop: 40,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  list: { padding: 20, gap: 12 },
  resultCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    height: 90,
  },
  resultImage: { width: 90, height: 90 },
  resultInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  resultTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text, lineHeight: 18 },
  resultMeta: { flexDirection: "row", gap: 12 },
  resultMetaText: { fontSize: 12, color: COLORS.textMuted },
});