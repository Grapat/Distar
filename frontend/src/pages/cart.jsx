import React, { useState, useEffect } from "react";
import "../css/cart.css";

const Cart = ({ userId }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch(`http://localhost:4005/api/cart/user/${userId}`);
        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cart_id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cart_id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  return (
    <div className="cart">
      <h2>ตะกร้าของฉัน</h2>
      <div className="cart-container">
        {cartItems.map((item) => (
          <div key={item.cart_id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-image" />
            <div className="cart-info">
              <h3>{item.name || `#${item.vegetable_id}`} </h3>
              <p>{item.weight} กรัม - {item.price} บาท</p>
            </div>
            <div className="cart-quantity">
              <button className="quantity-btn" onClick={() => decreaseQuantity(item.cart_id)}>-</button>
              <span>{item.quantity}</span>
              <button className="quantity-btn" onClick={() => increaseQuantity(item.cart_id)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cart;
