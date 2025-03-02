import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/loginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:4005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

    // ✅ เก็บ Token และ userType ไว้ใน Local Storage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userType", data.userType);

      // Handle successful login (e.g., save token, redirect)
      console.log("Login successful", data);

      if (data.userType === "admin") {
        navigate("/admin");  // Admin ไปที่หน้า AdminHome
      } else {
        navigate("/home");  // ลูกค้าทั่วไปไปที่หน้า Home
      }

    } catch (err) {
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

export default LoginPage;
