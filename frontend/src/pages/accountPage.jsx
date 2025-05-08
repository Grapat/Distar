import React, { useState, useEffect } from "react";
import "../css/accountPage.css";
import { useAuth } from "../context/AuthContext"; // ✅ ใช้ context
import { useNavigate } from "react-router-dom";
import { API } from "../lib/api";

const AccountPage = () => {
  const [userData, setUserData] = useState(null);
  const { user, setUser } = useAuth(); // ✅ ดึงข้อมูล user จาก context
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API}/api/auth/user`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Unauthorized");

        const data = await response.json();
        setUserData(data.user);
      } catch (error) {
        console.error("❌ ไม่สามารถโหลดข้อมูลผู้ใช้:", error);
        navigate("/login"); // กลับไป login ถ้า token ผิดหรือหมดอายุ
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null); // ล้าง context user
    navigate("/login");
  };

  if (!userData) return <div className="account-container">กำลังโหลดข้อมูลผู้ใช้...</div>;

  return (
<div className="account-container">
  <div className="account-box">
    <h2>บัญชีของฉัน</h2>
    <div className="account-info">
      <p><strong>รหัสผู้ใช้:</strong> {userData.user_id}</p>
      <p><strong>ชื่อ-นามสกุล:</strong> {userData.name}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>เบอร์โทร:</strong> {userData.phone}</p>
    </div>
      <button className="logout-btn" onClick={handleLogout}>ออกจากระบบ</button>
  </div>
</div>

  );
};

export default AccountPage;
