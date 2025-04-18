import React from "react";
import "./css/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./pages/homePage";
import AdminHome from "./pages/admin/adminHome";
import Vegetable from "./pages/vegetable";
import VegDetail from "./pages/vegDetail";
import PopularVegetables from "./pages/popularVegetables";
import OrderNav from "./pages/orderNav";
import OrderDeliver from "./pages/orderDeliver";
import OrderArrived from "./pages/orderArrived";
import OrderSuccess from "./pages/orderSuccess";
import Cart from "./pages/cart";
import AccountPage from "./pages/accountPage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import ForgotPasswordPage from "./pages/forgotPasswordPage";

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

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.userType === "admin" ? <Navigate to="/admin" replace /> : <WithNav>{children}</WithNav>;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/home" element={<WithNav><HomePage /></WithNav>} />
              <Route path="/veg" element={<WithNav><Vegetable /></WithNav>} />
              <Route path="/veg/:id" element={<WithNav><VegDetail /></WithNav>} />
              <Route path="/popular" element={<WithNav><PopularVegetables /></WithNav>} />
              <Route path="/cart" element={<WithNav><Cart /></WithNav>} />
              <Route path="/acc" element={<WithNav><AccountPage /></WithNav>} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Group Order Pages under one Route */}
              <Route path="/orders/*" element={
                <WithNav>
                  <OrderNav />
                  <Routes>
                    <Route path="deliver" element={<OrderDeliver status="deliver" />} />
                    <Route path="arrived" element={<OrderArrived status="arrived" />} />
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
              <Route path="/admin-edit-cart/:user_id" element={<AdminEditCartPage />} />
              <Route path="/*" element={<WithNav><LoginPage /></WithNav>} />
            </Routes>
          </main>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
