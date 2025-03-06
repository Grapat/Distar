import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../css/adminUserPage.css";

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:4005/api/users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await fetch(`http://localhost:4005/api/users/${userId}`, {
        method: "DELETE",
      });
      setUsers((prevUsers) => prevUsers.filter((usr) => usr.user_id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="admin-users-container">
      <h1>Admin User Management</h1>
      <div className="user-list">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <div key={user.user_id} className="user-card">
              <h3>{user.name}</h3>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
              <button onClick={() => handleDelete(user.user_id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUserPage;
