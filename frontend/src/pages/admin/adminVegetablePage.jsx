import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../css/adminVegetablePage.css";

const AdminVegetablePage = () => {
  const [vegetables, setVegetables] = useState([]);
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();
  const [newVegetable, setNewVegetable] = useState({
    name: "",
    description: "",
    stock: 0,
    category_id: "",
  });
  const [editingVegetable, setEditingVegetable] = useState(null);

  useEffect(() => {
    fetchVegetables();
    fetchCategories();
  }, []);

  // Fetch all vegetables
  const fetchVegetables = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/vegs");
      const data = await response.json();
      setVegetables(data);
    } catch (error) {
      console.error("Error fetching vegetables:", error);
    }
  };

  // Fetch categories to show category names
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle Delete Vegetable
  const handleDelete = async (vegetableId) => {
    try {
      await fetch(`http://localhost:4005/api/vegs/${vegetableId}`, {
        method: "DELETE",
      });
      setVegetables((prevVegetables) =>
        prevVegetables.filter((veg) => veg.vegetable_id !== vegetableId)
      );
    } catch (error) {
      console.error("Error deleting vegetable:", error);
    }
  };

  // Handle Add Vegetable
  const handleAddVegetable = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/vegs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVegetable),
      });
      const addedVegetable = await response.json();
      setVegetables([...vegetables, addedVegetable]);
      setNewVegetable({ name: "", description: "", stock: 0, category_id: "" });
    } catch (error) {
      console.error("Error adding vegetable:", error);
    }
  };

  // Handle Update Vegetable
  const handleUpdateVegetable = async () => {
    try {
      const response = await fetch(
        `http://localhost:4005/api/vegs/${editingVegetable.vegetable_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingVegetable),
        }
      );
      const updatedVegetable = await response.json();
      setVegetables(
        vegetables.map((veg) =>
          veg.vegetable_id === updatedVegetable.vegetable_id
            ? updatedVegetable
            : veg
        )
      );
      setEditingVegetable(null);
    } catch (error) {
      console.error("Error updating vegetable:", error);
    }
  };

  return (
    <div className="admin-vegetables-container">
      <h1>Admin Vegetable Management</h1>

      {/* Add New Vegetable Form */}
      <div className="vegetable-form">
        <h3>Add New Vegetable</h3>
        <input
          type="text"
          placeholder="Name"
          value={newVegetable.name}
          onChange={(e) =>
            setNewVegetable({ ...newVegetable, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Description"
          value={newVegetable.description}
          onChange={(e) =>
            setNewVegetable({ ...newVegetable, description: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Stock"
          value={newVegetable.stock}
          onChange={(e) =>
            setNewVegetable({ ...newVegetable, stock: e.target.value })
          }
        />

        {/* Dropdown for Selecting Category Name */}
        <select
          value={newVegetable.category_id}
          onChange={(e) =>
            setNewVegetable({ ...newVegetable, category_id: e.target.value })
          }
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.name}
            </option>
          ))}
        </select>

        <button onClick={handleAddVegetable}>Add</button>
      </div>

      {/* List of Vegetables */}
      <div className="vegetable-list">
        {vegetables.length === 0 ? (
          <p>No vegetables found.</p>
        ) : (
          vegetables.map((vegetable) => (
            <div key={vegetable.vegetable_id} className="vegetable-card">
              {editingVegetable &&
              editingVegetable.vegetable_id === vegetable.vegetable_id ? (
                <div>
                  <input
                    type="text"
                    value={editingVegetable.name}
                    onChange={(e) =>
                      setEditingVegetable({
                        ...editingVegetable,
                        name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    value={editingVegetable.description}
                    onChange={(e) =>
                      setEditingVegetable({
                        ...editingVegetable,
                        description: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    value={editingVegetable.stock}
                    onChange={(e) =>
                      setEditingVegetable({
                        ...editingVegetable,
                        stock: e.target.value,
                      })
                    }
                  />

                  {/* Dropdown for Updating Category */}
                  <select
                    value={editingVegetable.category_id}
                    onChange={(e) =>
                      setEditingVegetable({
                        ...editingVegetable,
                        category_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <button onClick={handleUpdateVegetable}>Save</button>
                  <button onClick={() => setEditingVegetable(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h3>{vegetable.name}</h3>
                  <p>{vegetable.description}</p>
                  <p>Stock: {vegetable.stock}</p>
                  <p>
                    Category:{" "}
                    {vegetable.Category ? vegetable.Category.name : "Unknown"}
                  </p>
                  <button onClick={() => setEditingVegetable(vegetable)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(vegetable.vegetable_id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminVegetablePage;
