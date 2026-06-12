import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { getMealsByCategory } from "@/api/themealdb";
import { toggleFavorite } from "@/features/Favoris/FavorisSlice";
import { RootState } from "@/store";
import { MealFull, MealThumb } from "@/types/themealdb";

const COLORS = {
  header: "#0D530E",
  bg: "#FBF5DD",
  surface: "#E2EDCF",
  accent: "#306D29",
  text: "#306D29",
  textMuted: "#8FA990",
};

const FONT = {
  title: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3 },
  body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: "400" as const },
};

function MealCard({ meal }: { meal: MealThumb }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.items);
  const isFavorite = favorites.some((m) => m.idMeal === meal.idMeal);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/recipe/${meal.idMeal}` as any)}
    >
      <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{meal.strMeal}</Text>
      </View>
      <TouchableOpacity
        style={styles.favoriteBtn}
        activeOpacity={0.7}
        onPress={(e) => {
          e.stopPropagation();
          dispatch(toggleFavorite(meal as unknown as MealFull));
        }}
      >
        <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
          {isFavorite ? "♥" : "♡"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function CategoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();

  const [meals, setMeals] = useState<MealThumb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchMeals = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await getMealsByCategory(name);
        if (!cancelled) setMeals(result);
      } catch (error) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (name) fetchMeals();
    return () => { cancelled = true; };
  }, [name]);

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Chargement…</Text>
        </View>
      ) : error || meals.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Aucune recette trouvée pour "{name}".</Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.idMeal}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => <MealCard meal={item} />}
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.header,
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 20, color: "#FFF" },
  headerTitle: { ...FONT.title, color: "#FFF", flex: 1, textAlign: "center" },

  list: { padding: 16, gap: 12 },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: { width: "100%", height: 120 },
  info: { padding: 10 },
  title: { ...FONT.body, color: COLORS.text, fontWeight: "600", lineHeight: 18 },

  favoriteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteIcon: { fontSize: 16, color: COLORS.accent, lineHeight: 18 },
  favoriteIconActive: { color: "#D14B4B" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  muted: { ...FONT.body, color: COLORS.textMuted, textAlign: "center" },
});