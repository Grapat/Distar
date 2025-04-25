import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ ดึง user
import "../css/bottomNav.css";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 ใช้สำหรับจับ path
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  // ✅ ฟังก์ชันดึงข้อมูล cart
  const fetchCartCount = async () => {
    if (!user?.user_id) return;
    try {
      const res = await fetch(`http://localhost:4005/api/cart/user/${user.user_id}`);
      const data = await res.json();
      const totalQty = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQty);
    } catch (err) {
      console.error("❌ Failed to fetch cart:", err);
    }
  };

  // ✅ ดึง cart ทุกครั้งที่ user เปลี่ยน (login/logout) หรือเปลี่ยนหน้า
  useEffect(() => {
    fetchCartCount();
  }, [user, location.pathname]);

  // ✅ ตั้ง interval refresh ทุก 30 วินาที
  useEffect(() => {
    const interval = setInterval(fetchCartCount, 30000); // 30 วินาที
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="bottom-nav">
      <div className="nav-item" onClick={() => navigate("/home")}>
        <img src="/icons/home.svg" alt="Home" />
        <span>หน้าหลัก</span>
      </div>

      <div className="nav-item" onClick={() => navigate("/cart")}>
        <div className="cart-icon-wrapper">
          <img src="/icons/cart.svg" alt="Cart" />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>
        <span>ตะกร้า</span>
      </div>

      <div className="nav-item" onClick={() => navigate("/veg")}>
        <img src="/icons/veg.svg" alt="veg" />
        <span>สินค้า</span>
      </div>

      <div className="nav-item" onClick={() => navigate("/orders/pending")}>
        <img src="/icons/orders.svg" alt="orders" />
        <span>การแจ้งเตือน</span>
      </div>

      <div className="nav-item" onClick={() => navigate("/acc")}>
        <img src="/icons/profile.svg" alt="Profile" />
        <span>บัญชี</span>
      </div>
    </div>
  );
};

export default BottomNav;