import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/cart.css";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [editedItems, setEditedItems] = useState({});
  const [userCredit, setUserCredit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletedItems, setDeletedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.user_id) return;
  
    const fetchCartItems = async () => {
      try {
        const response = await fetch(`http://localhost:4005/api/cart/user/${user.user_id}`);
        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        console.error("❌ Error fetching cart items:", error);
      }
    };
  
    const fetchUserCredit = async () => {
      try {
        const response = await fetch(`http://localhost:4005/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUserCredit(data.user?.credit ?? 0);
      } catch (err) {
        console.error("❌ ดึงเครดิตไม่สำเร็จ", err);
      }
    };
  
    fetchCartItems();
    fetchUserCredit();
  }, [user?.user_id]);
  

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
    if (userCredit === null) return;
  
    setEditedItems((prev) => {
      const currentQty = prev[item.cart_id] ?? item.quantity;
      const newQty = currentQty + 1;
  
      // สร้าง state ใหม่ที่ "เหมือนจะเปลี่ยนแล้ว"
      const simulated = { ...prev, [item.cart_id]: newQty };
      const total = cartItems.reduce((sum, i) => {
        const q = simulated[i.cart_id] ?? i.quantity;
        return sum + q;
      }, 0);
  
      if (total > userCredit) {
        alert(`เครดิตไม่พอ (คุณมี ${userCredit})`);
        return prev;
      }
  
      return simulated;
    });
  };

  const decreaseQuantity = (item) => {
    setEditedItems((prev) => {
      const currentQty = prev[item.cart_id] ?? item.quantity;
      if (currentQty <= 1) return prev;
  
      const newQty = currentQty - 1;
      return { ...prev, [item.cart_id]: newQty };
    });
  };

  const deleteCartItem = (cart_id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้ออกจากตะกร้า?")) return;

    setCartItems(prev => prev.filter(item => item.cart_id !== cart_id));
    setEditedItems(prev => {
      const updated = { ...prev };
      delete updated[cart_id];
      return updated;
    });
    setDeletedItems(prev => [...prev, cart_id]);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const qty = editedItems[item.cart_id] ?? item.quantity;
      return total + qty;
    }, 0);
  };

  const saveChanges = async () => {
    const newTotal = cartItems.reduce((total, item) => {
      const qty = editedItems[item.cart_id] ?? item.quantity;
      return total + qty;
    }, 0);

    if (newTotal > user.credit) {
      alert(`รวมจำนวน ${newTotal} เกินเครดิตของคุณ (${user.credit}) ค่ะ`);
      return;
    }

    for (const [cart_id, quantity] of Object.entries(editedItems)) {
      await updateCartQuantity(parseInt(cart_id), quantity);
    }

    for (const cart_id of deletedItems) {
      await fetch(`http://localhost:4005/api/cart/${cart_id}`, {
        method: "DELETE",
      });
    }

    setEditedItems({});
    setDeletedItems([]);
    setIsEditing(false);
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("ไม่สามารถสั่งซื้อได้เพราะตะกร้าว่างค่ะ");
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (total > user.credit) {
      alert(`เครดิตของคุณ (${user.credit}) ไม่พอสำหรับยอดรวม ${total} หน่วยค่ะ`);
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

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (error) {
        console.error("❌ ไม่สามารถแปลง JSON:", responseText);
        alert("❌ เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์ (response ไม่ใช่ JSON)");
        return;
      }

      if (!response.ok) {
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
                {isEditing && (
                  <button className="delete-btn" onClick={() => deleteCartItem(item.cart_id)}>
                    🗑️
                  </button>
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
