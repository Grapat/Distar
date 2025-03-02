import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />; // ✅ ถ้าไม่ได้ล็อกอินให้ไปหน้า Login
  }

  if (user.userType !== "admin") {
    return <Navigate to="/home" replace />; // ✅ ถ้าไม่ใช่ Admin ส่งไปหน้า Home
  }

  return children;
};

export default AdminRoute;
