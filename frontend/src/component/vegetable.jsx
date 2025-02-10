import { useState, useEffect } from "react";
import "../css/vegetable.css";

export default function Vegetable() {
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4005/api/vegs");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setVegetables(data);
        setQuantities(
          data.reduce((acc, veg) => ({ ...acc, [veg.id]: 1 }), {})
        ); // Default quantity to 1
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuantityChange = (id, change) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + change),
    }));
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <div className="vegetable-container">
      <h1 className="title">รายการผัก</h1>
      <div className="grid">
        {vegetables.map((veg) => (
          <div key={veg.id} className="card">
            <img src={veg.image} alt={veg.name} className="veg-image" />
            <div className="info">
              <p className="veg-name">{veg.name}</p>
              <div className="quantity-control">
                <button onClick={() => handleQuantityChange(veg.id, -1)}>-</button>
                <span>{quantities[veg.id]}</span>
                <button onClick={() => handleQuantityChange(veg.id, 1)}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
