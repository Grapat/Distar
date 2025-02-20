import React, { useState, useEffect } from "react";
import "../css/accountPage.css";

const AccountPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulating fetching user data from API
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:4005/api/user");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div className="account-container">Loading...</div>;
  }

  return (
    <div className="account-container">
      <h2>บัญชีของฉัน</h2>
      <div className="account-info">
        <img src={user.profileImage} alt="Profile" className="profile-pic" />
        <h3>{user.name}</h3>
        <p>Email: {user.email}</p>
        <p>เบอร์โทร: {user.phone}</p>
      </div>
      <button className="logout-btn">ออกจากระบบ</button>
    </div>
  );
};

export default AccountPage;
