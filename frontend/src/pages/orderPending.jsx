import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../css/order.css";
import { API } from "../lib/api";

const OrderPending = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const user_id = user?.user_id;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user_id) return;

        const response = await fetch(`${API}/api/order/pending/user/${user_id}`);
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching pending orders:", error);
      }
    };

    fetchOrders();
  }, [user_id]); // 🔄 รีโหลดใหม่เมื่อ user_id เปลี่ยน

  return (
    <div className="order-container">
      <div className="order-box">
        <h2>คำสั่งซื้อที่ยังไม่จัดส่ง</h2>
        {orders.length === 0 ? (
          <p className="no-orders">ไม่มีคำสั่งซื้อในขณะนี้</p>
        ) : (
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order.order_id} className="order-item">
                <div className="order-info">
                  <h3>คำสั่งซื้อ #{order.order_id}</h3>
                  <p>สถานะ: <span className={`status ${order.status}`}>{order.status}</span></p>
                  <p>
                    วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrderPending;
