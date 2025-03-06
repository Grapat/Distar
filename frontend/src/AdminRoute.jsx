import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.userType !== "admin") {
    return <Navigate to={user ? "/home" : "/login"} replace />;
  }

  return children;
};

export default AdminRoute;
