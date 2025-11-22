import React, { useState } from "react";

export default function AddProductModal({ onClose, apiBase, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    unit: "",
    category: "",
    brand: "",
    stock: 0,
    status: "In Stock",
    image: "",
  });

  function update(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function createProduct() {
    try {
      const res = await fetch(`${apiBase}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error);

      onAdded();
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add New Product</h3>

        <div className="form-row">
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Unit</label>
          <input
            value={form.unit}
            onChange={(e) => update("unit", e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Category</label>
          <input
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Brand</label>
          <input
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => update("stock", Number(e.target.value))}
          />
        </div>

        <div className="form-row">
          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            <option>In Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>

        <div className="form-row">
          <label>Image URL</label>
          <input
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button onClick={createProduct} className="">Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
