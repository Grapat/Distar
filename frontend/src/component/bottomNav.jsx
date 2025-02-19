import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/bottomNav.css";

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <div className="bottom-nav">
      <div className="nav-item" onClick={() => navigate("/home")}>
        <img src="/icons/home.svg" alt="Home" />
        <span>หน้าหลัก</span>
      </div>
      <div className="nav-item" onClick={() => navigate("/cart")}>
        <img src="/icons/cart.svg" alt="Cart" />
        <span>ตะกร้า</span>
      </div>
      <div className="nav-item" onClick={() => navigate("/orders/deliver")}>
        <img src="/icons/orders.svg" alt="orders" />
        <span>การแจ้งเตือน</span>
      </div>
      <div className="nav-item" onClick={() => navigate("/profile")}>
        <img src="/icons/profile.svg" alt="Profile" />
        <span>บัญชี</span>
      </div>
    </div>
  );
};

export default BottomNav;
