import React, { useEffect, useState } from "react";

export default function SidebarHistory({ product, apiBase, onClose }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!product) return setLogs([]);

    fetch(`${apiBase}/api/products/${product.id}/history`)
      .then((r) => r.json())
      .then(setLogs);
  }, [product]);

  if (!product) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>History: {product.name}</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Old</th>
            <th>New</th>
            <th>Changed By</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.timestamp).toLocaleString()}</td>
              <td>{l.oldStock}</td>
              <td>{l.newStock}</td>
              <td>{l.changedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
 