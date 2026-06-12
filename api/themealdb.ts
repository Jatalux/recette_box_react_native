import { Category, Country, MealFull } from "@/types/themealdb";

const api = "https://www.themealdb.com/api/json/v1/1";

export const getRandom = async (): Promise<MealFull> => {
    try {
        const response = await fetch(`${api}/random.php`);
        const data = await response.json();
        return data.meals?.[0];
    } catch (error) {
        throw error;
    }
}

export const getCategories = async (): Promise<Category[]> => {
    try {
        const response = await fetch(`${api}/categories.php`);
        const data = await response.json();
        return data.categories;
    } catch (error) {
        throw error;
    }
}

export const getMealsByCategory = async (category: string): Promise<MealFull[]> => {
    console.log("lien", `${api}/filter.php?c=${category}`)
    try {
        const response = await fetch(`${api}/filter.php?c=${category}`);
        const data = await response.json();
        return data.meals;
    } catch (error) {
        throw error;
    }
}

export const getMealsByIngredient = async (ingredient: string): Promise<MealFull[]> => {
    try {
        const response = await fetch(`${api}/filter.php?i=${ingredient}`);
        const data = await response.json();
        return data.meals;
    } catch (error) {
        throw error;
    }
}

export const getCountrys = async (): Promise<Country[]> => {
    try {
        const response = await fetch(`${api}/list.php?a=list`);
        const data = await response.json();
        return data.meals;
    } catch (error) {
        throw error;
    }
}

export const getMealsByCountry = async (country: string): Promise<MealFull[]> => {
    try {
        const response = await fetch(`${api}/filter.php?a=${country}`);
        const data = await response.json();
        return data.meals;
    } catch (error) {
        throw error;
    }
}

export const getMealById = async (id: string): Promise<MealFull> => {
    try {
        const response = await fetch(`${api}/lookup.php?i=${id}`);
        const data = await response.json();
        return data.meals?.[0];
    } catch (error) {
        throw error;
    }
}

export async function searchMeals(query: string): Promise<MealFull[]> {
  const res = await fetch(`${api}/search.php?s=${encodeURIComponent(query)}`);
  const data = await res.json();
  console.log(data);
  return data.meals || [];
}