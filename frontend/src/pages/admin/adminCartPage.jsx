import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/adminCartPage.css";
import { API } from "../../lib/api";

const AdminCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchVeg, setSearchVeg] = useState("");
  const [userSearch, setUserSearch] = useState("");
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
      const response = await fetch(`http://localhost:4005/api/${endpoint}` || `${API}/api/${endpoint}`);
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4005/api/cart/all" || `${API}/api/cart/all`, {
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

    const userCredit = user.credit ?? 0;

    // 1️⃣ หาผักใน cart เดิมของผู้ใช้นี้
    const currentCartQty = cartItems
      .filter((item) => item.User?.user_id === user.user_id)
      .reduce((sum, item) => sum + item.quantity, 0);

    // 2️⃣ แปลงรายการใหม่ที่จะเพิ่ม
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

    // 3️⃣ รวมของเดิม + ใหม่ แล้วตรวจเครดิต
    const newCartQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalQty = currentCartQty + newCartQty;

    if (totalQty > userCredit) {
      return alert(`❌ เครดิตไม่พอ! ผู้ใช้นี้มี ${userCredit} หน่วย แต่คุณใส่รวมแล้ว ${totalQty}`);
    }


    try {
      const responses = await Promise.all(
        items.map(async (item) => {
          const response = await fetch(
            "http://localhost:4005/api/cart/admin-create" || `${API}/api/cart/admin-create`,
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

      alert("✅ เพิ่มตะกร้าใหม่สำเร็จ!");
      fetchCartItems();
      setSelectedVegetables([]);
      setQuantityMap({});
    } catch (error) {
      console.error("Error creating cart:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า!");
    }
  };

  const deleteUserCart = async (user_id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบตะกร้าของผู้ใช้นี้?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:4005/api/cart/clear/${user_id}` || `${API}/api/cart/clear/${user_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("ลบตะกร้าสำเร็จ!");
      fetchCartItems();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

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
      const response = await fetch(`http://localhost:4005/api/order/place/${user_id}` || `${API}/api/order/place/${user_id}`, {
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

  const filteredCart = Object.values(groupedCart).filter(({ user }) => {
    const name = user?.name?.toLowerCase() || "";
    const id = user?.user_id?.toString().toLowerCase() || "";
    return name.includes(userSearch) || id.includes(userSearch);
  });


  return (
    <div className="admin-cart-grid">
      <div className="cart-actions">
        <h3>หาตะกร้าของผู้ใช้</h3>
        <input
          type="text"
          placeholder="ค้นหาชื่อหรือ ID ผู้ใช้..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value.toLowerCase())}
        />
        <h3>จัดการตะกร้าของผู้ใช้</h3>
        <input
          list="user-list"
          placeholder="ค้นหาผู้ใช้..."
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        />
        <datalist id="user-list">
          {users.map((usr) => (
            <option key={usr.user_id} value={usr.name}>
              {usr.name} ({usr.email})
            </option>
          ))}
        </datalist>

        <input
          list="vegetable-list"
          placeholder="ค้นหาผัก..."
          value={searchVeg}
          onChange={(e) => setSearchVeg(e.target.value)}
        />
        <datalist id="vegetable-list">
          {vegetables.map((veg) => (
            <option key={veg.vegetable_id} value={veg.name} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={() => {
            if (!searchVeg.trim()) return;
            if (selectedVegetables.includes(searchVeg)) {
              alert("เพิ่มซ้ำไม่ได้ค่ะ");
              return;
            }
            setSelectedVegetables([...selectedVegetables, searchVeg]);
            setSearchVeg(""); // ล้างหลังเพิ่ม
          }}
        >
          เพิ่มผัก
        </button>

        {selectedVegetables.map((vegName, index) => (
          <div key={index}>
            <p>{vegName}</p>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="จำนวน"
              value={quantityMap[vegName] || ""}
              onChange={(e) => {
                const value = Math.max(1, parseInt(e.target.value) || 1); // ป้องกันค่าติดลบ
                setQuantityMap({ ...quantityMap, [vegName]: value });
              }}
            />
          </div>
        ))}
        {selectedVegetables.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedVegetables([]);
              setQuantityMap({});
            }}
            className="remove-button"
          >
            ล้างผักที่เลือกทั้งหมด
          </button>
        )}

        <button onClick={createCart}>เพิ่มสินค้าใหม่</button>
      </div>

      <div className="cart-container">
        {filteredCart.length === 0 ? (
          <div className="cart-empty-box">
            <p className="empty-cart-admin">ยังไม่มีตะกร้าของผู้ใช้ใดเลยค่ะ 🧺</p>
          </div>
        ) : (
          filteredCart.slice(0, 20).map(({ user, vegetables }) => (
            <div key={user?.user_id || "unknown"} className="cart-item-user">
              <div className="cart-info">
                <h3>ผู้ใช้: {user?.name || "ไม่พบผู้ใช้"} ({user?.email})</h3>
                {vegetables.map((vegItem) => {
                  const imageUrl = vegItem.Vegetable?.image_url || "❌ ไม่มีรูป";
                  return (
                    <div key={vegItem.cart_id} className="cart-row">

                      <img src={imageUrl} alt={vegItem.Vegetable?.name || "vegetable"} className="cart-image" />

                      <div className="cart-text">
                        <p>{vegItem.Vegetable?.name || "ไม่พบสินค้า"}</p>
                        <p>จำนวน: {vegItem.quantity} หน่วย</p>
                      </div>

                    </div>
                  );
                })}
              </div>
              <div className="cart-buttons">
                <button onClick={() => navigate(`/admin-edit-cart/${user.user_id}`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                </button>
                <button onClick={() => deleteUserCart(user.user_id)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                </button>
                <button onClick={() => placeOrder(user.user_id)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AdminCartPage;