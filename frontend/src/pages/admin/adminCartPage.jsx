import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/adminCartPage.css";

const AdminCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedVegetables, setSelectedVegetables] = useState([]);
  const [quantityMap, setQuantityMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData("users", setUsers);
    fetchData("vegs", setVegetables);
    fetchCartItems();
  }, []);

  const fetchData = async (endpoint, setter) => {
    try {
      const response = await fetch(`http://localhost:4005/api/${endpoint}`);
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4005/api/cart/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(await response.json());
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const createCart = async () => {
    const token = localStorage.getItem("token");
    const user = users.find((u) => u.name === selectedUser);
    if (!user) return alert("กรุณาเลือกผู้ใช้ที่ถูกต้อง!");

    const items = selectedVegetables
      .map((name) => {
        const veg = vegetables.find((v) => v.name === name);
        return veg
          ? {
            vegetable_id: veg.vegetable_id,
            quantity: Number(quantityMap[name]) || 1,
          }
          : null;
      })
      .filter(Boolean);

    if (!items.length) return alert("กรุณาเลือกผักที่ถูกต้อง!");

    try {
      const responses = await Promise.all(
        items.map(async (item) => {
          const response = await fetch(
            "http://localhost:4005/api/cart/admin-create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ user_id: user.user_id, ...item }),
            }
          );
          return response.json();
        })
      );

      const creditError = responses.find(
        (res) => res.message === "Not enough credits! Maximum is 10 per order."
      );
      if (creditError) {
        return alert("❌ จำนวนสินค้ารวมเกิน 10 รายการ! กรุณาลดจำนวนลง.");
      }
      alert("✅ เพิ่มตะกร้าใหม่สำเร็จ!");

      fetchCartItems();
    } catch (error) {
      console.error("Error creating cart:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า!");
    }
  };

  const deleteUserCart = async (user_id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบตะกร้าของผู้ใช้นี้?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:4005/api/cart/clear/${user_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("ลบตะกร้าสำเร็จ!");
      fetchCartItems();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // ✅ Group cart items by user
  const groupedCart = cartItems.reduce((grouped, item) => {
    const userKey = item.User?.user_id || "unknown";
    if (!grouped[userKey]) {
      grouped[userKey] = {
        user: item.User,
        vegetables: [],
      };
    }
    grouped[userKey].vegetables.push(item);
    return grouped;
  }, {});

  const placeOrder = async (user_id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการสั่งซื้อสินค้าให้ผู้ใช้นี้?")) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4005/api/order/place/${user_id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ ไม่สามารถแปลง JSON:", responseText);
        return alert("❌ เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์ (response ไม่ใช่ JSON)");
      }
  
      if (!response.ok) {
        console.warn("🔍 Server Message:", data.message);
        return alert(`❌ สั่งซื้อไม่สำเร็จ: ${data.message || "เกิดข้อผิดพลาด"}`);
      }
  
      alert(`✅ สั่งซื้อสำเร็จ! รหัสออเดอร์: ${data.order_id}`);
      fetchCartItems(); // 👈 โหลดข้อมูลตะกร้าใหม่
  
    } catch (error) {
      console.error("Error placing order:", error);
      alert("❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์!");
    }
  };
  
  
  return (
    <div className="admin-cart">
      <h2>จัดการตะกร้าของผู้ใช้</h2>
      <div className="cart-actions">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">เลือกผู้ใช้</option>
          {users.map((usr) => (
            <option key={usr.user_id} value={usr.name}>
              {usr.name} ({usr.email})
            </option>
          ))}
        </select>

        <select
          multiple
          value={selectedVegetables}
          onChange={(e) =>
            setSelectedVegetables(
              [...e.target.selectedOptions].map((opt) => opt.value)
            )
          }
        >
          <option value="">เลือกผัก</option>
          {vegetables.map((veg) => (
            <option key={veg.vegetable_id} value={veg.name}>
              {veg.name}
            </option>
          ))}
        </select>

        {selectedVegetables.map((vegName, index) => (
          <div key={index}>
            <p>{vegName}</p>
            <input
              type="number"
              placeholder="Quantity"
              value={quantityMap[vegName] || ""}
              onChange={(e) =>
                setQuantityMap({ ...quantityMap, [vegName]: e.target.value })
              }
            />
          </div>
        ))}

        <button onClick={createCart}>เพิ่มสินค้าใหม่</button>
      </div>

      <div className="cart-container">
        {Object.values(groupedCart).map(({ user, vegetables }) => (
          <div key={user?.user_id || "unknown"} className="cart-item">
            <h3>🧑 ผู้ใช้: {user?.name || "ไม่พบผู้ใช้"} ({user?.email})</h3>

            {vegetables.map((vegItem) => (
              <p key={vegItem.cart_id}>🥦 {vegItem.Vegetable?.name || "ไม่พบสินค้า"} - {vegItem.quantity} ชิ้น</p>
            ))}

            <button onClick={() => navigate(`/admin-edit-cart/${user.user_id}`)}>
              ✏️ แก้ไขตะกร้า
            </button>

            <button onClick={() => deleteUserCart(user.user_id)}>
              🗑️ ลบตะกร้าทั้งหมด
            </button>
            
            <button onClick={() => placeOrder(user.user_id)}>
              📦 สั่งซื้อสินค้า
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCartPage;