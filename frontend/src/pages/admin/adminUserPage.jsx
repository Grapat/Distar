import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../css/adminUserPage.css";

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
  const [editingUser, setEditingUser] = useState(null);
  const { user } = useAuth();

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

  // Handle Create New User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4005/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const createdUser = await response.json();
      setUsers([...users, createdUser]);
      setNewUser({ name: "", email: "", role: "user" }); // Reset form
    } catch (error) {
      console.error("Error creating user:", error);
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
    <div className="admin-users-container">
      <h1>Admin User Management</h1>

      {/* Create User Form */}
      <form onSubmit={handleCreateUser} className="user-form">
        <h3>Create New User</h3>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />
        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Create User</button>
      </form>

      {/* Edit User Form */}
      {editingUser && (
        <form onSubmit={handleUpdateUser} className="user-form">
          <h3>Edit User</h3>
          <input
            type="text"
            value={editingUser.name}
            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
            required
          />
          <input
            type="email"
            value={editingUser.email}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            required
          />
          <select
            value={editingUser.role}
            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Update User</button>
          <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
        </form>
      )}

      {/* User List */}
      <div className="user-list">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <div key={user.user_id} className="user-card">
              <h3>{user.name}</h3>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
              <button onClick={() => handleEditUser(user)}>Edit</button>
              <button onClick={() => handleDeleteUser(user.user_id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUserPage;
