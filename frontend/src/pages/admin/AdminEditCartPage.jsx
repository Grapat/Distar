import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../lib/api";

const AdminEditCartPage = () => {
  const { user_id } = useParams();
  const [userCredit, setUserCredit] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
    fetchUserCredit();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/cart/user/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(await response.json());
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const fetchUserCredit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/users/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text(); // 💡 อ่านแบบ text ก่อน
      try {
        const data = JSON.parse(text);
        setUserCredit(data.credit ?? 0);
      } catch (jsonErr) {
        console.error("❌ ไม่สามารถแปลง JSON ได้:", text);
        throw jsonErr;
      }
    } catch (err) {
      console.error("❌ ดึงเครดิตผู้ใช้ไม่สำเร็จ:", err);
      setUserCredit(0);
    }
  };

  const updateCartItems = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ รวมจำนวนสินค้าทั้งหมดในตะกร้า
      const totalQty = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);

      // ✅ เช็คเครดิตจาก userCredit (ที่ได้จาก API ล่วงหน้า)
      if (totalQty > userCredit) {
        return alert(`❌ เครดิตไม่พอ! ผู้ใช้นี้มี ${userCredit} หน่วย แต่คุณใส่รวมแล้ว ${totalQty}`);
      }

      // ✅ อัปเดตตะกร้า
      await Promise.all(
        cartItems.map(async (item) => {
          await fetch(`${API}/api/cart/${item.cart_id}`, {
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
      navigate("/admin/cart-page");

    } catch (error) {
      console.error("Error updating cart:", error);
      alert("❌ เกิดข้อผิดพลาดในการอัปเดตตะกร้า");
    }
  };

  const deleteCartItem = async (cart_id) => {
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/api/cart/${cart_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ ลบออกจาก state
      setCartItems((prev) => prev.filter((c) => c.cart_id !== cart_id));
    } catch (err) {
      console.error("❌ ลบไม่สำเร็จ:", err);
      alert("เกิดข้อผิดพลาดในการลบรายการค่ะ");
    }
  };

  return (
    <div className="admin-cart">
      <div className="admin-cart-grid">
        {/* Sidebar ซ้าย */}
        <div className="cart-actions">
          <h2>🛒 แก้ไขตะกร้าของผู้ใช้</h2>
          <p>💡 หมายเหตุ:</p>
          <ul>
            <li>สามารถแก้จำนวนสินค้าได้โดยตรง</li>
            <li>กดปุ่ม 🗑️ เพื่อลบรายการ</li>
          </ul>

          <button onClick={updateCartItems} className="cart-action-save">บันทึก</button>
          <button onClick={() => navigate("/admin/cart-page")} className="cart-action-cancel">ยกเลิก</button>
        </div>

        {/* Main Content ขวา */}
        <div>
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const imageUrl = item.Vegetable?.image_url?.trim()
                ? item.Vegetable.image_url
                : "/images/vegs/default.png";

              return (
                <div key={item.cart_id} className="cart-row">
                  <img src={imageUrl} alt={item.Vegetable?.name} className="cart-image" />
                  <div className="cart-text">
                    <p>{item.Vegetable?.name || "ไม่พบสินค้า"}</p>
                    <div className="cart-input-group">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = Number(e.target.value);
                          setCartItems(cartItems.map((cart) =>
                            cart.cart_id === item.cart_id ? { ...cart, quantity: newQuantity } : cart
                          ));
                        }}
                      />

                    </div>
                  </div>
                  <button className="cart-delete-btn" onClick={() => deleteCartItem(item.cart_id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              );
            })
          ) : (
            <p>🔄 กำลังโหลด...</p>
          )}
        </div>
      </div>
    </div>

  );
};

export default AdminEditCartPage;
