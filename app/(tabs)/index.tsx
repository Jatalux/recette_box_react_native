import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { getCategories, getCountrys, getMealsByCategory, getMealsByCountry, getMealsByIngredient, getRandom } from "@/api/themealdb";
import { toggleFavorite } from "@/features/Favoris/FavorisSlice";
import { RootState } from "@/store";
import { Category, Country, MealFull, MealThumb } from "@/types/themealdb";

const COLORS = {
  header: "#0D530E",
  bg: "#FBF5DD",
  surface: "#E2EDCF",
  skeletonBase: "#D4E6BB",
  skeletonHighlight: "#EAF3DA",
  accent: "#306D29",
  accentMuted: "#306D29",
  text: "#306D29",
  textMuted: "#8FA990",
  tag: "#C8DBA8",
  tagText: "#0D530E",
};

const FONT = {
  display: { fontSize: 34, fontWeight: "800" as const, letterSpacing: -0.8 },
  title: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3 },
  body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  label: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.2 },
  caption: { fontSize: 12, fontWeight: "400" as const },
};

function SkeletonBox({
  width: w,
  height: h,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius, backgroundColor: COLORS.skeletonBase, opacity },
        style,
      ]}
    />
  );
}

function RecipeCardSkeleton() {
  return (
    <View style={[styles.recipeCard, { backgroundColor: COLORS.surface }]}>
      <SkeletonBox width={90} height={90} borderRadius={0} />
      <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
        <SkeletonBox width="85%" height={13} />
        <SkeletonBox width="60%" height={11} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <SkeletonBox width={55} height={10} />
          <SkeletonBox width={45} height={10} />
        </View>
      </View>
    </View>
  );
}

function QuickCardSkeleton() {
  return (
    <View style={[styles.quickCard, { backgroundColor: COLORS.surface }]}>
      <SkeletonBox width={150} height={110} borderRadius={0} />
      <View style={{ padding: 10, gap: 7 }}>
        <SkeletonBox width="90%" height={12} />
        <SkeletonBox width="65%" height={12} />
      </View>
    </View>
  );
}

function SurpriseCardSkeleton() {
  return (
    <View style={{ marginHorizontal: 20 }}>
      <SkeletonBox width="100%" height={200} borderRadius={20} />
    </View>
  );
}

function CatCardSkeleton() {
  return (
    <View style={[styles.catCard, { backgroundColor: COLORS.surface }]}>
      <SkeletonBox width={100} height={80} borderRadius={0} />
      <View style={{ padding: 8, alignItems: "center" }}>
        <SkeletonBox width={60} height={10} />
      </View>
    </View>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {sub && <Text style={styles.sectionSub}>{sub}</Text>}
    </View>
  );
}

function RecipeCard({ meal }: { meal: MealFull }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.items);
  const isFavorite = favorites.some((m) => m.idMeal === meal.idMeal);

  const { strMeal, strMealThumb, strArea, strCategory } = meal;

  return (
    <TouchableOpacity
      style={styles.recipeCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/recipe/${meal.idMeal}` as any)}
    >
      <Image source={{ uri: strMealThumb }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>{strMeal}</Text>
        <View style={styles.recipeMeta}>
          {!!strArea && <Text style={styles.recipeMetaText}>🌍 {strArea}</Text>}
          {!!strCategory && <Text style={styles.recipeMetaText}>{strCategory}</Text>}
        </View>
      </View>
      <TouchableOpacity
        style={styles.favoriteBtn}
        activeOpacity={0.7}
        onPress={(e) => {
          e.stopPropagation();
          dispatch(toggleFavorite(meal));
        }}
      >
        <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
          {isFavorite ? "♥" : "♡"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function QuickCard({ meal, label }: { meal: MealThumb; label?: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.items);
  const isFavorite = favorites.some((m) => m.idMeal === meal.idMeal);

  const { strMeal, strMealThumb } = meal;

  return (
    <TouchableOpacity
      style={styles.quickCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/recipe/${meal.idMeal}` as any)}
    >
      <Image source={{ uri: strMealThumb }} style={styles.quickImage} />
      {!!label && (
        <View style={styles.quickBadge}>
          <Text style={styles.quickBadgeText}>{label}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.quickFavoriteBtn}
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
      <Text style={styles.quickTitle} numberOfLines={4}>{strMeal}</Text>
    </TouchableOpacity>
  );
}

function PopularSection() {
  const [meals, setMeals] = useState<MealFull[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRandom(),
      getRandom(),
      getRandom(),
    ])
      .then((results) => {
        setMeals(results.filter(Boolean));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <View style={styles.section}>
      <SectionHeader title="Populaires" sub="Cette semaine" />
      {loading
        ? [0, 1, 2].map((i) => <RecipeCardSkeleton key={i} />)
        : meals.length ? meals.map((m) => <RecipeCard key={m.idMeal} meal={m} />) : <View style={styles.errorCard}>
          <Text style={styles.errorSub}>Impossible de charger les populaires.</Text>
        </View>}
    </View>
  );
}

