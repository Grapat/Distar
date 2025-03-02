import React from "react";
import { useNavigate } from "react-router-dom";
import "../../css/adminHome.css";

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <h2>หน้าแรกสำหรับผู้ดูแลระบบ</h2>
      <div className="admin-actions">
        <button className="admin-btn" onClick={() => navigate("/admin/cart-overall")}>
          จัดการตะกร้าสินค้าทั้งหมด
        </button>
        <button className="admin-btn" onClick={() => navigate("/admin/orders-overall")}>
          จัดการคำสั่งซื้อทั้งหมด
        </button>
        <button className="admin-btn" onClick={() => navigate("/admin/products-overall")}>
          จัดการสินค้าทั้งหมด
        </button>
        <button className="admin-btn" onClick={() => navigate("/admin/users-overall")}>
          จัดการผู้ใช้ทั้งหมด
        </button>
      </div>
    </div>
  );
};

export default AdminHome;