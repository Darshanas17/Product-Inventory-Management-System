import React, { useState } from "react";

export default function ProductsTable({
  products,
  onReload,
  onSelect,
  apiBase,
  setProducts,
}) {
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState({});

  function startEdit(e, p) {
    e.stopPropagation();
    setEditingId(p.id);
    setFormState({ ...p });
  }

  function cancelEdit(e) {
    e.stopPropagation();
    setEditingId(null);
    setFormState({});
  }

  function onChange(name, value) {
    setFormState((s) => ({ ...s, [name]: value }));
  }

  async function save(e, id) {
    e.stopPropagation();

    const payload = { ...formState, stock: Number(formState.stock) };

    const res = await fetch(`${apiBase}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const e = await res.json();
      alert(e.error || "Update failed");
      return;
    }

    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setEditingId(null);
  }

  async function remove(e, id) {
    e.stopPropagation();
    if (!window.confirm("Delete product?")) return;

    await fetch(`${apiBase}/api/products/${id}`, { method: "DELETE" });
    onReload();
  }

  function stop(e) {
    e.stopPropagation();
  }

  return (
    <table className="products">
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Unit</th>
          <th>Category</th>
          <th>Brand</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {products.map((p) => {
          const editing = editingId === p.id;

          return (
            <tr key={p.id} onClick={() => onSelect(p)}>
              <td onClick={stop}>
                {p.image ? (
                  <img
                    src={p.image}
                    alt=""
                    style={{ width: 40, height: 40, borderRadius: 6 }}
                  />
                ) : (
                  "—"
                )}
              </td>

              {editing ? (
                <td onClick={stop}>
                  <input
                    value={formState.name || ""}
                    onChange={(e) => onChange("name", e.target.value)}
                  />
                </td>
              ) : (
                <td>{p.name}</td>
              )}

              {editing ? (
                <td onClick={stop}>
                  <input
                    value={formState.unit || ""}
                    onChange={(e) => onChange("unit", e.target.value)}
                  />
                </td>
              ) : (
                <td>{p.unit}</td>
              )}

              {editing ? (
                <td onClick={stop}>
                  <input
                    value={formState.category || ""}
                    onChange={(e) => onChange("category", e.target.value)}
                  />
                </td>
              ) : (
                <td>{p.category}</td>
              )}

              {editing ? (
                <td onClick={stop}>
                  <input
                    value={formState.brand || ""}
                    onChange={(e) => onChange("brand", e.target.value)}
                  />
                </td>
              ) : (
                <td>{p.brand}</td>
              )}

              {editing ? (
                <td onClick={stop}>
                  <input
                    type="number"
                    value={formState.stock || 0}
                    onChange={(e) => onChange("stock", e.target.value)}
                  />
                </td>
              ) : (
                <td>{p.stock}</td>
              )}

              {/* FIXED: Status column no longer opens sidebar */}
              <td onClick={stop}>
                <span className={p.stock > 0 ? "label green" : "label red"}>
                  {p.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </td>

              <td onClick={stop}>
                {editing ? (
                  <>
                    <button onClick={(e) => save(e, p.id)}>Save</button>
                    <button onClick={(e) => cancelEdit(e)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => startEdit(e, p)}>Edit</button>
                    <button onClick={(e) => remove(e, p.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
