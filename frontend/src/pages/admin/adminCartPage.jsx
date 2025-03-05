import React, { useState, useEffect } from "react";
import "../../css/adminCartPage.css";

const AdminCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    fetchCartItems();
  }, []);

  // ✅ ดึงข้อมูลตะกร้าของผู้ใช้ทั้งหมด
  const fetchCartItems = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/cart/all");
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  // ✅ เพิ่มตะกร้าใหม่ให้ผู้ใช้
  const createCart = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/cart/admin-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: productId, quantity }),
      });

      if (response.ok) {
        fetchCartItems(); // ✅ โหลดข้อมูลใหม่
      }
    } catch (error) {
      console.error("Error creating cart:", error);
    }
  };

  // ✅ ลบตะกร้าทั้งหมดของผู้ใช้
  const clearUserCart = async (user_id) => {
    try {
      await fetch(`http://localhost:4005/api/cart/clear/${user_id}`, {
        method: "DELETE",
      });

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
              <h3>ผู้ใช้: {item.User.name} ({item.User.email})</h3>
              <p>สินค้า: {item.Vegetable.name}</p>
              <p>จำนวน: {item.quantity}</p>
              <button className="clear-cart-btn" onClick={() => clearUserCart(item.User.id)}>ลบตะกร้าทั้งหมด</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCartPage;
