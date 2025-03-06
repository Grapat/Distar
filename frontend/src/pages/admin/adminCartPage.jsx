import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // ✅ ใช้ AuthContext เพื่อนำ Token
import "../../css/adminCartPage.css";

const AdminCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const { user } = useAuth(); // ✅ ดึงข้อมูลผู้ใช้จาก Context

  useEffect(() => {
    fetchCartItems();
  }, []);

  // ✅ ฟังก์ชันดึงข้อมูลตะกร้าทั้งหมด (ต้องใช้ Token)
  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token"); // ✅ ดึง Token จาก Local Storage
      const response = await fetch("http://localhost:4005/api/cart/all", {
        headers: { "Authorization": `Bearer ${token}` }, // ✅ เพิ่ม Token
      });
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  // ✅ ฟังก์ชันสร้างตะกร้าใหม่
  const createCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4005/api/cart/admin-create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // ✅ เพิ่ม Token
        },
        body: JSON.stringify({ user_id: userId, product_id: productId, quantity }),
      });

      if (response.ok) {
        alert("เพิ่มตะกร้าใหม่สำเร็จ!"); // ✅ แจ้งเตือน
        fetchCartItems(); // ✅ โหลดข้อมูลใหม่
      } else {
        alert("เกิดข้อผิดพลาดในการเพิ่มตะกร้า!");
      }
    } catch (error) {
      console.error("Error creating cart:", error);
    }
  };

  // ✅ ฟังก์ชันลบตะกร้าของผู้ใช้
  const clearUserCart = async (user_id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบตะกร้านี้?")) return; // ✅ เพิ่มการยืนยันก่อนลบ
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:4005/api/cart/clear/${user_id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }, // ✅ เพิ่ม Token
      });

      alert("ลบตะกร้าสำเร็จ!"); // ✅ แจ้งเตือน
      fetchCartItems(); // ✅ โหลดข้อมูลใหม่
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <div className="admin-cart">
      <h2>จัดการตะกร้าของผู้ใช้</h2>
      <div className="cart-actions">
        <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <input type="text" placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
        <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <button onClick={createCart}>เพิ่มตะกร้าใหม่</button>
      </div>
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <p className="empty-cart">ไม่มีสินค้าในตะกร้า</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <h3>ผู้ใช้: {item.User?.name} ({item.User?.email})</h3>
              <p>สินค้า: {item.Vegetable?.name}</p>
              <p>จำนวน: {item.quantity}</p>
              <button className="clear-cart-btn" onClick={() => clearUserCart(item.User?.id)}>ลบตะกร้าทั้งหมด</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCartPage;
