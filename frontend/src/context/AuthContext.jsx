import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:4005/api/auth/user", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // ✅ บันทึกข้อมูลผู้ใช้
        } else {
          setUser(null); // ✅ ล้างข้อมูลถ้า Token ใช้ไม่ได้
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
