import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../css/adminOrderPage.css";

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

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
              <p>Customer: {order.user?.name || "Unknown"}</p>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrderPage;
