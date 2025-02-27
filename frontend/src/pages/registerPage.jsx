import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/registerPage.css";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:4005/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, address, user_type: "customer" }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("Registration successful", data);
      navigate("/login"); // Redirect to login after successful registration
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <h2>สมัครสมาชิก</h2>
      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          placeholder="ชื่อ" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="รหัสผ่าน" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="ยืนยันรหัสผ่าน" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
        />
        <input 
          type="tel" 
          placeholder="เบอร์โทรศัพท์" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          required
        />
        <input 
          type="text" 
          placeholder="ที่อยู่" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">สมัครสมาชิก</button>
      </form>
      <p>มีบัญชีอยู่แล้ว? <a href="/login">เข้าสู่ระบบ</a></p>
    </div>
  );
};

export default RegisterPage;
