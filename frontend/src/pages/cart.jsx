import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/cart.css";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof user.user_id !== "number") {
      console.warn("⚠️ user ยังไม่พร้อมหรือ user_id ไม่ถูกต้อง");
      return;
    }

    const fetchCartItems = async () => {
      try {
        console.log("🔍 [DEBUG] เรียก API ด้วย userId:", user.user_id);
        const response = await fetch(`http://localhost:4005/api/cart/user/${user.user_id}`);
        const data = await response.json();
        console.log("📦 [DEBUG] ข้อมูลที่ได้จาก API:", data);
        setCartItems(data);
      } catch (error) {
        console.error("❌ Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [user.user_id]); // 👈 ใช้ userId จาก context


  const updateCartQuantity = async (cart_id, newQuantity) => {
    try {
      const response = await fetch(`http://localhost:4005/api/cart/${cart_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const updatedItem = await response.json();

      if (response.ok) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.cart_id === cart_id ? { ...item, quantity: updatedItem.quantity } : item
          )
        );
      } else {
        alert(updatedItem.message || "อัปเดตจำนวนไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const increaseQuantity = (item) => {
    if (item.quantity < 10) {
      updateCartQuantity(item.cart_id, item.quantity + 1);
    } else {
      alert("คุณไม่สามารถซื้อเกิน 10 ชิ้นต่อรายการได้ค่ะ");
    }
  };

  const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
      updateCartQuantity(item.cart_id, item.quantity - 1);
    }
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("ไม่สามารถสั่งซื้อได้เพราะตะกร้าว่างค่ะ");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4005/api/order/place/${user.user_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: user.user_id, // ✅ ตรงกับ database
          items: cartItems.map((item) => ({
            vegetable_id: item.vegetable_id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("สั่งซื้อสำเร็จแล้วค่ะ 🎉");
        setCartItems([]); // ✅ เคลียร์ตะกร้า
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error placing order:", error);
      alert("เกิดข้อผิดพลาดขณะสั่งซื้อ");
    }
  };


  return (
    <div className="cart">
      <h2>ตะกร้าของฉัน</h2>
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <p className="empty-cart">ตะกร้าของคุณยังว่างอยู่ค่ะ 🛒</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.cart_id} className="cart-item">
              <img
                src={item.Vegetable?.image}
                alt={item.Vegetable?.name}
                className="cart-image"
              />
              <div className="cart-info">
                <h3>{item.Vegetable?.name || `#${item.vegetable_id}`}</h3>
              </div>
              <div className="cart-quantity">
                <button className="quantity-btn" onClick={() => decreaseQuantity(item)}>-</button>
                <span>{item.quantity}</span>
                <button className="quantity-btn" onClick={() => increaseQuantity(item)}>+</button>
              </div>
            </div>
          ))
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="place-order">
          <button className="place-order-btn" onClick={placeOrder}>
            ✅ สั่งซื้อสินค้า
          </button>
        </div>
      )}
      <div className="add-more">
        <button className="add-more-btn" onClick={() => navigate("/veg")}>
          🥬 เลือกผักเพิ่มเติม
        </button>
      </div>
    </div>
  );
};

export default Cart;
