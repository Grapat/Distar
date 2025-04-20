import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../css/vegetable.css";

export default function Vegetable() {
  const { user } = useAuth();
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

        // ตั้งค่าเริ่มต้นของจำนวนผักแต่ละชนิด = 1
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
      // ✅ 1. เช็คยอดรวมสินค้าจาก backend ก่อนเพิ่ม
      const summaryRes = await fetch(`http://localhost:4005/api/cart/summary/${user.user_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const summaryData = await summaryRes.json();
      const totalQuantity = summaryData.totalQuantity || 0;
      const newQuantity = quantities[vegetable_id];

      if (totalQuantity + newQuantity > 10) {
        alert("ไม่สามารถเพิ่มได้ เพราะจะเกิน 10 รายการในตะกร้าค่ะ 🚫");
        return;
      }

      // ✅ 2. เพิ่มผักเข้า cart ได้
      const response = await fetch("http://localhost:4005/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: user.user_id,
          vegetable_id,
          quantity: newQuantity,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("เพิ่มเข้าตะกร้าแล้วค่ะ ✅");
        // ✅ 3. รีเซตจำนวนกลับเป็น 1
        setQuantities((prev) => ({
          ...prev,
          [vegetable_id]: 1,
        }));
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
          <div key={veg.vegetable_id} className="card">
            <img src={veg.image} alt={veg.name} className="veg-image" />
            <div className="info">
              <p className="veg-name">{veg.name}</p>
              <div className="quantity-control">
                <button onClick={() => handleQuantityChange(veg.vegetable_id, -1)}>-</button>
                <span>{quantities[veg.vegetable_id]}</span>
                <button onClick={() => handleQuantityChange(veg.vegetable_id, 1)}>+</button>
              </div>
              <button className="add-btn" onClick={() => handleAddToCart(veg.vegetable_id)}>
                🛒 เพิ่มเข้าตะกร้า
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
