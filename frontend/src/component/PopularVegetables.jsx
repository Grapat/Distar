import React, { useEffect, useState } from "react";
import "../css/popularVegetables.css";

const PopularVegetables = () => {
  const [vegetables, setVegetables] = useState([]);

  useEffect(() => {
    // Fetch vegetables data from API
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4005/api/popular-vegs");
        const data = await response.json();
        setVegetables(data);
      } catch (error) {
        console.error("Error fetching vegetables:", error);
      }
    };

    fetchData();
  }, []);

  // Define background colors for ranking
  const getBackgroundColor = (index) => {
    const colors = ["#FFD700", "#ADFF2F", "#FFA500", "#98FB98", "#90EE90", "#C0C0C0", "#D3D3D3"];
    return colors[index % colors.length]; // Cycle colors if more than 7 items
  };

  return (
    <div className="popular-vegetables">
      <h2>ผักที่ได้รับความนิยม</h2>
      <ul className="veg-list">
        {vegetables.map((veg, index) => (
          <li key={veg.id} className="veg-item" style={{ backgroundColor: getBackgroundColor(index) }}>
            <img src={veg.image} alt={veg.name} className="veg-image" />
            <div className="veg-info">
              <h3>{veg.name}</h3>
              <p>({veg.englishName})</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PopularVegetables;
