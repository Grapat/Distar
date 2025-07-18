import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API } from "../lib/api";
import "../css/vegDetail.css";

const VegDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vegs, setVegs] = useState([]);
  const { user } = useAuth();
  const [vegetable, setVegetable] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVegetable = async () => {
      try {
        const res = await fetch(`${API}/api/vegs/${id}`);
        const data = await res.json();
        setVegetable(data);

        const response = await fetch(`${API}/api/vegs`);
        const vegetables = await response.json();
        setVegs(vegetables);

      } catch (err) {
        console.error("❌ Error fetching vegetable:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVegetable();
  }, [id]);

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleAddToCart = async () => {
    try {
      if (!user?.user_id) {
        alert("กรุณาเข้าสู่ระบบก่อนค่ะ");
        return;
      }

      const userRes = await fetch(`${API}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const userData = await userRes.json();
      const currentCredit = userData.user?.credit ?? 0;

      const summaryRes = await fetch(
        `${API}/api/cart/summary/${user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const summaryData = await summaryRes.json();
      const totalQuantity = summaryData.totalQuantity || 0;

      if (totalQuantity + quantity > currentCredit) {
        alert(`เครดิตของคุณมี ${currentCredit} หน่วย ไม่พอสำหรับเพิ่มรายการนี้ค่ะ`);
        return;
      }

      const response = await fetch(`${API}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: user.user_id,
          vegetable_id: vegetable.vegetable_id,
          quantity,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("เพิ่มเข้าตะกร้าแล้วค่ะ ✅");
        setQuantity(1);
      } else {
        alert(result.message || "ไม่สามารถเพิ่มเข้าตะกร้าได้ค่ะ");
      }
    } catch (err) {
      console.error("❌ เพิ่มเข้าตะกร้าล้มเหลว:", err);
      alert("เกิดข้อผิดพลาดขณะเพิ่มเข้าตะกร้าค่ะ");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!vegetable) return <h1>ไม่พบข้อมูลผัก</h1>;

  return (
    <div className="veg-detail-container">
      <div className="veg-detail-content">
        <div className="veg-image-section">
          <img
            src={vegetable.image_url || "/images/vegs/default.png"}
            alt={vegetable.name}
            className="veg-image"
          />
        </div>

        <div className="veg-info-section">
          <h2 className="veg-name">{vegetable.name}</h2>

          <div className="veg-counter">
            <button className="counter-btn" onClick={() => handleQuantityChange(-1)}>-</button>
            <span className="counter-value">{quantity}</span>
            <button className="counter-btn" onClick={() => handleQuantityChange(1)}>+</button>
          </div>

          <button className="add-btn" onClick={handleAddToCart}>เพิ่มเข้าตะกร้า</button>

          <div className="veg-description">
            <h3>ประวัติของ {vegetable.name}</h3>
            <p>{vegetable.description || "ไม่มีข้อมูลเพิ่มเติม"}</p>

            {vegetable.nutrients && (
              <div className="veg-benefits">
                <h3>สารอาหารที่สำคัญ</h3>
                <ul>
                  {vegetable.nutrients.map((nutrient, index) => (
                    <li key={index}>{nutrient}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <h3>ผักแนะนำ</h3>
      <div className="veg-items">
        {vegs
          .filter((veg) => veg.vegetable_id !== vegetable.vegetable_id) // ✅ ไม่รวมตัวปัจจุบัน
          .map((veg) => (
            <div key={veg.vegetable_id} className="veg-card">
              <img
                src={veg.image_url || "/images/vegs/default.png"}
                alt={veg.name}
                className="veg-image"
                onClick={() => navigate(`/veg/${veg.vegetable_id}`)}
                style={{ cursor: "pointer" }}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default VegDetail;
