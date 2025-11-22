import React, { useEffect, useState } from "react";
import ProductsTable from "./components/ProductsTable";
import ImportExport from "./components/ImportExport";
import SidebarHistory from "./components/SidebarHistory";
import AddProductModal from "./components/AddProductModal";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

export default function App() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  async function load() {
    const res = await fetch(`${API_BASE}/api/products`);
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSearch(value) {
    setQuery(value);

    if (!value) return load();

    const res = await fetch(
      `${API_BASE}/api/products/search?name=${encodeURIComponent(value)}`
    );
    const data = await res.json();
    setProducts(data);
  }

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  const filtered = products.filter((p) => !category || p.category === category);

  return (
    <div className="app">
      <header className="header">
        <div className="left">
          <input
            placeholder="Search products..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="right">
          <button onClick={() => setShowAddModal(true)}>Add New Product</button>
          <ImportExport apiBase={API_BASE} onImported={load} />
        </div>
      </header>

      <main>
        <ProductsTable
          products={filtered}
          onReload={load}
          onSelect={setSelectedProduct}
          apiBase={API_BASE}
          setProducts={setProducts}
        />
      </main>

      <SidebarHistory
        product={selectedProduct}
        apiBase={API_BASE}
        onClose={() => setSelectedProduct(null)}
      />

      {showAddModal && (
        <AddProductModal
          apiBase={API_BASE}
          onClose={() => setShowAddModal(false)}
          onAdded={load}
        />
      )}
    </div>
  );
}
