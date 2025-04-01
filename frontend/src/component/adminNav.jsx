import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/adminNav.css"; // ใช้ไฟล์ CSS ที่ให้มาเลยค่ะ

const AdminNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      <div className="nav-item" onClick={() => navigate("/admin/dashboard")}>
        <img src="/icons/dashboard.png" alt="Dashboard" />
        <span>แดชบอร์ด</span>
      </div>
      <div className="nav-item" onClick={() => navigate("/admin/cart-page")}>
        <img src="/icons/cart.png" alt="Cart" />
        <span>ตะกร้า</span>
      </div>
      <div className="nav-item" onClick={() => navigate("/admin/orders-page")}>
        <img src="/icons/veg.png" alt="Orders" />
        <span>ออเดอร์</span>
      </div>
      <div className="nav-item" onClick={() => navigate("/admin/vegies-page")}>
        <img src="/icons/veg.png" alt="Vegetables" />
        <span>ผัก</span>
      </div>
      <div className="nav-item" onClick={() => navigate("/admin/user-page")}>
        <img src="/icons/User.png" alt="User" />
        <span>ผู้ใช้</span>
      </div>
    </nav>
  );
};

export default AdminNav;
