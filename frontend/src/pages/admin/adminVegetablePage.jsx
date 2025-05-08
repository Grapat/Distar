import React, { useEffect, useState } from "react";
import "../../css/adminVegetablePage.css";
import { API } from "../../lib/api";

const AdminVegetablePage = () => {
  const [vegetables, setVegetables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [newVegetable, setNewVegetable] = useState({
    name: "",
    description: "",
    stock: 0,
    category_id: "",
    img_url: "",
  });
  const [editingVegetable, setEditingVegetable] = useState(null);
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");


  const filteredVegetables = vegetables
    .filter((veg) =>
      veg.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((veg) =>
      categoryFilter === "all" ? true : String(veg.category_id) === categoryFilter
    );


  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchVegetables();
    fetchCategories();
  }, []);

  // Fetch all vegetables
  const fetchVegetables = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/vegs" || `${API}/api/vegs`);
      const data = await response.json();
      setVegetables(data);
    } catch (error) {
      console.error("Error fetching vegetables:", error);
    }
  };

  // Fetch categories to show category names
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/categories" || `${API}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle Add Vegetable
  const handleAddVegetable = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/vegs"  || `${API}/api/vegs`, {
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

  const handleAddCategory = async () => {
    try {
      const response = await fetch("http://localhost:4005/api/categories" || `${API}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });
      const added = await response.json();
      setCategories([...categories, added]);
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Handle Update Vegetable
  const handleUpdateVegetable = async () => {
    try {
      const response = await fetch(
        `http://localhost:4005/api/vegs/${editingVegetable.vegetable_id}` || `${API}/api/vegs/${editingVegetable.vegetable_id}`,
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
  const handleUpdateCategory = async () => {
    try {
      const response = await fetch(
        `http://localhost:4005/api/categories/${editingCategory.category_id}` || `${API}/api/categories/${editingCategory.category_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editingCategory.name }),
        }
      );
      const updated = await response.json();
      setCategories(
        categories.map((cat) =>
          cat.category_id === updated.category_id ? updated : cat
        )
      );
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Handle Delete Vegetable
  const handleDelete = async (vegetableId) => {
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผักรายการนี้? การลบจะไม่สามารถย้อนกลับได้!");
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:4005/api/vegs/${vegetableId}` || `${API}/api/vegs/${vegetableId}`, {
        method: "DELETE",
      });
      setVegetables((prevVegetables) =>
        prevVegetables.filter((veg) => veg.vegetable_id !== vegetableId)
      );
      alert("✅ ลบผักสำเร็จแล้วค่ะ");
    } catch (error) {
      console.error("Error deleting vegetable:", error);
      alert("❌ เกิดข้อผิดพลาดขณะลบผัก");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การลบจะไม่สามารถย้อนกลับได้!");
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:4005/api/categories/${categoryId}` || `${API}/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      setCategories(categories.filter((cat) => cat.category_id !== categoryId));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="admin-vegetable-page-grid">
      {/* 🎛️ ส่วนควบคุม (1 ส่วน) */}
      <div className="admin-veg-controller">
        <h2>จัดการผัก</h2>

        {/* 🔍 ช่องค้นหา */}
        <input
          type="text"
          placeholder="ค้นหาผัก..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">ทุกหมวดหมู่</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.name}
            </option>
          ))}
        </select>

        <h2>เพิ่มผักใหม่</h2>

        <input
          type="text"
          placeholder="ชื่อผัก"
          value={newVegetable.name}
          onChange={(e) =>
            setNewVegetable({ ...newVegetable, name: e.target.value })
          }
        />

        <textarea
          placeholder="รายละเอียดผัก"
          value={newVegetable.description}
          onChange={(e) =>
            setNewVegetable({ ...newVegetable, description: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="จำนวนคงเหลือ"
          min={0}
          value={newVegetable.stock}
          onChange={(e) =>
            setNewVegetable({ ...newVegetable, stock: Number(e.target.value) })
          }
        />

        <select
          value={newVegetable.category_id}
          onChange={(e) =>
            setNewVegetable({ ...newVegetable, category_id: e.target.value })
          }
        >
          <option value="">เลือกหมวดหมู่</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="URL รูปภาพ"
          value={newVegetable.image_url || ""}
          onChange={(e) =>
            setNewVegetable({ ...newVegetable, image_url: e.target.value })
          }
        />
        {newVegetable.image_url && (
          <img
            src={newVegetable.image_url}
            alt="ตัวอย่างรูปภาพ"
            style={{ width: "100px", height: "100px", objectFit: "cover", marginTop: "10px" }}
          />
        )}

        <button onClick={handleAddVegetable} className="admin-veg-controller-add-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          เพิ่มผักใหม่
        </button>
      </div>

      {/* 🧺 รายการผัก (2 ส่วน) */}
      <div className="admin-veg-items">
        {filteredVegetables.length === 0 ? (
          <div className="admin-veg-empty-box">
            <p className="admin-empty-veg">ไม่มีหมวดหมู่ในระบบค่ะ 📂</p>
          </div>
        ) : (
          filteredVegetables
            .sort((a, b) => a.stock - b.stock)
            .map((veg) => (
              <div key={veg.vegetable_id} className="admin-veg-row-wrapper">
                <div className="admin-veg-row">
                  <img src={veg.image_url || "/images/placeholder.jpg"} alt={veg.name} className="admin-veg-image" />
                  <div className="admin-veg-text">
                    <h3>{veg.name}</h3>
                    <p>{veg.Category?.name}</p>
                    <p>คงเหลือ: {veg.stock} หน่วย</p>
                  </div>
                  <div className="admin-button-row">
                    <button onClick={() => setEditingVegetable(veg)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    </button>
                  </div>
                </div>

                {/* 👇 แสดงฟอร์มเฉพาะถ้า veg คือรายการที่กำลังแก้ */}
                {editingVegetable?.vegetable_id === veg.vegetable_id && (
                  <div className={`admin-veg-edit-panel ${editingVegetable?.vegetable_id === veg.vegetable_id ? "active" : ""}`}>
                    <input
                      type="text"
                      value={editingVegetable.name}
                      onChange={(e) =>
                        setEditingVegetable({ ...editingVegetable, name: e.target.value })
                      }
                    />
                    <textarea
                      value={editingVegetable.description}
                      onChange={(e) =>
                        setEditingVegetable({ ...editingVegetable, description: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      value={editingVegetable.stock}
                      min={0}
                      onChange={(e) =>
                        setEditingVegetable({ ...editingVegetable, stock: Number(e.target.value) })
                      }
                    />
                    <select
                      value={editingVegetable.category_id}
                      onChange={(e) =>
                        setEditingVegetable({ ...editingVegetable, category_id: e.target.value })
                      }
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <div className="admin-button-row-edit">
                      <button onClick={handleUpdateVegetable}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                      </svg>
                        บันทึก
                      </button>
                      <button onClick={() => setEditingVegetable(null)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                        ยกเลิก
                      </button>
                      <button onClick={() => handleDelete(editingVegetable?.vegetable_id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                          strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        ลบผัก
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
        )}
      </div>

      {/* 🎛️ ส่วนควบคุม (1 ส่วน) */}
      <div className="admin-veg-controller">
        <h2>จัดการประเภท</h2>

        {/* 🔍 ช่องค้นหา */}
        <input
          type="text"
          placeholder="ค้นหาประเภท..."
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
        />

        <h2>เพิ่มประเภทใหม่</h2>

        <input
          type="text"
          placeholder="ชื่อประเภท"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <button onClick={handleAddCategory} className="admin-veg-controller-add-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          เพิ่มประเภทใหม่
        </button>
      </div>

      {/* 🧺 catagory(2 ส่วน) */}
      <div className="admin-veg-items">
        {filteredCategories.length === 0 ? (
          <div className="admin-veg-empty-box">
            <p className="admin-empty-veg">ไม่มีหมวดหมู่ในระบบค่ะ 📂</p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.category_id} className="admin-veg-row-wrapper">
              <div className="admin-veg-row">
                <div className="admin-veg-text">
                  <h3>{cat.name}</h3>
                </div>
                <div className="admin-button-row">
                  <button onClick={() => setEditingCategory(cat)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* ✅ ฟอร์มแก้ไขชื่อหมวดหมู่ */}
              {editingCategory?.category_id === cat.category_id && (
                <div className="admin-veg-edit-panel active">
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                  />
                  <div className="admin-button-row-edit">
                    <button onClick={handleUpdateCategory}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                      บันทึก</button>
                    <button onClick={() => setEditingCategory(null)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                      ยกเลิก</button>
                    <button onClick={() => handleDeleteCategory(editingCategory?.category_id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      ลบประเภท</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div >

  );
};

export default AdminVegetablePage;
