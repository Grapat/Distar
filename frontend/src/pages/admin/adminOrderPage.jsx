import React, { useEffect, useState } from "react";
import "../../css/adminOrderPage.css";

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:4005/api/order");
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
      await fetch(`http://localhost:4005/api/order/${orderId}`, {
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
      const response = await fetch(`http://localhost:4005/api/order/${orderId}`, {
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

  const filteredOrders = orders
    .filter((order) => {
      // ✅ filter ตามชื่อ/อีเมล
      const name = order.User?.name?.toLowerCase() || "";
      const email = order.User?.email?.toLowerCase() || "";
      const userId = order?.user_id?.toLowerCase() || "";
      return name.includes(searchTerm) || email.includes(searchTerm) || userId.includes(searchTerm);
    });


  return (
    <div className="admin-orders-container">
      {/* 🎛️ แถบ Controller เช่น search, filter */}
      <div className="order-controller">
        <h2>จัดการคำสั่งซื้อทั้งหมด</h2>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="ค้นหาชื่อ อีเมลผู้ใช้ หรือ ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </div>


      {/* 🔲 กริด 3 คอลัมน์สำหรับแสดง Order แยกตามสถานะ */}
      <div className="order-grid">
        <div className="order-column pending">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <h3>
            รอดำเนินการ (Pending)</h3>
          {filteredOrders.slice(0, 20).filter((o) => o.status === "pending").map(renderOrder)}
        </div>
        <div className="order-column shipped">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          <h3>
            จัดส่งแล้ว (Shipped)</h3>
          {filteredOrders.slice(0, 20).filter((o) => o.status === "shipped").map(renderOrder)}
        </div>

        <div className="order-column delivered">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
          <h3>
            ส่งสำเร็จ (Delivered)</h3>
          {filteredOrders.slice(0, 20).filter((o) => o.status === "delivered").map(renderOrder)}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderPage;
