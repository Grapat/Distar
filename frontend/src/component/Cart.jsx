import React, { useState, useEffect } from "react";
import "../css/cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Fetch cart items from API or state management
    const fetchCartItems = async () => {
      try {
        const response = await fetch("http://localhost:4005/api/cart");
        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, []);

  // Increase quantity
  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  return (
    <div className="cart">
      <h2>ตะกร้าของฉัน</h2>
      <div className="cart-container">
        {cartItems.map((item) => (
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
        ))}
      </div>
    </div>
  );
};

export default Cart;
// The Cart component fetches cart items from the API and displays them in a list. The quantity of each item can be increased or decreased using the buttons. The state is managed using the useState hook, and the useEffect hook is used to fetch the data from the API when the component mounts.