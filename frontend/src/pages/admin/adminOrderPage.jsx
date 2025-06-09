import React, { useEffect, useState } from "react";
import "../../css/adminOrderPage.css";
import { API } from "../../lib/api";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDOW, setFilterDOW] = useState(""); // 👈 Delivery day filter
  const [statusFilter, setStatusFilter] = useState(""); // 👈 Status filter

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API}/api/order`);
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await fetch(`${API}/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ Order #${orderId}?`)) return;

    try {
      const response = await fetch(`${API}/api/order/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        return alert(`ลบไม่สำเร็จ: ${result.message}`);
      }

      setOrders((prevOrders) => prevOrders.filter((order) => order.order_id !== orderId));
      alert(`ลบ Order #${orderId} สำเร็จแล้วค่ะ`);
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("เกิดข้อผิดพลาดขณะลบคำสั่งซื้อ");
    }
  };

  const renderOrder = (order) => {
    // You can choose to display order.createdAt here in the UI if needed
    // const orderCreationDateFormatted = order.createdAt
    //   ? new Date(order.createdAt).toISOString().slice(0, 10)
    //   : "ไม่พบวันที่สร้าง";

    return (
      <div key={order.order_id} className="order-wrapper" style={{ marginBottom: "2rem", padding: "1rem", border: "5px solid #8bc34a", borderRadius: "12px", background: "#fdfdfd", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <table className="order-table" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th colSpan="3">คำสั่งซื้อของ {order.User.name}</th>
            </tr>
            <tr>
              <td colSpan="3">
                <span className={`status-badge ${order.status}`}>
                  {order.status === "pending" ? "รอดำเนินการ" : order.status === "shipped" ? "จัดส่งแล้ว" : "ส่งสำเร็จ"}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                {/* If you want to display order creation date in UI, put it here: */}
                {/* **วันที่สร้าง: {orderCreationDateFormatted}**<br /> */}
                จัดส่งวันที่: {order.date_deli?.slice(0, 10)} ({order.DOW || "ไม่ระบุ"})<br />
                รวม {order.Order_Items.length} รายการ / {order.Order_Items.reduce((sum, item) => sum + item.quantity, 0)} หน่วย <br />
                สถานที่จัดส่ง: {order.address || "ไม่พบที่อยู่จัดส่ง"}
              </td>
            </tr>
            <tr>
              <th>ลำดับ</th>
              <th>ชื่อผัก</th>
              <th>จำนวน (หน่วย)</th>
            </tr>
          </thead>
          <tbody>
            {order.Order_Items.map((item, index) => (
              <tr key={item.order_item_id}>
                <td>{index + 1}</td>
                <td>{item.Vegetable?.name || "ไม่พบชื่อผัก"}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Section แยก control ออกจากตาราง */}
        <div className="order-controls" style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <label htmlFor={`status-${order.order_id}`}>เปลี่ยนสถานะ: </label>
            <select
              id={`status-${order.order_id}`}
              value={order.status}
              onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
              style={{ padding: "6px", borderRadius: "6px" }}
            >
              <option value="pending">รอดำเนินการ</option>
              <option value="shipped">จัดส่งแล้ว</option>
              <option value="delivered">ส่งสำเร็จ</option>
            </select>
          </div>

          <button
            onClick={() => handleDeleteOrder(order.order_id)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ลบคำสั่งซื้อ
          </button>
        </div>
      </div>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const name = order.User?.name?.toLowerCase() || "";
    const email = order.User?.email?.toLowerCase() || "";
    const userId = order?.user_id?.toLowerCase() || "";

    const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm) || userId.includes(searchTerm);
    const matchesDOW = !filterDOW || order.DOW === filterDOW;
    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesDOW && matchesStatus;
  });

  const exportOrdersToExcel = () => {
    if (filteredOrders.length === 0) {
      alert("ไม่พบคำสั่งซื้อที่จะส่งออกตามเงื่อนไขที่เลือก!");
      return;
    }

    const data = [];
    // Define your header row
    const header = [
      "Order ID",
      "ชื่อลูกค้า",
      "อีเมลลูกค้า",
      "ที่อยู่จัดส่ง",
      // Removed "วันที่สั่งซื้อ" (Order Date) column from here
      "วันที่จัดส่ง",
      "วันในสัปดาห์ (DOW)",
      "สถานะ",
      "จำนวนรายการทั้งหมด",
      "จำนวนหน่วยทั้งหมด",
      "ลำดับสินค้า",
      "ชื่อผัก",
      "จำนวนผัก (หน่วย)"
    ];
    data.push(header); // Add header row

    filteredOrders.forEach((order) => {
      // Removed the line that formatted order.createdAt
      const deliveryDate = order.date_deli ? new Date(order.date_deli).toISOString().slice(0, 10) : 'N/A';
      const totalItems = order.Order_Items.length;
      const totalQuantity = order.Order_Items.reduce((sum, item) => sum + item.quantity, 0);

      order.Order_Items.forEach((item, index) => {
        const row = [];
        if (index === 0) { // For the first item of the order, include all order details
          row.push(
            order.order_id,
            order.User?.name || "ไม่พบผู้ใช้",
            order.User?.email || "ไม่พบอีเมล",
            order.address || "ไม่พบที่อยู่",
            // Removed orderDate here
            deliveryDate,
            order.DOW || "ไม่ระบุ",
            order.status === "pending" ? "รอดำเนินการ" : order.status === "shipped" ? "จัดส่งแล้ว" : "ส่งสำเร็จ",
            totalItems,
            totalQuantity
          );
        } else { // For subsequent items of the same order, leave order details blank
          // Adjusted to remove one empty string for the removed column
          row.push("", "", "", "", "", "", "", "", "");
        }
        row.push(
          index + 1, // Item number
          item.Vegetable?.name || "ไม่พบชื่อผัก",
          item.quantity
        );
        data.push(row);
      });
    });

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data); // aoa_to_sheet for array of arrays

    // Optional: Add some basic styling
    // Make header row bold and add a background color
    for (let col = 0; col < header.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" },
          fill: { fgColor: { rgb: "FFE0B2" } }, // Light orange background for header
        };
      }
    }

    // Set column widths for better readability
    // Adjusted to remove one width entry for the removed column
    ws["!cols"] = [
      { wch: 10 }, // Order ID
      { wch: 20 }, // ชื่อลูกค้า
      { wch: 25 }, // อีเมลลูกค้า
      { wch: 40 }, // ที่อยู่จัดส่ง
      { wch: 15 }, // วันที่จัดส่ง
      { wch: 15 }, // วันในสัปดาห์ (DOW)
      { wch: 15 }, // สถานะ
      { wch: 10 }, // จำนวนรายการทั้งหมด
      { wch: 10 }, // จำนวนหน่วยทั้งหมด
      { wch: 10 }, // ลำดับสินค้า
      { wch: 20 }, // ชื่อผัก
      { wch: 15 }, // จำนวนผัก (หน่วย)
    ];

    XLSX.utils.book_append_sheet(wb, ws, "รายงานคำสั่งซื้อ");

    // Write to a buffer and then save
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(dataBlob, `รายงานคำสั่งซื้อ_${new Date().toISOString().slice(0, 10)}.xlsx`);

    alert("✅ ส่งออกข้อมูลคำสั่งซื้อสำเร็จ!");
  };

  return (
    <div className="admin-order-layout">
      <div className="admin-order-controls">
        {/* 🎛️ Control Panel */}
        <h2>จัดการคำสั่งซื้อทั้งหมด</h2>
        <input
          type="text"
          placeholder="ค้นหาชื่อ อีเมลผู้ใช้ หรือ ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
        <select value={filterDOW} onChange={(e) => setFilterDOW(e.target.value)}>
          <option value="">-- ทุกวัน --</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">-- ทุกสถานะ --</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="shipped">จัดส่งแล้ว</option>
          <option value="delivered">ส่งสำเร็จ</option>
        </select>
        <button
          onClick={exportOrdersToExcel}
          style={{
            padding: "8px 15px",
            backgroundColor: "#28a745", // Green color for export
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "10px", // Add some spacing
          }}
        >
          ส่งออกเป็น Excel
        </button>
      </div>

      <div className="admin-order-display">
        <div className="order-warp">
          {filteredOrders.length === 0 ? (
            <p>ไม่มีคำสั่งซื้อที่ตรงกับเงื่อนไข</p>
          ) : (
            filteredOrders.map(renderOrder)
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderPage;
