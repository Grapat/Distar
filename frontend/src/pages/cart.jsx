import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/cart.css";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [editedItems, setEditedItems] = useState({});
  const [isEditing, setIsEditing] = useState(false);
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
    setEditedItems(prev => {
      const currentQty = prev[item.cart_id] ?? item.quantity;
      const newQty = currentQty + 1;

      // 🔢 คำนวณยอดรวมที่กำลังจะได้ ถ้าเพิ่ม
      const totalIfIncreased = cartItems.reduce((total, i) => {
        if (i.cart_id === item.cart_id) {
          return total + newQty;
        } else {
          return total + (prev[i.cart_id] ?? i.quantity);
        }
      }, 0);

      if (newQty > 10) {
        alert("ไม่สามารถเพิ่มรายการนี้เกิน 10 ชิ้นได้ค่ะ");
        return prev;
      }

      if (totalIfIncreased > 10) {
        alert("ยอดรวมในตะกร้าต้องไม่เกิน 10 ชิ้นค่ะ");
        return prev;
      }

      return { ...prev, [item.cart_id]: newQty };
    });
  };


  const decreaseQuantity = (item) => {
    const currentQty = editedItems[item.cart_id] ?? item.quantity;
    if (currentQty > 1) {
      setEditedItems(prev => ({ ...prev, [item.cart_id]: currentQty - 1 }));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const qty = editedItems[item.cart_id] ?? item.quantity;
      return total + qty;
    }, 0);
  };

  const saveChanges = async () => {
    const invalidItems = Object.entries(editedItems).filter(([_, qty]) => qty > 10);
    if (invalidItems.length > 0) {
      alert("พบรายการที่เกิน 10 ชิ้นค่ะ กรุณาตรวจสอบก่อนบันทึก");
      return;
    }
    if (calculateTotal() > 10) {
      alert("ยอดรวมเกิน 10 ชิ้นค่ะ กรุณาลดจำนวนก่อนบันทึก");
      return;
    }
    const updates = Object.entries(editedItems);
    for (const [cart_id, quantity] of updates) {
      await updateCartQuantity(parseInt(cart_id), quantity);
    }

    setEditedItems({});
    setIsEditing(false);
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
          user_id: user.user_id,
          items: cartItems.map((item) => ({
            vegetable_id: item.vegetable_id,
            quantity: item.quantity,
          })),
        }),
      });
  
      const responseText = await response.text(); // 👈 อ่านเป็นข้อความก่อน
      let result;
  
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        console.error("❌ ไม่สามารถแปลง JSON:", responseText); // 👈 log ข้อมูลจริงจาก server
        alert("❌ เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์ (response ไม่ใช่ JSON)");
        return;
      }
  
      if (!response.ok) {
        console.warn("🔍 Server Message:", result.message);
        alert(`เกิดข้อผิดพลาด: ${result.message}`);
        return;
      }
  
      alert("สั่งซื้อสำเร็จแล้วค่ะ 🎉");
      setCartItems([]);
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
                {isEditing && (
                  <button className="quantity-btn" onClick={() => decreaseQuantity(item)}>-</button>
                )}
                <span>{editedItems[item.cart_id] ?? item.quantity}</span>
                {isEditing && (
                  <button className="quantity-btn" onClick={() => increaseQuantity(item)}>+</button>
                )}
              </div>
            </div>
          ))
        )}
        {cartItems.length > 0 && (
          <div className="cart-total">
            <strong>ยอดรวม: </strong> {calculateTotal()} units
          </div>
        )}

        {!isEditing ? (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            ✏️ แก้ไขตะกร้า
          </button>
        ) : (
          <button className="save-btn" onClick={saveChanges}>
            💾 บันทึกการเปลี่ยนแปลง
          </button>
        )}
        {isEditing && (
          <button className="cancel-btn" onClick={() => setIsEditing(false)}>
            ❌ ยกเลิกการแก้ไข
          </button>
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
