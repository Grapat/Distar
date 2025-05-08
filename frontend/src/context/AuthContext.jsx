import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👉 นำเข้า useNavigate
import { API } from "../lib/api";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // ✅ สร้างฟังก์ชันสำหรับ redirect

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login"); // 🚨 ถ้าไม่มี token เลย ให้ไปหน้า Login
        return;
      }

      const response = await fetch("http://localhost:4005/api/auth/user" || `${API}/api/auth/login`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "application/json" 
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.user || !data.user.userType) {
          console.warn("Invalid user data received");
          setUser(null);
          navigate("/login"); // ⚠️ redirect ถ้าข้อมูลไม่ถูกต้อง
          return;
        }
        setUser(data.user);
      } else {
        console.warn("API responded with an error");
        setUser(null);
        navigate("/login"); // ❌ redirect ถ้า API error เช่น Unauthorized
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      navigate("/login"); // ❌ redirect ถ้าเกิด exception
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
