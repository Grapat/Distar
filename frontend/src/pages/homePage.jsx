import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const bannerImages = ["/images/farm/5.png", "/images/farm/DSF-006.png", "/images/farm/12.png"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="home-wrapper">
      <div className="home-section carousel-box">
        <div className="carousel-slide">
          <img src={bannerImages[currentIndex]} alt="Banner" className="carousel-img" />
          <div className="carousel-text">
            <h2>ให้เราดูแลผัก<br />ให้ผักดูแลคุณ</h2>
            <button className="order-btn" onClick={() => navigate("/veg")}>
              สั่งเลย! <span className="arrow">➤</span>
            </button>
          </div>
        </div>
        <div className="carousel-dots">
          {bannerImages.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
        </div>
      </div>

      <div className="home-section home-card">
        <h3>ประเภทผักแนะนำ</h3>
        <div className="product-section">
          <div className="product"   onClick={() => navigate("/veg?category=Super Foods")}>
            <div className="product-img-container">
              <img src="/images/vegs/1.png" alt="Super Food" />
            </div>
            <p>คุณค่าทางโภชนาการสูง</p>
            <span>Super Food</span>
          </div>
          <div className="product" onClick={() => navigate("/veg?category=Salad Greens")}>
            <div className="product-img-container">
              <img src="/images/vegs/7.png" alt="Salad Vegetable" />
            </div>
            <p>ความสดชื่นจากธรรมชาติ</p>
            <span>Salad Vegetable</span>
          </div>
        </div>
      </div>

      <div className="home-section jumbotron">
        <div className="jumbotron-content">
          <h2>เยี่ยมชมเว็บไซต์หลักของเรา</h2>
          <a href="https://www.distarfresh.com/" target="_blank" rel="noopener noreferrer" className="jumbotron-btn">
            ไปที่ Distar Fresh
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
