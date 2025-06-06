import React, { useEffect, useState } from "react";
import "../../css/adminOrderPage.css";
import { API } from "../../lib/api";

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDOW, setFilterDOW] = useState(""); // 👈 ตัวกรองวันจัดส่ง
  const [statusFilter, setStatusFilter] = useState(""); // 👈 กรองสถานะ

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
      <div key={order.order_id} className="order-wrapper" style={{ marginBottom: "2rem", padding: "1rem", border: "5px solid #8bc34a", borderRadius: "12px", background: "#fdfdfd", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <table className="order-table" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th colSpan="3">คำสั่งซื้อของ {order.User.name}</th>
            </tr>
            <tr>
              <td colSpan="3">
                <span className={`status-badge ${order.status}`}>
                  {order.status === "pending" ? "รอดำเนินการ" : order.status === "shipped" ? "จัดส่งแล้ว" : "ส่งสำเร็จ"}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                จัดส่งวันที่: {order.date_deli?.slice(0, 10)} ({order.DOW || "ไม่ระบุ"})<br />
                รวม {order.Order_Items.length} รายการ / {order.Order_Items.reduce((sum, item) => sum + item.quantity, 0)} หน่วย <br />
                สถานที่จัดส่ง: {order.address || "ไม่พบที่อยู่จัดส่ง"}
              </td>
            </tr>
            <tr>
              <th>ลำดับ</th>
              <th>ชื่อผัก</th>
              <th>จำนวน (หน่วย)</th>
            </tr>
          </thead>
          <tbody>
            {order.Order_Items.map((item, index) => (
              <tr key={item.order_item_id}>
                <td>{index + 1}</td>
                <td>{item.Vegetable?.name || "ไม่พบชื่อผัก"}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Section แยก control ออกจากตาราง */}
        <div className="order-controls" style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <label htmlFor={`status-${order.order_id}`}>เปลี่ยนสถานะ: </label>
            <select
              id={`status-${order.order_id}`}
              value={order.status}
              onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
              style={{ padding: "6px", borderRadius: "6px" }}
            >
              <option value="pending">รอดำเนินการ</option>
              <option value="shipped">จัดส่งแล้ว</option>
              <option value="delivered">ส่งสำเร็จ</option>
            </select>
          </div>

          <button
            onClick={() => handleDeleteOrder(order.order_id)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
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
    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesDOW && matchesStatus;
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
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">-- ทุกสถานะ --</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="shipped">จัดส่งแล้ว</option>
          <option value="delivered">ส่งสำเร็จ</option>
        </select>
      </div>

      <div className="admin-order-display">
        <div className="order-warp">
          {filteredOrders.length === 0 ? (
            <p>ไม่มีคำสั่งซื้อที่ตรงกับเงื่อนไข</p>
          ) : (
            filteredOrders.map(renderOrder)
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderPage;
