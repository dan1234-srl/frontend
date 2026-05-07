import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string | number;
  sku: string;
  name: string;
  price: number;
  image_url: any;
  quantity: number;
  stock_quantity: number;
  // ADAUGATE PENTRU VALIDARE VOUCHERE
  category_id: string;
  brand_name: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (sku: string) => void;
  updateQuantity: (sku: string, newQuantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("linea-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("linea-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.sku === product.sku);

      if (existingItem) {
        // VALIDARE STOC
        if (existingItem.quantity >= existingItem.stock_quantity) {
          return prevCart;
        }

        return prevCart.map((item) =>
          item.sku === product.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      // Verificăm dacă produsul nou are măcar 1 în stoc
      if (product.stock_quantity <= 0) return prevCart;

      return [
        ...prevCart,
        {
          id: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity,
          quantity: 1,
          // MAPARE CORECTĂ DIN OBIECTUL PRODUCT VENIT DIN API
          category_id:
            product.category_id ||
            product.category?.id ||
            "00000000-0000-0000-0000-000000000000",
          brand_name: product.brand_name || product.brand || "",
        },
      ];
    });
  };

  const updateQuantity = (sku: string, newQuantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.sku === sku) {
          const validatedQty = Math.max(
            1,
            Math.min(newQuantity, item.stock_quantity),
          );
          return { ...item, quantity: validatedQty };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (sku: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
