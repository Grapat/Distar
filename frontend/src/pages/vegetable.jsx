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
      if (!user?.user_id) {
        alert("ยังไม่มีข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบก่อนค่ะ");
        return;
      }

      // ✅ ดึง user credit จาก API (อัปเดตล่าสุด)
      const userRes = await fetch("http://localhost:4005/api/auth/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const userData = await userRes.json();
      const currentCredit = userData.user?.credit ?? 0;

      // ✅ ดึงยอดรวมในตะกร้าปัจจุบัน
      const summaryRes = await fetch(`http://localhost:4005/api/cart/summary/${user.user_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const summaryData = await summaryRes.json();
      const totalQuantity = summaryData.totalQuantity || 0;

      const newQuantity = quantities[vegetable_id];

      // ✅ เช็คเครดิตก่อนเพิ่ม
      if (totalQuantity + newQuantity > currentCredit) {
        alert(`เครดิตของคุณมี ${currentCredit} หน่วย ไม่พอสำหรับเพิ่มรายการนี้ค่ะ`);
        return;
      }

      // ✅ เพิ่มเข้าตะกร้าตามปกติ
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
        setQuantities((prev) => ({
          ...prev,
          [vegetable_id]: 1, // reset
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
    <div className="veg-container">
      <div className="veg-box-container">
        <h2>รายการผัก</h2>
        <div className="veg-grid">
          {vegetables.map((veg) => (
            <div key={veg.vegetable_id} className="veg-card">
              <div className="veg-img-container">
                <img
                  src={veg.image_url || "/images/vegs/default.png"}
                  alt={veg.name}
                  className="veg-img"
                />
              </div>
              <div className="veg-info">
                <div className="veg-quantity">
                  <button className="minus-btn" onClick={() => handleQuantityChange(veg.vegetable_id, -1)}>-</button>
                  <span>{quantities[veg.vegetable_id]}</span>
                  <button className="plus-btn" onClick={() => handleQuantityChange(veg.vegetable_id, 1)}>+</button>
                </div>
                <button className="add-btn" onClick={() => handleAddToCart(veg.vegetable_id)}>
                  เพิ่มเข้าตะกร้า
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
