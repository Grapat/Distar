import React, { useEffect, useState } from "react";
import "../../css/adminUserPage.css";
import { API } from "../../lib/api";

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [altAddress, setAltAddress] = useState("");
  const [province, setProvince] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:4005/api/auth/register" || `${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          address,
          alt_address: altAddress,
          province,
          zipcode,
          user_type: "customer",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("Registration successful", data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/users" || `${API}/api/users`);
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
      const response = await fetch(`http://localhost:4005/api/users/${editingUser.user_id}` || `${API}/api/users/${editingUser.user_id}`, {
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
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การลบจะไม่สามารถย้อนกลับได้!");
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:4005/api/users/${userId}` || `${API}/api/users/${userId}`, { method: "DELETE" });
      setUsers(users.filter((usr) => usr.user_id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // ✅ ฟิลเตอร์ก่อนแสดงผล
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const matchNameOrEmail =
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search);

    const matchRole =
      roleFilter === "all" || user.user_type.toLowerCase() === roleFilter.toLowerCase();

    return matchNameOrEmail && matchRole;
  });

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
            <option value="customer">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="user-reg-form">
          <h3>เพิ่มผู้ใช้ใหม่</h3>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="ชื่อ" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="รหัสผ่าน" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <input type="password" placeholder="ยืนยันรหัสผ่าน" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <input type="tel" placeholder="เบอร์โทรศัพท์" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <input type="text" placeholder="ที่อยู่หลัก" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <input type="text" placeholder="ที่อยู่สำรอง (ถ้ามี)" value={altAddress} onChange={(e) => setAltAddress(e.target.value)} />
            <input type="text" placeholder="จังหวัด" value={province} onChange={(e) => setProvince(e.target.value)} required />
            <input type="text" placeholder="รหัสไปรษณีย์" value={zipcode} onChange={(e) => setZipcode(e.target.value)} required />
            {error && <p className="error">{error}</p>}
            <button type="submit">สมัครสมาชิก</button>
          </form>
        </div>
      </div>
      {/* 🧺 รายการuser (2 ส่วน) */}
      <div className="user-list">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          filteredUsers.slice(0, 20).map((user) => (
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
                      <input type="text" placeholder="Address" value={editingUser?.address || ""} onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })} />
                    </div>

                    {/* 🟦 Column 2 */}
                    <div className="user-edit-col">
                      <input type="text" placeholder="Alt Address" value={editingUser?.alt_address || ""} onChange={(e) => setEditingUser({ ...editingUser, alt_address: e.target.value })} />
                      <input type="text" placeholder="Province" value={editingUser?.province || ""} onChange={(e) => setEditingUser({ ...editingUser, province: e.target.value })} />
                      <input type="text" placeholder="Zipcode" value={editingUser?.zipcode || ""} onChange={(e) => setEditingUser({ ...editingUser, zipcode: e.target.value })} />
                      <input type="number" placeholder="Credit" value={editingUser?.credit ?? ""} min="0" onChange={(e) => setEditingUser({ ...editingUser, credit: parseInt(e.target.value) || 0 })} />
                      <select value={editingUser?.user_type} onChange={(e) => setEditingUser({ ...editingUser, user_type: e.target.value })}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* 🟦 Column 3 - ปุ่มเต็มคอลัมน์ */}
                    <div className="user-edit-actions">
                      <button type="submit" className="btn-update">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                        </svg>
                      </button>
                      <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <button type="button" className="btn-cancel" onClick={() => handleDeleteUser(editingUser?.user_id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
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
