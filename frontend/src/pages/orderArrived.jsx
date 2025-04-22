import React, { useEffect, useState } from "react";
import "../css/order.css";

const OrderArrived = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:4005/api/orders/arrived");
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching arrived orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="order-container">
      <div className="order-content">
      <h2>คำสั่งซื้อที่ต้องได้รับ</h2>
      {orders.length === 0 ? (
        <p className="no-orders">ไม่มีคำสั่งซื้อในขณะนี้</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              <div className="order-info">
                <h3>คำสั่งซื้อ #{order.id}</h3>
                <p>สถานะ: <span className={`status ${order.status}`}>{order.status}</span></p>
                <p>วันที่สั่งซื้อ: {order.date}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
};

export default OrderArrived;