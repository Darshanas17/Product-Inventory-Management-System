import React, { useRef, useState } from "react";

export default function ImportExport({ onImported, apiBase }) {
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    setLoading(true);
    const res = await fetch(`${apiBase}/api/products/import`, {
      method: "POST",
      body: fd,
    });
    setLoading(false);

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Import failed");

    alert(`Added: ${data.added}, Skipped: ${data.skipped}`);
    onImported();
    fileRef.current.value = null;
  }

  function triggerFile() {
    fileRef.current.click();
  }

  function exportCSV() {
    window.location.href = `${apiBase}/api/products/export`;
  }

  return (
    <div className="import-export">
      <button onClick={triggerFile} disabled={loading}>
        Import
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleImport}
      />

      <button onClick={exportCSV}>Export</button>
    </div>
  );
}
