import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/forgotPasswordPage.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:4005/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>ลืมรหัสผ่าน</h2>
      <form onSubmit={handleForgotPassword}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}
        <button type="submit">ส่งลิงก์รีเซ็ตรหัสผ่าน</button>
      </form>
      <p>ย้อนกลับไปที่ <a href="/login">เข้าสู่ระบบ</a></p>
    </div>
  );
};

export default ForgotPasswordPage;
