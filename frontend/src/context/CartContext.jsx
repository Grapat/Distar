import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    if (!user?.user_id) return;
    try {
      const res = await fetch(`http://localhost:4005/api/cart/user/${user.user_id}`);
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
