import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/header.css";
import logo from "../img/L1.png";

const Header = () => {
  const { user, setUser } = useAuth(); // ✅ Fetch user & setUser
  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="header">
      <img src={logo} alt="Distar Fresh Logo" className="logo" />
      <div className="login-part">
        {user ? (
          <>
            {user.userType !== "customer" && (
              <button onClick={handleLogout}>Logout</button>
            )}
          </>
        ) : (
          <p>Please log in</p>
        )}
      </div>
    </header>
  );
};

export default Header;
