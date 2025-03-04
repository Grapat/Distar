import React from "react";
import { useAuth } from "../context/AuthContext"; // ✅ Import useAuth
import "../css/header.css";
import logo from "../img/L1.png";

const Header = () => {
  const { user, handleLogout } = useAuth(); // ✅ Fetch user & logout function

  return (
    <header className="header">
      <img src={logo} alt="Distar Fresh Logo" className="logo" />
      {user ? <p>Welcome, {user.name || "User"}</p> : <p>Please log in</p>}
      {user && <button onClick={handleLogout}>Logout</button>}
    </header>
  );
};

export default Header;
