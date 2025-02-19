import React from "react";
import "./css/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./component/landingPage";
import HomePage from "./component/homePage";
import Vegetable from "./component/vegetable";
import VegDetail from "./component/vegDetail";
import PopularVegetables from "./component/popularVegetables";
import OrderDeliver from "./component/orderDelivery";
import Header from "./component/header";
import BottomNav from "./component/bottomNav";
import Cart from "./component/cart";

function App() {
  return (
    <div className="App">
      <Router>
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<div><Header /><HomePage /><BottomNav /></div>} />
            <Route path="/veg" element={<div><Header /><Vegetable /><BottomNav /></div>} />
            <Route path="/veg/:id" element={<div><VegDetail /><BottomNav /></div>} />
            <Route path="/popular" element={<div><PopularVegetables /><BottomNav /></div>} />
            <Route path="/cart" element={<div><Cart /><BottomNav /></div>} />
            <Route path="/orders" element={<div><OrderDeliver /><BottomNav /></div>} />
            <Route path="/*" element={<div><Header /><HomePage /><BottomNav /></div>} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
