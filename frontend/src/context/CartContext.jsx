import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { API } from "../lib/api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    if (!user?.user_id) return;
    try {
      const res = await fetch(`${API}/api/cart/user/${user.user_id}`);
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
    }
  };

  useEffect(() => {
    fetchCart(); // ดึงเมื่อ user พร้อม
  }, [user]);

  return (
    <CartContext.Provider value={{ cartItems, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
