import React from "react";
import "./css/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import HomePage from "./pages/homePage";
import Vegetable from "./pages/vegetable";
import VegDetail from "./pages/vegDetail";
import PopularVegetables from "./pages/popularVegetables";
import OrderNav from "./pages/orderNav";
import OrderDeliver from "./pages/orderDeliver";
import OrderArrived from "./pages/orderArrived";
import OrderSuccess from "./pages/orderSuccess";
import Cart from "./pages/cart";
import AccountPage from "./pages/accountPage";
import Header from "./component/header";
import BottomNav from "./component/bottomNav";

const LayoutWithBottomNav = ({ children }) => (
  <>
    {children}
    <BottomNav />
  </>
);

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<LayoutWithBottomNav><HomePage /></LayoutWithBottomNav>} />
            <Route path="/veg" element={<LayoutWithBottomNav><Vegetable /></LayoutWithBottomNav>} />
            <Route path="/veg/:id" element={<LayoutWithBottomNav><VegDetail /></LayoutWithBottomNav>} />
            <Route path="/popular" element={<LayoutWithBottomNav><PopularVegetables /></LayoutWithBottomNav>} />
            <Route path="/cart" element={<LayoutWithBottomNav><Cart /></LayoutWithBottomNav>} />
            <Route path="/acc" element={<LayoutWithBottomNav><AccountPage /></LayoutWithBottomNav>} />

            {/* Group Order Pages under one Route */}
            <Route path="/orders/*" element={
              <LayoutWithBottomNav>
                <OrderNav />
                <Routes>
                  <Route path="deliver" element={<OrderDeliver status="deliver" />} />
                  <Route path="arrived" element={<OrderArrived status="arrived" />} />
                  <Route path="success" element={<OrderSuccess status="success" />} />
                </Routes>
              </LayoutWithBottomNav>
            } />

            <Route path="/*" element={<LayoutWithBottomNav><HomePage /></LayoutWithBottomNav>} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
