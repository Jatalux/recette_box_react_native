import { FavoritesState } from "@/types/favoris";
import { MealFull } from "@/types/themealdb";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<MealFull>) => {
      const exists = state.items.some((m) => m.idMeal === action.payload.idMeal);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((m) => m.idMeal !== action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<MealFull>) => {
      const exists = state.items.some((m) => m.idMeal === action.payload.idMeal);
      if (exists) {
        state.items = state.items.filter((m) => m.idMeal !== action.payload.idMeal);
      } else {
        state.items.push(action.payload);
      }
    },
    clearFavorites: (state) => {
      state.items = [];
    },
  },
});

export const { addFavorite, removeFavorite, toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;