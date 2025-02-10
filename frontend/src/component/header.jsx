import React from "react";
import "../css/header.css";

const Header = () => {
  return (
    <header className="header">
      <img src="/logo.svg" alt="Distar Fresh Logo" className="logo" />
      <h1 className="title">DISTAR FRESH</h1>
    </header>
  );
};

export default Header;
