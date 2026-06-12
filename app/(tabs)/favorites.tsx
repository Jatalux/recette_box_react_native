import { useRouter } from "expo-router";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { removeFavorite } from "@/features/Favoris/FavorisSlice";
import { RootState } from "@/store";
import { MealFull } from "@/types/themealdb";

const COLORS = {
  header: "#0D530E",
  bg: "#FBF5DD",
  surface: "#E2EDCF",
  accent: "#306D29",
  accentMuted: "#306D29",
  text: "#306D29",
  textMuted: "#8FA990",
};

const FONT = {
  display: { fontSize: 34, fontWeight: "800" as const, letterSpacing: -0.8 },
  title: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3 },
  body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  label: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.2 },
  caption: { fontSize: 12, fontWeight: "400" as const },
};

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {sub && <Text style={styles.sectionSub}>{sub}</Text>}
    </View>
  );
}

function FavoriteCard({ meal, onPress, onRemove }: { meal: MealFull; onPress: () => void; onRemove: () => void }) {
  return (
    <TouchableOpacity style={styles.recipeCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: meal.strMealThumb }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>{meal.strMeal}</Text>
        <View style={styles.recipeMeta}>
          {!!meal.strArea && <Text style={styles.recipeMetaText}>🌍 {meal.strArea}</Text>}
          {!!meal.strCategory && <Text style={styles.recipeMetaText}>{meal.strCategory}</Text>}
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.7}>
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>♡</Text>
      <Text style={styles.emptyTitle}>Aucun favori pour le moment</Text>
      <Text style={styles.emptySub}>
        Appuyez sur le cœur d'une recette pour l'ajouter ici.
      </Text>
    </View>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.items);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />

      <View style={styles.header}>
        <Text style={styles.greeting}>Favoris</Text>
      </View>

      {favorites.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <SectionHeader title="Vos plats" sub={`${favorites.length} recette${favorites.length > 1 ? "s" : ""}`} />
            {favorites.map((meal) => (
              <FavoriteCard
                key={meal.idMeal}
                meal={meal}
                onPress={() => router.push(`/recipe/${meal.idMeal}` as any)}
                onRemove={() => dispatch(removeFavorite(meal.idMeal))}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
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

  section: { marginTop: 24, marginBottom: 32 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { ...FONT.title, color: COLORS.text },
  sectionSub: { ...FONT.caption, color: COLORS.accentMuted },

  recipeCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    height: 90,
    alignItems: "center",
  },
  recipeImage: { width: 90, height: 90 },
  recipeInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  recipeTitle: { ...FONT.body, color: COLORS.text, fontWeight: "600", lineHeight: 18 },
  recipeMeta: { flexDirection: "row", gap: 12 },
  recipeMetaText: { ...FONT.caption, color: COLORS.textMuted },

  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  removeBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: "700" },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon: { fontSize: 48, color: COLORS.accentMuted, marginBottom: 8 },
  emptyTitle: { ...FONT.title, color: COLORS.text, textAlign: "center" },
  emptySub: { ...FONT.body, color: COLORS.textMuted, textAlign: "center" },
});