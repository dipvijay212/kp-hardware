import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

const CART_STORAGE_KEY = '@kp_hardware_catalog_cart';
const MAX_QTY = 999;
const MIN_QTY = 1;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

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

  // Save cart to AsyncStorage
  const saveCart = async (items) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to AsyncStorage', error);
    }
  };

  // Add Product to Cart
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id);
      let newItems = [...prevItems];

      if (existingItemIndex > -1) {
        const currentQty = prevItems[existingItemIndex].quantity;
        const targetQty = Math.min(currentQty + quantity, MAX_QTY);
        newItems[existingItemIndex] = {
          ...prevItems[existingItemIndex],
          quantity: targetQty,
        };
      } else {
        newItems.push({ product, quantity: Math.min(quantity, MAX_QTY) });
      }

      saveCart(newItems);
      return newItems;
    });
  };

  // Remove Product from Cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.product.id !== productId);
      saveCart(newItems);
      return newItems;
    });
  };

  // Increase Quantity by 1
  const increaseQuantity = (productId) => {
    setCartItems((prevItems) => {
      const idx = prevItems.findIndex((item) => item.product.id === productId);
      if (idx === -1) return prevItems;

      let newItems = [...prevItems];
      const newQty = Math.min(prevItems[idx].quantity + 1, MAX_QTY);
      newItems[idx] = {
        ...newItems[idx],
        quantity: newQty,
      };

      saveCart(newItems);
      return newItems;
    });
  };

  // Decrease Quantity by 1
  const decreaseQuantity = (productId) => {
    setCartItems((prevItems) => {
      const idx = prevItems.findIndex((item) => item.product.id === productId);
      if (idx === -1) return prevItems;

      let newItems = [...prevItems];
      const newQty = Math.max(prevItems[idx].quantity - 1, MIN_QTY);
      newItems[idx] = {
        ...newItems[idx],
        quantity: newQty,
      };

      saveCart(newItems);
      return newItems;
    });
  };

  // Clear Cart
  const clearCart = () => {
    setCartItems([]);
    AsyncStorage.removeItem(CART_STORAGE_KEY).catch((err) =>
      console.error('Failed to clear AsyncStorage cart', err)
    );
  };

  // Computed values
  const totalItems = cartItems.length; // Number of unique products
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0); // Total quantity sum
  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        totalQuantity,
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

export default CartContext;
