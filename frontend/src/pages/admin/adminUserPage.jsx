import React, { useEffect, useState } from "react";
import "../../css/adminUserPage.css";

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    alt_address: "",
    province: "",
    zipcode: "",
    credit: 0,
    user_type: "user",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Handle Edit User
  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  // Handle Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:4005/api/users/${editingUser.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });

      if (response.ok) {
        setUsers(users.map((usr) => (usr.user_id === editingUser.user_id ? editingUser : usr)));
        setEditingUser(null); // Clear editing mode
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`http://localhost:4005/api/users/${userId}`, { method: "DELETE" });
      setUsers(users.filter((usr) => usr.user_id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="admin-user-page-grid">
      {/* 🎛️ ส่วนควบคุม (1 ส่วน) */}
      <div className="user-controller">
        <h2>จัดการผู้ใช้</h2>
        <div className="user-filter-bar">
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">ทุกบทบาท</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      {/* 🧺 รายการuser (2 ส่วน) */}
      <div className="user-list">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <div key={user.user_id} className="user-row-wrapper">
              <div className="user-row">
                <h3>{user.name}</h3>
                <p>Email: {user.email}</p>
                <p>Role: {user.user_type}</p>
                <p>Phone: {user.phone}</p>
                <p>Credit: {user.credit}</p>
                <button onClick={() => handleEditUser(user)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
              </div>
              {editingUser?.user_id === user.user_id && (
                <div className={`user-edit-panel ${editingUser?.user_id === user.user_id ? "active" : ""}`}>
                  <form onSubmit={handleUpdateUser} className="user-edit-form">
                    {/* 🟦 Column 1 */}
                    <div className="user-edit-col">
                      <input type="text" placeholder="Name" value={editingUser?.name || ""} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} required />
                      <input type="email" placeholder="Email" value={editingUser?.email || ""} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} required />
                      <input type="text" placeholder="Phone" value={editingUser?.phone || ""} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} />
                    </div>

                    {/* 🟦 Column 2 */}
                    <div className="user-edit-col">
                      <input type="text" placeholder="Address" value={editingUser?.address || ""} onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })} />
                      <input type="text" placeholder="Alt Address" value={editingUser?.alt_address || ""} onChange={(e) => setEditingUser({ ...editingUser, alt_address: e.target.value })} />
                      <input type="text" placeholder="Province" value={editingUser?.province || ""} onChange={(e) => setEditingUser({ ...editingUser, province: e.target.value })} />
                      <input type="text" placeholder="Zipcode" value={editingUser?.zipcode || ""} onChange={(e) => setEditingUser({ ...editingUser, zipcode: e.target.value })} />
                    </div>

                    {/* 🟦 Column 3 - ปุ่มเต็มคอลัมน์ */}
                    <div className="user-edit-actions">
                      <input type="number" placeholder="Credit" value={editingUser?.credit ?? ""} min="0" onChange={(e) => setEditingUser({ ...editingUser, credit: parseInt(e.target.value) || 0 })} />
                      <select value={editingUser?.user_type} onChange={(e) => setEditingUser({ ...editingUser, user_type: e.target.value })}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button type="submit" className="btn-update">บันทึก</button>
                      <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>ยกเลิก</button>
                    </div>
                  </form>
                </div>
              )}
            </div>

          ))
        )}
      </div>
    </div>
  );
};

export default AdminUserPage;