function SurpriseSection() {
  const [meal, setMeal] = useState<MealFull | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchRandom = async () => {
    setLoading(true);

    try {
      const mealRandom = await getRandom();
      setMeal(mealRandom);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setMeal(null);
    }
  };

  useEffect(() => { fetchRandom(); }, []);

  return (
    <View style={styles.section}>
      <SectionHeader title="Une surprise ?" sub="Plat aléatoire" />
      {loading ? (
        <SurpriseCardSkeleton />
      ) : meal ? (
        <TouchableOpacity
          style={styles.surpriseCard}
          activeOpacity={0.9}
          onPress={() => router.push(`/recipe/${meal.idMeal}` as any)}
        >
          <Image source={{ uri: meal.strMealThumb }} style={styles.surpriseImage} />
          <View style={styles.surpriseOverlay} />
          <View style={styles.surpriseContent}>
            <Text style={styles.surpriseName} numberOfLines={2}>{meal.strMeal}</Text>
            <View style={styles.surpriseMeta}>
              {!!meal.strArea && <Text style={styles.surpriseMetaText}>🌍 {meal.strArea}</Text>}
              {!!meal.strCategory && <Text style={styles.surpriseMetaText}>🍽 {meal.strCategory}</Text>}
            </View>
          </View>
          <TouchableOpacity
            style={styles.surpriseBtn}
            onPress={(e) => {
              e.stopPropagation();
              fetchRandom();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.surpriseBtnText}>Autre plat</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ) : <View style={styles.errorCard}>
        <Text style={styles.errorSub}>Impossible de charger un plat random.</Text>
      </View>}
    </View>
  );
}

function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCategories = async () => {
    setLoading(true);

    try {
      const categories = await getCategories();
      setCategories(categories);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setCategories([]);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  return (
    <View style={styles.section}>
      <SectionHeader title="Par catégorie" sub="Choisissez un style" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRow}
      >
        {loading
          ? [0, 1, 2, 3, 4].map((i) => <CatCardSkeleton key={i} />)
          : categories.map((cat) => (
            <TouchableOpacity
              key={cat.idCategory}
              style={styles.catCard}
              onPress={() => router.push(`/category/${cat.strCategory}` as any)}
            >
              <Image source={{ uri: cat.strCategoryThumb }} style={styles.catImage} />
              <Text style={styles.catName} numberOfLines={1}>{cat.strCategory}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
}

function CuisinesSection() {
  const [contrys, setCountrys] = useState<Country[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [meals, setMeals] = useState<MealThumb[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(false);

  const fetchCountry = async () => {
    setLoadingCountries(true);

    try {
      const countries = await getCountrys();
      console.log("countries", countries);
      setCountrys(countries);
      setSelected(countries[0]?.strArea);
    } catch (error) {
      setCountrys([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  useEffect(() => { fetchCountry(); }, []);

  const fetchMealsCountry = async () => {
    if (!selected) return;

    setLoadingMeals(true);

    try {
      const mealsCountry = await getMealsByCountry(selected);
      console.log("mealsCountry", mealsCountry)
      setMeals(mealsCountry.length > 0 ? mealsCountry.slice(0, 6) : []);
      setLoadingMeals(false);
    } catch (error) {
      setMeals([]);
      setLoadingMeals(false);
    }
  }

  useEffect(() => { fetchMealsCountry(); }, [selected]);

  return (
    <View style={styles.section}>
      <SectionHeader title="Par cuisine" sub="Explorer le monde" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {loadingCountries
          ? [0, 1, 2, 3].map((i) => <QuickCardSkeleton key={i} />) : contrys.map((c, idx) => (
            <TouchableOpacity
              key={`${c.strArea}-${idx}`}
              style={[styles.chip, selected === c.strArea && styles.chipActive]}
              onPress={() => setSelected(c.strArea)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selected === c.strArea && styles.chipTextActive]}>
                {c.strArea}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRow}
      >
        {loadingMeals
          ? [0, 1, 2, 3].map((i) => <QuickCardSkeleton key={i} />)
          : meals.length > 0 ? meals.map((m) => <QuickCard key={m.idMeal} meal={m} />) : <View style={styles.errorCard}>
            <Text style={styles.errorSub}>Aucun plat disponible pour le pays {selected}.</Text>
          </View>}
      </ScrollView>
    </View>
  );
}

const INGREDIENTS = [
  { label: "🍗 Poulet", key: "Chicken" },
  { label: "🥩 Bœuf", key: "Beef" },
  { label: "🐟 Saumon", key: "Salmon" },
  { label: "🥕 Carotte", key: "Carrots" },
  { label: "🥚 Œufs", key: "Eggs" },
];

function FridgeSection() {
  const [selected, setSelected] = useState(INGREDIENTS[0].key);
  const [meals, setMeals] = useState<MealThumb[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMealsByIngredient = async () => {
    setLoading(true);

    try {
      const mealsByIngredient = await getMealsByIngredient(selected);
      console.log(mealsByIngredient);
      setMeals(mealsByIngredient.slice(0, 6));
    } catch (error) {
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMealsByIngredient(); }, [selected]);

  return (
    <View style={styles.section}>
      <SectionHeader title="Du frigo au plat" sub="Qu'avez-vous ce soir ?" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {INGREDIENTS.map((ing) => (
          <TouchableOpacity
            key={ing.key}
            style={[styles.chip, selected === ing.key && styles.chipActive]}
            onPress={() => setSelected(ing.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, selected === ing.key && styles.chipTextActive]}>
              {ing.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
        >
          {[0, 1, 2, 3].map((i) => <QuickCardSkeleton key={i} />)}
        </ScrollView>
      ) : meals.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
        >
          {meals.map((m) => <QuickCard key={m.idMeal} meal={m} />)}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>Aucun résultat pour cet ingrédient.</Text>
      )}
    </View>
  );
}

function QuickSection() {
  const [meals, setMeals] = useState<MealThumb[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBreakfast = async () => {
    setLoading(true);

    try {
      const breakfastMeals = await getMealsByCategory("Breakfast");
      setMeals(breakfastMeals);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setMeals([]);
    }
  };

  useEffect(() => { fetchBreakfast(); }, []);

  return (
    <View style={styles.section}>
      <SectionHeader title="Rapides" sub="Prêt en moins de 15 min" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRow}
      >
        {loading
          ? [0, 1, 2, 3].map((i) => <QuickCardSkeleton key={i} />)
          : meals.map((m) => <QuickCard key={m.idMeal} meal={m} label="≤ 15 min" />)}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.85}
          onPress={() => router.push("/search" as any)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Ingrédient, plat, occasion…</Text>
        </TouchableOpacity>

        <PopularSection />
        <SurpriseSection />
        <CategoriesSection />
        <CuisinesSection />
        <FridgeSection />
        <QuickSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.header,
  },
  greeting: { ...FONT.title, color: "#FFFFFF", fontSize: 17 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { ...FONT.body, color: COLORS.textMuted },

  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { ...FONT.title, color: COLORS.text },
  sectionSub: { ...FONT.caption, color: COLORS.accentMuted },

  emptyText: {
    ...FONT.body,
    color: COLORS.textMuted,
    paddingHorizontal: 20,
    fontStyle: "italic",
  },

  recipeCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    height: 90,
  },
  recipeImage: { width: 90, height: 90 },
  recipeInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  recipeTitle: { ...FONT.body, color: COLORS.text, fontWeight: "600", lineHeight: 18 },
  recipeMeta: { flexDirection: "row", gap: 12 },
  recipeMetaText: { ...FONT.caption, color: COLORS.textMuted },

  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickFavoriteBtn: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteIcon: { fontSize: 16, color: COLORS.accent, lineHeight: 18 },
  favoriteIconActive: { color: "#D14B4B" },

  quickRow: { paddingHorizontal: 20, gap: 12 },
  quickCard: { width: 150, backgroundColor: COLORS.surface, borderRadius: 16, overflow: "hidden" },
  quickImage: { width: 150, height: 110 },
  quickBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  quickBadgeText: { ...FONT.label, color: COLORS.accent, fontSize: 10 },
  quickTitle: { ...FONT.body, color: COLORS.text, fontWeight: "500", padding: 10, lineHeight: 18 },

  surpriseCard: { marginHorizontal: 20, borderRadius: 20, overflow: "hidden", height: 200 },
  surpriseImage: { width: "100%", height: 200, position: "absolute" },
  surpriseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,83,14,0.55)",
  },
  surpriseContent: { flex: 1, padding: 16, justifyContent: "flex-end" },
  surpriseName: { ...FONT.title, color: "#FFF", marginBottom: 6 },
  surpriseMeta: { flexDirection: "row", gap: 12 },
  surpriseMetaText: { ...FONT.caption, color: "rgba(255,255,255,0.85)" },
  surpriseBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  surpriseBtnText: { ...FONT.label, color: COLORS.accent, fontSize: 11 },

  catCard: { width: 100, backgroundColor: COLORS.surface, borderRadius: 14, overflow: "hidden", alignItems: "center" },
  catImage: { width: 100, height: 80 },
  catName: { ...FONT.label, color: COLORS.text, padding: 8, textAlign: "center" },

  chipsRow: { paddingHorizontal: 20, gap: 8, marginBottom: 14 },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.accent },
  chipText: { ...FONT.label, color: COLORS.text, fontSize: 12 },
  chipTextActive: { color: "#FFF" },

  errorCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surface,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  errorTitle: {
    ...FONT.title,
    color: COLORS.text,
  },
  errorSub: {
    ...FONT.body,
    color: COLORS.textMuted,
    marginBottom: 8,
  }
});