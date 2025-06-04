import React, { useEffect, useState } from "react";
import "../../css/adminOrderPage.css";
import { API } from "../../lib/api";

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDOW, setFilterDOW] = useState(""); // 👈 ตัวกรองวันจัดส่ง

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API}/api/order`);
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await fetch(`${API}/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ Order #${orderId}?`)) return;

    try {
      const response = await fetch(`${API}/api/order/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        return alert(`ลบไม่สำเร็จ: ${result.message}`);
      }

      setOrders((prevOrders) => prevOrders.filter((order) => order.order_id !== orderId));
      alert(`ลบ Order #${orderId} สำเร็จแล้วค่ะ`);
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("เกิดข้อผิดพลาดขณะลบคำสั่งซื้อ");
    }
  };

  const renderOrder = (order) => {
    return (
      <div key={order.order_id} className="order-item-user">
        <h4>Order #{order.order_id}</h4>
        <p>จัดส่งวันที่: {order.date_deli?.slice(0, 10)} ({order.DOW || "ไม่ระบุ"})</p>
        <p>ผัก {order.Order_Items.length} รายการ รวม {order.Order_Items.reduce((sum, item) => sum + item.quantity, 0)} หน่วย</p>

        {/* ✅ แสดงรายการผัก */}
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
          {order.Order_Items.map((item) => (
            <li key={item.order_item_id}>
              {item.Vegetable?.name || "ไม่พบชื่อผัก"} × {item.quantity} หน่วย
            </li>
          ))}
        </ul>

        <div className="order-buttons">
          <label htmlFor={`status-${order.order_id}`}>เปลี่ยนสถานะ:</label>
          <select
            id={`status-${order.order_id}`}
            value={order.status}
            onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
          >
            <option value="pending">รอดำเนินการ</option>
            <option value="shipped">จัดส่งแล้ว</option>
            <option value="delivered">ส่งสำเร็จ</option>
          </select>

          <button className="order-delete-btn" onClick={() => handleDeleteOrder(order.order_id)}>
            ลบคำสั่งซื้อ
          </button>
        </div>
      </div>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const name = order.User?.name?.toLowerCase() || "";
    const email = order.User?.email?.toLowerCase() || "";
    const userId = order?.user_id?.toLowerCase() || "";

    const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm) || userId.includes(searchTerm);
    const matchesDOW = !filterDOW || order.DOW === filterDOW;

    return matchesSearch && matchesDOW;
  });

  return (
    <div className="admin-order-layout">
      <div className="admin-order-controls">
        {/* 🎛️ Control Panel */}
        <h2>จัดการคำสั่งซื้อทั้งหมด</h2>
        <input
          type="text"
          placeholder="ค้นหาชื่อ อีเมลผู้ใช้ หรือ ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
        <select value={filterDOW} onChange={(e) => setFilterDOW(e.target.value)}>
          <option value="">-- ทุกวัน --</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
      </div>

      <div className="admin-order-display">
        {/* 🔲 กริด 3 คอลัมน์ตามสถานะ */}
        <div className="order-warp">
          <div className="order-column pending">
            {filteredOrders.filter((o) => o.status === "pending").map(renderOrder)}
          </div>
          <div className="order-column shipped">
            {filteredOrders.filter((o) => o.status === "shipped").map(renderOrder)}
          </div>
          <div className="order-column delivered">
            {filteredOrders.filter((o) => o.status === "delivered").map(renderOrder)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderPage;
