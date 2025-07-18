import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/registerPage.css";
import { API } from "../lib/api"; // ✅ นำเข้า API

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [altAddress, setAltAddress] = useState("");
  const [province, setProvince] = useState("");
  const [zipcode, setZipcode] = useState("");
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
      const response = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          address,
          alt_address: altAddress,
          province,
          zipcode,
          user_type: "customer",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("Registration successful");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-page">

      <div className="register-container">
        <h2>สมัครสมาชิก</h2>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="ชื่อ" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="รหัสผ่าน" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="ยืนยันรหัสผ่าน" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <input type="tel" placeholder="เบอร์โทรศัพท์" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <input type="text" placeholder="ที่อยู่หลัก" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <input type="text" placeholder="ที่อยู่สำรอง (ถ้ามี)" value={altAddress} onChange={(e) => setAltAddress(e.target.value)} />
          <input type="text" placeholder="จังหวัด" value={province} onChange={(e) => setProvince(e.target.value)} required />
          <input type="text" placeholder="รหัสไปรษณีย์" value={zipcode} onChange={(e) => setZipcode(e.target.value)} required />
          {error && <p className="error">{error}</p>}
          <button type="submit">สมัครสมาชิก</button>
        </form>
        <p>มีบัญชีอยู่แล้ว? <a href="/login">เข้าสู่ระบบ</a></p>
      </div>
    </div>
  );
};

export default RegisterPage;
