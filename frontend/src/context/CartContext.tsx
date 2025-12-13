import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sweet } from '../services/api';

export interface CartItem {
  sweet: Sweet;
  weight: number;
  quantity: number;
  totalPrice: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (sweet: Sweet, weight: number, quantity: number) => void;
  removeFromCart: (sweetId: number) => void;
  updateCartItem: (sweetId: number, weight: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (sweet: Sweet, weight: number, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.sweet.id === sweet.id);
      
      if (existingItem) {
        // Update existing item
        return prevItems.map((item) =>
          item.sweet.id === sweet.id
            ? {
                ...item,
                weight: weight,
                quantity: item.quantity + quantity,
                totalPrice: sweet.price * weight * (item.quantity + quantity),
              }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          sweet,
          weight,
          quantity,
          totalPrice: sweet.price * weight * quantity,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (sweetId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.sweet.id !== sweetId));
  };

  const updateCartItem = (sweetId: number, weight: number, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.sweet.id === sweetId) {
          const sweet = item.sweet;
          return {
            ...item,
            weight,
            quantity,
            totalPrice: sweet.price * weight * quantity,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

