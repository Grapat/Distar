import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/adminHome.css";
import { API } from "../../lib/api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [vegetables, setVegetables] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // ✅ Users
        const userRes = await fetch("http://localhost:4005/api/users" || `${API}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setUsers(userData);

        // ✅ Orders
        const orderRes = await fetch("http://localhost:4005/api/order" || `${API}/api/order`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orderData = await orderRes.json();
        setOrders(orderData);

        // ✅ Vegetables
        const vegRes = await fetch("http://localhost:4005/api/vegs" || `${API}/api/vegs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const vegData = await vegRes.json();
        setVegetables(vegData);

        // ✅ Categories
        const catRes = await fetch("http://localhost:4005/api/categories" || `${API}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const catData = await catRes.json();
        setCategories(catData);

      } catch (error) {
        console.error("โหลดข้อมูลล้มเหลว:", error);
      }
    };

    fetchData();
  }, []);

  // ✅ แยกผักตาม category
  const groupedByCategory = vegetables.reduce((acc, veg) => {
    const category = veg.category || "ไม่ระบุประเภท";
    if (!acc[category]) acc[category] = [];
    acc[category].push(veg);
    return acc;
  }, {});

  return (
    <>
      <div className="admin-home">
        <h2>Admin Dashboard</h2>
        <div className="dashboard-grid">
          {/* 🧑 User */}
          <div
            className="admin-section"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/user-page")}
          >
            <h3>ข้อมูลผู้ใช้</h3>
            <p>จำนวนผู้ใช้ทั้งหมด: {users.length} คน</p>
          </div>
          {/* 📦 Order */}
          <div className="admin-section"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/orders-page")}
          >
            <h3>คำสั่งซื้อ</h3>
            <p>รอดำเนินการ: {orders.filter(o => o.status === "pending").length} รายการ</p>
            <p>รวมทั้งหมด: {orders.length} รายการ</p>
          </div>
          {/* 🥬 Veg */}
          <div className="admin-section"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/vegies-page")}
          >
            <h3>รายการผัก</h3>
            <p>รวมทั้งหมด: {vegetables.length} รายการ</p>
            <p>หมวดหมู่: {categories.length} ประเภท</p>
          </div>
        </div>
        <div className="dashboard-grid">
          <div className="veg-filter-box">
            <div className="veg-filter-bar">
              <input
                type="text"
                placeholder="ค้นหาชื่อผัก..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="all">ทุกประเภท</option>
                {[...new Set(vegetables.map((v) => v.Category?.name || "ไม่ระบุ"))].map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>

              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                <option value="all">ทุกระดับสต็อก</option>
                <option value="warning">ต่ำกว่า 100</option>
                <option value="runout">หมด (stock = 0)</option>
              </select>

            </div>
          </div>
          <div className="veg-list-container">
            {vegetables
              .filter((v) =>
                // ✅ กรองชื่อผัก
                v.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .filter((v) =>
                // ✅ กรองประเภท
                selectedCategory === "all" ? true : (v.Category?.name || "ไม่ระบุ") === selectedCategory
              )
              .filter((v) =>
                // ✅ กรอง stock
                stockFilter === "all"
                  ? true
                  : stockFilter === "warning"
                    ? v.stock < 100
                    : v.stock === 0
              )
              .sort((a, b) => a.stock - b.stock)
              .map((veg) => (
                <div key={veg.vegetable_id} className="veg-list-item">
                  <div className="veg-list-left">
                    <h4>{veg.name}</h4>
                    <p>ประเภท: {veg.Category?.name || "ไม่ระบุ"}</p>
                  </div>
                  <div className="veg-stock">คงเหลือ: {veg.stock}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

    </>
  );
};

export default AdminDashboard;
