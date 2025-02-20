import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/landingPage.css";

const LandingPage = () => {
    const navigate = useNavigate();
    return (
    <div className="container">
      <div className="content">
        <img src="/basket.png" alt="Vegetable Basket" className="image" />
        <p className="description">
          “จากฟาร์มสู่โต๊ะอาหารของคุณ ผักสดคุณภาพสูง
          ปลูกด้วยความรักและใส่ใจในทุกขั้นตอน เพื่อสุขภาพที่ดีและรสชาติอร่อยอย่างแท้จริง”
        </p>
      </div>
      <div className="button-group">
        <button className="primary-btn">เข้าสู่ระบบ / ลงทะเบียน</button>
        <button className="secondary-btn" onClick={() => navigate("/home")}>ข้าม</button>
      </div>
    </div>
  );
};

export default LandingPage;
