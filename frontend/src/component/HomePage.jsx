import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import "../css/HomePage.css";

const HomePage = () => {
  return (
    <div className="home-container">
      <Header />
      <div className="banner-carousel">
        <img src="/banner.png" alt="Banner" className="banner-image" />
        <div className="banner-text">
          <h2>ให้เราดูแลผัก ให้ผักดูแลคุณ</h2>
          <button className="order-btn">สั่งเลย!</button>
        </div>
      </div>
      <div className="product-section">
        <div className="product">
          <img src="/superfood.png" alt="Super Food" />
          <p>คุณค่าทางโภชนาการสูง</p>
          <span>Super Food</span>
        </div>
        <div className="product">
          <img src="/salad.png" alt="Salad Vegetable" />
          <p>ความสดชื่นจากธรรมชาติ</p>
          <span>Salad Vegetable</span>
        </div>
      </div>
      <div className="menu-section">
        <div className="menu-item">ผักที่ได้รับความนิยม</div>
        <div className="menu-item">รายการผัก</div>
        <div className="menu-item">ติดตามคำสั่งซื้อ</div>
      </div>
      <div className="promo-section">
        <p>ของดีเมืองนนท์</p>
        <img src="/promo.png" alt="Promotion" />
      </div>
      <BottomNav />
    </div>
  );
};

export default HomePage;
