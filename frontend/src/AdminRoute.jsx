import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { jwtDecode } from "jwt-decode";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" replace />; // ✅ If not logged in, redirect to Login
  }

  try {
    const decoded = jwtDecode(token);
    return decoded.userType === "admin" ? children : <Navigate to="/home" />;
  } catch (error) {
    console.error("Invalid Token:", error);
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;
