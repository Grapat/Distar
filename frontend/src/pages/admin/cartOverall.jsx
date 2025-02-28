import React, { useState, useEffect } from "react";
import "../css/cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Fetch only unsubmitted cart items from API
    const fetchCartItems = async () => {
      try {
        const response = await fetch("http://localhost:4005/api/cart/unsubmitted");
        const data = await response.json();
        setCartItems(data);
        
        // Calculate total price
        const total = data.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalPrice(total);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, []);

  // Increase quantity
  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
    recalculateTotalPrice();
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
    );
    recalculateTotalPrice();
  };

  // Recalculate total price when quantity changes
  useEffect(() => {
    recalculateTotalPrice();
  }, [cartItems]);

  const recalculateTotalPrice = () => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  return (
    <div className="cart">
      <h2>ตะกร้าของฉัน (ยังไม่ส่งคำสั่งซื้อ)</h2>
      <p>ราคารวม: {totalPrice.toLocaleString()} บาท</p>
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <p className="empty-cart">ไม่มีสินค้าในตะกร้า</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-image" />
              <div className="cart-info">
                <h3>{item.name} ({item.englishName})</h3>
                <p>{item.weight} กรัม - {item.price} บาท</p>
              </div>
              <div className="cart-quantity">
                <button className="quantity-btn" onClick={() => decreaseQuantity(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button className="quantity-btn" onClick={() => increaseQuantity(item.id)}>+</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Cart;