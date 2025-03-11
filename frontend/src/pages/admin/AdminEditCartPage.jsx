import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AdminEditCartPage = () => {
  const { user_id } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4005/api/cart/user/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(await response.json());
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const updateCartItems = async () => {
    try {
      const token = localStorage.getItem("token");

      await Promise.all(
        cartItems.map(async (item) => {
          await fetch(`http://localhost:4005/api/cart/${item.cart_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: item.quantity }),
          });
        })
      );

      alert("✅ อัปเดตจำนวนสำเร็จ!");
      navigate("/admin-cart");
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  return (
    <div className="admin-edit-cart">
      <h2>🛒 แก้ไขตะกร้าของผู้ใช้</h2>

      {cartItems.length > 0 ? (
        cartItems.map((item) => (
          <div key={item.cart_id}>
            <p>🥦 {item.Vegetable?.name || "ไม่พบสินค้า"}</p>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => {
                const newQuantity = Number(e.target.value);
                setCartItems(cartItems.map((cart) =>
                  cart.cart_id === item.cart_id ? { ...cart, quantity: newQuantity } : cart
                ));
              }}
              min="1"
            />
          </div>
        ))
      ) : (
        <p>🔄 กำลังโหลด...</p>
      )}

      <button onClick={updateCartItems}>💾 บันทึก</button>
      <button onClick={() => navigate("/admin-cart")}>❌ ยกเลิก</button>
    </div>
  );
};

export default AdminEditCartPage;
