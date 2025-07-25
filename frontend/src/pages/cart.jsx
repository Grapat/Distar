import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Cart.css";
import { useAuth } from "../context/AuthContext";
import { API } from "../lib/api";

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [userCredit, setUserCredit] = useState(null);
  const [userAddressOptions, setUserAddressOptions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalCartSnapshot, setOriginalCartSnapshot] = useState([]);
  const [editedItems, setEditedItems] = useState({});
  const [deletedItems, setDeletedItems] = useState([]);
  const navigate = useNavigate();
  const [deliveryDate, setDeliveryDate] = useState("");


  useEffect(() => {
    if (!user?.user_id) return;

    const fetchCartItems = async () => {
      try {
        const response = await fetch(`${API}/api/cart/user/${user.user_id}`);
        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        console.error("❌ Error fetching cart items:", error);
      }
    };

    const fetchUserCredit = async () => {
      try {
        const response = await fetch(`${API}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUserCredit(data.user?.credit ?? 0);

        const addrList = [];

        if (data.user?.address && data.user?.province && data.user?.zipcode) {
          addrList.push(`${data.user.address} ${data.user.province} ${data.user.zipcode}`);
        }

        if (data.user?.alt_address) {
          addrList.push(data.user.alt_address);
        }

        setUserAddressOptions(addrList);
        setSelectedAddress(addrList[0] || "");
      } catch (err) {
        console.error("❌ ดึงเครดิตไม่สำเร็จ", err);
      }
    };
    fetchCartItems();
    fetchUserCredit();
  }, [user?.user_id]);


  const updateCartQuantity = async (cart_id, newQuantity) => {
    try {
      const response = await fetch(`${API}/api/cart/${cart_id}`, {
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
      await fetch(`${API}/api/cart/${cart_id}`, {
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
      if (!deliveryDate) {
        alert("❌ กรุณาเลือกวันที่จัดส่งก่อนค่ะ");
        return;
      }

      const response = await fetch(`${API}/api/order/place/${user.user_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          date_deli: deliveryDate, // ✅ ส่งวันจัดส่ง
          address: selectedAddress, // ✅ ใช้อันที่ user เลือก
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

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 7);

  const formatDate = (date) => date.toISOString().split("T")[0];


  return (
    <div className="cart-page">
      <div className="cart">
        <div className="cart-container-user">
          <h2>ตะกร้าของฉัน</h2>
          {cartItems.length === 0 ? (
            <div className="cart-item">
              <p className="empty-cart">ตะกร้าของคุณยังว่างอยู่ค่ะ 🛒</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.cart_id} className="cart-item-user">
                <img
                  src={item.Vegetable.image_url || "/images/vegs/default.png"}
                  alt={item.Vegetable?.name || "vegetable"}
                  className="cart-image"
                />
                <div className="cart-info">
                  <h3>{item.Vegetable?.name || `#${item.vegetable_id}`}</h3>
                  <div className="cart-quantity">
                    <span>{editedItems[item.cart_id] ?? item.quantity}</span>
                    <div className="quantity-controls">
                      <button
                        className={`quantity-btn ${isEditing ? "btn-toggle-visible" : "btn-toggle-hidden"}`}
                        onClick={() => decreaseQuantity(item)}
                      >
                        -
                      </button>
                      <button
                        className={`quantity-btn ${isEditing ? "btn-toggle-visible" : "btn-toggle-hidden"}`}
                        onClick={() => increaseQuantity(item)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="cart-delete-wrapper">
                  <button
                    className={`delete-btn ${isEditing ? "btn-toggle-visible" : "btn-toggle-hidden"}`}
                    onClick={() => deleteCartItem(item.cart_id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
          {cartItems.length > 0 && (
            <>
              <div className="cart-total">
                <strong>ยอดรวม: </strong> {calculateTotal()} units
              </div>
            </>
          )}
          {!isEditing ? (
            <div className="action-buttons">
              <button className="edit-btn" onClick={() => {
                setOriginalCartSnapshot(cartItems.map(item => ({ ...item })));
                setIsEditing(true);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                  <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                </svg>
                แก้ไขตะกร้า
              </button>
            </div>
          ) : (
            <div className="action-buttons">
              <button className="save-btn" onClick={saveChanges}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                </svg>
                บันทึกการแก้ไข
              </button>
              <button className="cancel-btn" onClick={() => {
                setCartItems(originalCartSnapshot.map(item => ({ ...item })));
                setEditedItems({});
                setDeletedItems([]);
                setIsEditing(false);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                </svg>
                ยกเลิกการแก้ไข
              </button>
            </div>
          )}
          <div className="add-more">
            <button className="add-more-btn" onClick={() => navigate("/veg")}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              เลือกผักเพิ่มเติม
            </button>
          </div>
          <div className="address-choice-section">
            <label>🏠 เลือกที่อยู่จัดส่ง:</label>
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="address-select"
            >
              {userAddressOptions.map((addr, index) => (
                <option key={index} value={addr}>
                  {addr}
                </option>
              ))}
            </select>
          </div>
          <div className="delivery-date-section">
            <label htmlFor="deliveryDate">📅 วันที่จัดส่งสินค้า:</label>
            <input
              type="date"
              id="deliveryDate"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={formatDate(minDate)}
              max={formatDate(maxDate)}
              className="delivery-date-input"
            />
          </div>
          <div className="place-order">
            <button className={`place-order-btn ${isEditing ? "btn-toggle-hidden" : "btn-toggle-visible"}`} onClick={placeOrder}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
              สั่งซื้อสินค้า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
