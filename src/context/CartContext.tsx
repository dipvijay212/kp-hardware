import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@kp_hardware_catalog_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Failed to load cart from AsyncStorage', error);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever cartItems change
  const saveCart = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to AsyncStorage', error);
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id);
      let newItems = [...prevItems];

      if (existingItemIndex > -1) {
        // Update quantity (capping at product stock if needed, though product details screen handles bounds)
        const newQty = prevItems[existingItemIndex].quantity + quantity;
        const finalQty = Math.min(newQty, product.stock);
        newItems[existingItemIndex] = {
          ...prevItems[existingItemIndex],
          quantity: finalQty,
        };
      } else {
        newItems.push({ product, quantity: Math.min(quantity, product.stock) });
      }

      saveCart(newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.product.id !== productId);
      saveCart(newItems);
      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === productId);
      if (existingItemIndex === -1) return prevItems;

      let newItems = [...prevItems];
      const product = newItems[existingItemIndex].product;
      const targetQty = Math.max(1, Math.min(quantity, product.stock));
      
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: targetQty,
      };

      saveCart(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    AsyncStorage.removeItem(CART_STORAGE_KEY).catch((err) =>
      console.error('Failed to clear AsyncStorage cart', err)
    );
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
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
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
