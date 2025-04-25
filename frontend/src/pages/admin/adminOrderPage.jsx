import React, { useEffect, useState } from "react";
import "../../css/adminOrderPage.css";

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);

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

  return (
    <div className="admin-orders-container">
      <h1>Admin Order Management</h1>
      <div className="order-list">
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order.order_id} className="order-card">
              <h3>Order ID: {order.order_id}</h3>
              <p>Customer: {order.User?.name || "Unknown"}</p>
              <p>Status: {order.status}</p>
              <label htmlFor={`status-${order.order_id}`}>Change Status:</label>
              <select
                id={`status-${order.order_id}`}
                value={order.status}
                onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
              {/* ✅ รายการผัก */}
              {order.Order_Items?.length > 0 && (
                <div className="order-veg-list">
                  <strong>🧾 รายการผัก:</strong>
                  <ul>
                    {order.Order_Items.map((item, index) => (
                      <li key={item.order_item_id || index}>
                        🥬 {item.Vegetable?.name || `#${item.vegetable_id}`} × {item.quantity} ชิ้น
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button className="delete-btn" onClick={() => handleDeleteOrder(order.order_id)}>
                🗑️ Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrderPage;
