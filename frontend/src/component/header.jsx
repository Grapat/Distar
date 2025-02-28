import React from "react";
import "../css/header.css";
import logo from "../img/L1.png";

const Header = () => {
  return (
    <header className="header">
      <img src ={logo} alt="Distar Fresh Logo" className="logo" />
    </header>
  );
};

export default Header;
