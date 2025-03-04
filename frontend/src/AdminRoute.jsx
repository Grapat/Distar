import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />; // ✅ ถ้าไม่ได้ล็อกอินให้ไปหน้า Login
  }

  const decoded = jwtDecode(token);
  return decoded.userType === "admin" ? children : <Navigate to="/home" />;
};

export default AdminRoute;
