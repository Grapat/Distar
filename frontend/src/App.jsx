import React from "react";
import "./css/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./component/landingPage";
import HomePage from "./component/HomePage";
import Vegetable from "./component/vegetable";
import VegDetail from "./component/vegDetail";

function App() {
  return (
    <div className="App">
      <Router>
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/veg" element={<Vegetable />} />
            <Route path="/veg/:id" element={<VegDetail />} />
            <Route path="/popular" element={<PopularVegetables />} />
            <Route path="/cart" element={<Cart />} />

          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
