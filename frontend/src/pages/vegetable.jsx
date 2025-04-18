import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ ใช้ Auth
import "../css/vegetable.css";

export default function Vegetable() {
  const { user } = useAuth(); // ✅ ดึง user_id
  const [vegetables, setVegetables] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4005/api/vegs");
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setVegetables(data);
        // ✅ กำหนดจำนวนเริ่มต้นของแต่ละผักเป็น 1
        const defaultQty = {};
        data.forEach((veg) => {
          defaultQty[veg.vegetable_id] = 1;
        });
        setQuantities(defaultQty);
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
      [id]: Math.max(1, (prev[id] || 1) + change),
    }));
  };

  const handleAddToCart = async (vegetable_id) => {
    try {
      const response = await fetch("http://localhost:4005/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ถ้ามี auth
        },
        body: JSON.stringify({
          user_id: user.user_id,
          vegetable_id,
          quantity: quantities[vegetable_id],
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("เพิ่มเข้าตะกร้าแล้วค่ะ ✅");
      } else {
        alert(result.message || "ไม่สามารถเพิ่มเข้าตะกร้าได้ค่ะ");
      }
    } catch (error) {
      console.error("❌ เพิ่มเข้าตะกร้าล้มเหลว:", error);
      alert("เกิดข้อผิดพลาดขณะเพิ่มเข้าตะกร้าค่ะ");
    }
  };

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>Error: {error}</h1>;

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
                  <button onClick={() => handleQuantityChange(veg.vegetable_id, -1)}>-</button>
                  <span>{quantities[veg.vegetable_id]}</span>
                  <button onClick={() => handleQuantityChange(veg.vegetable_id, 1)}>+</button>
                </div>
                <button className="add-btn" onClick={() => handleAddToCart(veg.id)}>
                  🛒 เพิ่มเข้าตะกร้า
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
