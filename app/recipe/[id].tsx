import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { getMealById } from "@/api/themealdb";
import { toggleFavorite } from "@/features/Favoris/FavorisSlice";
import { RootState } from "@/store";
import { MealFull } from "@/types/themealdb";

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
  }, []);

  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius, backgroundColor: COLORS.skeletonBase, opacity },
        style,
      ]}
    />
  );
}

function DetailSkeleton() {
  return (
    <View>
      <SkeletonBox width="100%" height={280} borderRadius={0} />
      <View style={{ padding: 20, gap: 14 }}>
        <SkeletonBox width="80%" height={28} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <SkeletonBox width={80} height={24} borderRadius={20} />
          <SkeletonBox width={90} height={24} borderRadius={20} />
        </View>
        <SkeletonBox width="100%" height={16} />
        <SkeletonBox width="100%" height={16} />
        <SkeletonBox width="60%" height={16} />
        <View style={{ marginTop: 12, gap: 10 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} width="100%" height={40} borderRadius={12} />
          ))}
        </View>
      </View>
    </View>
  );
}

function getIngredients(meal: MealFull) {
  const list: { ingredient: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      list.push({ ingredient: ingredient.trim(), measure: (measure ?? "").trim() });
    }
  }
  return list;
}

function getYoutubeId(url?: string | null) {
  if (!url) return null;
  const match = url.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch();

  const [meal, setMeal] = useState<MealFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const favorites = useSelector((state: RootState) => state.favorites.items);
  const isFavorite = !!meal && favorites.some((m) => m.idMeal === meal.idMeal);

  useEffect(() => {
    let active = true;

    const fetchMeal = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await getMealById(id);
        if (active) {
          setMeal(result ?? null);
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    if (id) fetchMeal();
    return () => {
      active = false;
    };
  }, [id]);

  const handleToggleFavorite = () => {
    if (meal) dispatch(toggleFavorite(meal));
  };

  const youtubeId = meal ? getYoutubeId(meal.strYoutube) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />

      {loading ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <DetailSkeleton />
        </ScrollView>
      ) : error || !meal ? (
        <View style={styles.errorContainer}>
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>←</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Oups</Text>
            <Text style={styles.errorSub}>Impossible de charger cette recette.</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageWrapper}>
            <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
            <View style={styles.imageOverlay} />

            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.iconBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.iconBtnText}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleToggleFavorite}
                style={styles.iconBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.iconBtnText}>{isFavorite ? "♥" : "♡"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.imageContent}>
              <Text style={styles.mealName} numberOfLines={2}>{meal.strMeal}</Text>
              <View style={styles.mealMeta}>
                {!!meal.strArea && <Text style={styles.mealMetaText}>🌍 {meal.strArea}</Text>}
                {!!meal.strCategory && <Text style={styles.mealMetaText}>🍽 {meal.strCategory}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.body}>
            {!!meal.strTags && (
              <View style={styles.tagsRow}>
                {meal.strTags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingrédients</Text>
              <Text style={styles.sectionSub}>{getIngredients(meal).length} éléments</Text>
            </View>
            <View style={styles.ingredientList}>
              {getIngredients(meal).map((item, idx) => (
                <View key={idx} style={styles.ingredientRow}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredientName}>{item.ingredient}</Text>
                  {!!item.measure && (
                    <Text style={styles.ingredientMeasure}>{item.measure}</Text>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Préparation</Text>
            </View>
            <Text style={styles.instructions}>{meal.strInstructions}</Text>

            {youtubeId && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Vidéo</Text>
                </View>
                <TouchableOpacity
                  style={styles.videoCard}
                  activeOpacity={0.85}
                  onPress={() => meal.strYoutube && Linking.openURL(meal.strYoutube)}
                >
                  <Image
                    source={{ uri: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` }}
                    style={styles.videoThumb}
                  />
                  <View style={styles.videoOverlay} />
                  <View style={styles.playButton}>
                    <Text style={styles.playButtonText}>▶</Text>
                  </View>
                  <Text style={styles.videoLabel}>Voir la recette en vidéo</Text>
                </TouchableOpacity>
              </>
            )}

            {!!meal.strSource && (
              <TouchableOpacity
                style={styles.sourceLink}
                onPress={() => Linking.openURL(meal.strSource as string)}
                activeOpacity={0.7}
              >
                <Text style={styles.sourceLinkText}>Voir la source originale →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  imageWrapper: { width: "100%", height: 320 },
  image: { width: "100%", height: 320, position: "absolute" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,83,14,0.35)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: { fontSize: 18, color: COLORS.accent },
  imageContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  mealName: { ...FONT.display, fontSize: 26, color: "#FFF", marginBottom: 8 },
  mealMeta: { flexDirection: "row", gap: 14 },
  mealMetaText: { ...FONT.body, color: "rgba(255,255,255,0.9)" },

  body: { padding: 20, gap: 4 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  tag: { backgroundColor: COLORS.tag, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { ...FONT.label, color: COLORS.tagText, fontSize: 10 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { ...FONT.title, color: COLORS.text },
  sectionSub: { ...FONT.caption, color: COLORS.accentMuted },

  ingredientList: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg,
    gap: 10,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  ingredientName: { ...FONT.body, color: COLORS.text, flex: 1 },
  ingredientMeasure: { ...FONT.caption, color: COLORS.textMuted, fontWeight: "600" },

  instructions: { ...FONT.body, color: COLORS.text, lineHeight: 22 },

  videoCard: {
    borderRadius: 16,
    overflow: "hidden",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  videoThumb: { width: "100%", height: 180, position: "absolute" },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,83,14,0.45)",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  playButtonText: { fontSize: 20, color: COLORS.accent },
  videoLabel: { ...FONT.body, color: "#FFF", fontWeight: "600" },

  sourceLink: { marginTop: 20, alignItems: "center" },
  sourceLinkText: { ...FONT.label, color: COLORS.accent, fontSize: 12 },

  errorContainer: { flex: 1 },
  headerBar: { paddingHorizontal: 16, paddingTop: 12 },
  errorCard: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  errorTitle: { ...FONT.title, color: COLORS.text },
  errorSub: { ...FONT.body, color: COLORS.textMuted },
});