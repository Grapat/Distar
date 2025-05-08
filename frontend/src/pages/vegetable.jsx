import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/vegetable.css";
import { API } from "../lib/api"; // ✅ ใช้ API จาก lib

export default function Vegetable() {
  const { user } = useAuth();
  const [vegetables, setVegetables] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  const query = useQuery();
  const initialCategory = query.get("category") || "ทั้งหมด";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4005/api/vegs" || `${API}/api/vegs`);
        if (!response.ok) throw new Error("Network response was not ok");

        const catRes = await fetch("http://localhost:4005/api/categories" || `${API}/api/categories`);
        if (!catRes.ok) throw new Error("Network response was not ok");

        const catData = await catRes.json();
        setCategories(catData);

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
      const userRes = await fetch("http://localhost:4005/api/auth/user" || `${API}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const userData = await userRes.json();
      const currentCredit = userData.user?.credit ?? 0;

      // ✅ ดึงยอดรวมในตะกร้าปัจจุบัน
      const summaryRes = await fetch(`http://localhost:4005/api/cart/summary/${user.user_id}` || `${API}/api/cart/summary/${user.user_id}`, {
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
      const response = await fetch("http://localhost:4005/api/cart"  || `${API}/api/cart`, {
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

  const filteredVegetables = vegetables.filter((v) => {
    const matchName = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === "ทั้งหมด" || v.Category?.name === selectedCategory;
    return matchName && matchCategory;
  });

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>Error: {error}</h1>;

  return (
    <>

      <h2>รายการผัก</h2>
      <div className="veg-controller">
        <h2>ค้นหาผัก</h2>
        <input
          type="text"
          placeholder="ค้นหาชื่อผัก..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label htmlFor="category-filter">ประเภทผัก:</label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ทั้งหมด">ทั้งหมด</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="vegetable-page-grid">
        <div className="veg-items">
          {filteredVegetables
            .sort((a, b) => b.stock - a.stock) // ✅ เรียงจากมากไปน้อย
            .map((veg) => (
              <div key={veg.vegetable_id} className="veg-card">
                <img
                  src={veg.image_url || "/images/vegs/default.png"}
                  alt={veg.name}
                  className="veg-image"
                  onClick={() => navigate(`/veg/${veg.vegetable_id}`)} // ✅ navigate ไปยังหน้า detail
                  style={{ cursor: "pointer" }} // ✅ เพิ่ม mouse pointer
                />
                <div className="veg-text">
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
    </>
  );
}
