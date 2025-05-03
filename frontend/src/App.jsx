import React from "react";
import "./css/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import HomePage from "./pages/homePage";
import AdminHome from "./pages/admin/adminHome";
import Vegetable from "./pages/vegetable";
import VegDetail from "./pages/vegDetail";
import PopularVegetables from "./pages/popularVegetables";

import OrderNav from "./component/orderNav";
import OrderPending from "./pages/orderPending";
import OrderSuccess from "./pages/orderDelivered";
import OrderShipped from "./pages/orderShipped";

import Cart from "./pages/cart";
import AccountPage from "./pages/accountPage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";

import AdminNav from "./component/adminNav";
import AdminCartPage from "./pages/admin/adminCartPage";
import AdminOrderPage from "./pages/admin/adminOrderPage";
import AdminVegetablePage from "./pages/admin/adminVegetablePage";
import AdminUserPage from "./pages/admin/adminUserPage";
import AdminEditCartPage from "./pages/admin/AdminEditCartPage";

import Header from "./component/header";
import BottomNav from "./component/bottomNav";
import AdminRoute from "./AdminRoute";
import { Navigate } from "react-router-dom";

const WithNav = ({ children }) => (
  <>
    {children}
    <BottomNav />
  </>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">

            <Header />
            <main>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/home" element={<WithNav><HomePage /></WithNav>} />
                <Route path="/veg" element={<WithNav><Vegetable /></WithNav>} />
                <Route path="/veg/:id" element={<WithNav><VegDetail /></WithNav>} />
                <Route path="/popular" element={<WithNav><PopularVegetables /></WithNav>} />
                <Route path="/cart" element={<WithNav><Cart /></WithNav>} />
                <Route path="/acc" element={<WithNav><AccountPage /></WithNav>} />

                {/* Group Order Pages under one Route */}
                <Route path="/orders/*" element={
                  <WithNav>
                    <OrderNav />
                    <Routes>
                      <Route path="pending" element={<OrderPending status="Pending" />} />
                      <Route path="shipped" element={<OrderShipped status="Shipped" />} />
                      <Route path="success" element={<OrderSuccess status="success" />} />
                    </Routes>
                  </WithNav>
                } />

                {/* Admin Route */}
                <Route path="/admin" element={<AdminRoute><AdminNav /><AdminHome /></AdminRoute>} />
                <Route path="/admin/cart-page" element={<AdminRoute><AdminNav /><AdminCartPage /></AdminRoute>} />
                <Route path="/admin/orders-page" element={<AdminRoute><AdminNav /><AdminOrderPage /></AdminRoute>} />
                <Route path="/admin/vegies-page" element={<AdminRoute><AdminNav /><AdminVegetablePage /></AdminRoute>} />
                <Route path="/admin/user-page" element={<AdminRoute><AdminNav /><AdminUserPage /></AdminRoute>} />
                <Route path="/admin-edit-cart/:user_id" element={<AdminRoute><AdminEditCartPage /></AdminRoute>} />

                <Route path="/*" element={<LoginPage />} />
              </Routes>
            </main>

          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
