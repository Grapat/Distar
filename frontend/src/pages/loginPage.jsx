import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/loginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user?.userType === "admin") {
      console.log("Redirecting to Admin Dashboard");
      navigate("/admin");
    } else if (user) {
      console.log("Redirecting to Home Page");
      navigate("/home");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
  
    try {
      const response = await fetch("http://localhost:4005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      console.log("Raw Response:", response);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Login failed: ${errorText}`);
      }
  
      const data = await response.json();
      console.log("Parsed Login Response:", data);
  
      // ✅ Ensure data contains a user object and token
      if (!data.token || !data.user.userType) {
        throw new Error("Invalid response from server");
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", data.user.userType);
  
      setUser(data.user); // ✅ Store full user object
  
      console.log("User state updated:", data.user);
  
      // ✅ Use setTimeout to allow state update before navigation
      setTimeout(() => {
        if (data.user.userType === "admin") {
          console.log("Navigating to /admin");
          navigate("/admin");
        } else {
          console.log("Navigating to /home");
          navigate("/home");
        }
      }, 100);
    } catch (err) {
      console.error("Login Error:", err.message);
      setError(err.message);
    }
  };
  

  return (
    <div className="login-container">
      <h2>เข้าสู่ระบบ</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">เข้าสู่ระบบ</button>
      </form>
      <p>ยังไม่มีบัญชี? <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>สมัครสมาชิก</a></p>
      <p><a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>ลืมรหัสผ่าน?</a></p>
    </div>
  );
};

export default LoginPage; // ✅ Ensure this is present
