// src/lib/api_config.ts

// Vite preia automat valoarea corectă în funcție de modul în care rulezi (npm run dev sau npm run build)
export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const endpoints = {
  products: `${API_BASE_URL}/api/v1/products/`,
  categories: `${API_BASE_URL}/api/v1/categories/`,
  checkout: `${API_BASE_URL}/api/v1/orders/create-checkout-session`,
};
