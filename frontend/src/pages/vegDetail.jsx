import React from "react";
import "../css/vegDetail.css";
import { useParams } from "react-router-dom";

const VegDetail = ({ vegetables }) => {
  const { id } = useParams();
  const vegetable = vegetables.find((veg) => veg.id.toString() === id);

  if (!vegetable) {
    return <h1>Vegetable not found</h1>;
  }

  return (
    <div className="veg-detail-container">
      <div className="veg-info-top">
        <img src={vegetable.image} alt={vegetable.name} className="veg-image" />
        <h2>{vegetable.name} ({vegetable.englishName})</h2>
        <span className="veg-tag">{vegetable.tag}</span>
        <p className="veg-rating">⭐ {vegetable.rating}</p>
        <div className="veg-counter">
          <button className="counter-btn">-</button>
          <span className="counter-value">1</span>
          <button className="counter-btn">+</button>
        </div>
      </div>
      <div className="veg-info-foot">
        <h3>ประวัติของ {vegetable.name}</h3>
        <p>{vegetable.description}</p>
        <h4>สารอาหารที่สำคัญ</h4>
        <ul>
          {vegetable.nutrients.map((nutrient, index) => (
            <li key={index}>{nutrient}</li>
          ))}
        </ul>
        {/* <h4>ผักที่คุณอาจสนใจ</h4>
        <div className="related-vegs">
          {vegetables.slice(0, 4).map((related) => (
            <div key={related.id} className="related-veg">
              <img src={related.image} alt={related.name} className="related-image" />
              <p>{related.name}</p>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default VegDetail;