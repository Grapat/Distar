import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../css/adminCartPage.css";

const AdminCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedVegetables, setSelectedVegetables] = useState([]);
  const [quantityMap, setQuantityMap] = useState({});
  const [editingCart, setEditingCart] = useState(null);

  useEffect(() => {
    fetchCartItems();
    fetchUsers();
    fetchVegetables();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchVegetables = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/vegs");
      const data = await response.json();
      setVegetables(data);
    } catch (error) {
      console.error("Error fetching vegetables:", error);
    }
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4005/api/cart/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("Cart Data:", data);
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const createCart = async () => {
    try {
      const token = localStorage.getItem("token");

      const selectedUserObj = users.find((usr) => usr.name === selectedUser);
      if (!selectedUserObj) {
        alert("กรุณาเลือกผู้ใช้ที่ถูกต้อง!");
        return;
      }

      const selectedVegetablesData = selectedVegetables.map((vegName) => {
        const veg = vegetables.find((v) => v.name === vegName);
        return {
          vegetable_id: veg ? veg.vegetable_id : null,
          quantity: quantityMap[vegName] || 1,
        };
      }).filter(v => v.vegetable_id !== null);

      if (selectedVegetablesData.length === 0) {
        alert("กรุณาเลือกผักที่ถูกต้อง!");
        return;
      }

      await Promise.all(selectedVegetablesData.map(async (vegItem) => {
        await fetch("http://localhost:4005/api/cart/admin-create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: selectedUserObj.user_id,
            vegetable_id: vegItem.vegetable_id,
            quantity: vegItem.quantity,
          }),
        });
      }));

      alert("เพิ่มตะกร้าใหม่สำเร็จ!");
      fetchCartItems();
    } catch (error) {
      console.error("Error creating cart:", error);
    }
  };

  const clearUserCart = async (user_id) => {
    console.log("Deleting cart for user:", user_id);
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบตะกร้านี้?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4005/api/cart/clear/${user_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("ลบตะกร้าสำเร็จ!");
        fetchCartItems();
      } else {
        console.error("Failed to delete cart item. Response:", response);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const saveCartEdit = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:4005/api/cart/${editingCart.cart_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: editingCart.quantity }),
      });

      if (response.ok) {
        alert("อัปเดตจำนวนสำเร็จ!");
        setEditingCart(null);
        fetchCartItems();
      } else {
        alert("เกิดข้อผิดพลาดในการอัปเดต!");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const groupCartItemsByUser = (cartItems) => {
    return cartItems.reduce((groupedCart, item) => {
      const userKey = item.User ? item.User.user_id : "unknown";

      if (!groupedCart[userKey]) {
        groupedCart[userKey] = {
          user: item.User,
          vegetables: [],
        };
      }

      groupedCart[userKey].vegetables.push({
        name: item.Vegetable ? item.Vegetable.name : "ไม่พบสินค้า",
        quantity: item.quantity,
        cart_id: item.cart_id,
      });

      return groupedCart;
    }, {});
  };

  const groupedCart = groupCartItemsByUser(cartItems);

  return (
    <div className="admin-cart">
      <h2>จัดการตะกร้าของผู้ใช้</h2>
      <div className="cart-actions">
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">เลือกผู้ใช้</option>
          {users.map((usr) => (
            <option key={usr.user_id} value={usr.name}>
              {usr.name} ({usr.email})
            </option>
          ))}
        </select>

        <select multiple value={selectedVegetables} onChange={(e) => {
          const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
          setSelectedVegetables(selectedOptions);
        }}>
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
              onChange={(e) => setQuantityMap({ ...quantityMap, [vegName]: e.target.value })}
            />
          </div>
        ))}

        <button onClick={createCart}>เพิ่มตะกร้าใหม่</button>
      </div>
      
      <div className="cart-container">
        {Object.values(groupedCart).length === 0 ? (
          <p className="empty-cart">ไม่มีสินค้าในตะกร้า</p>
        ) : (
          Object.values(groupedCart).map((cart) => (
            <div key={cart.user?.user_id} className="cart-item">
              <h3>
                ผู้ใช้:{" "}
                {cart.user
                  ? `${cart.user.name} (${cart.user.email})`
                  : "ไม่พบผู้ใช้"}
              </h3>
              {cart.vegetables.map((veg, index) => (
                <div key={index}>
                  <p>{veg.name}: {editingCart?.cart_id === veg.cart_id ? (
                    <input type="number" value={editingCart.quantity} onChange={(e) => setEditingCart({ ...editingCart, quantity: e.target.value })} />
                  ) : veg.quantity} ชิ้น</p>
                  <button onClick={() => setEditingCart(veg)}>✏️ แก้ไข</button>
                  {editingCart?.cart_id === veg.cart_id && (
                    <button onClick={saveCartEdit}>💾 บันทึก</button>
                  )}
                </div>
              ))}
              <button className="clear-cart-btn" onClick={() => clearUserCart(cart.user?.user_id)}>
                ลบตะกร้าทั้งหมด
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCartPage;
