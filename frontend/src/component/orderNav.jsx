import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/orderNav.css";

const OrderNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("/orders/deliver");

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const tabs = [
    { name: "ที่ต้องจัดส่ง", path: "/orders/deliver" },
    { name: "ที่ต้องได้รับ", path: "/orders/arrived" },
    { name: "สำเร็จ", path: "/orders/success" }
  ];

  const handleTabClick = (path) => {
    setActiveTab(path);
    navigate(path);
  };

  return (
    <nav className="order-nav">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          className={`nav-item ${activeTab === tab.path ? "active" : ""}`}
          onClick={() => handleTabClick(tab.path)}
        >
          {tab.name}
        </button>
      ))}
    </nav>
  );
};

export default OrderNav;