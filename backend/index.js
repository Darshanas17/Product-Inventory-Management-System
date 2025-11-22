const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { init } = require("./db");

const upload = multer({ dest: path.join(__dirname, "uploads/") });

async function start() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const db = await init();

  // Helper for case-insensitive duplicate check
  async function findProductByNameCI(name) {
    return db.get("SELECT * FROM products WHERE LOWER(name)=LOWER(?)", [name]);
  }

  // Get all products
  app.get("/api/products", async (req, res) => {
    const rows = await db.all("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  });

  // Search
  app.get("/api/products/search", async (req, res) => {
    const q = (req.query.name || "").trim();
    if (!q) return res.json([]);
    const rows = await db.all(
      "SELECT * FROM products WHERE LOWER(name) LIKE ? ORDER BY id DESC",
      [`%${q.toLowerCase()}%`]
    );
    res.json(rows);
  });

  // Export CSV
  app.get("/api/products/export", async (req, res) => {
    const rows = await db.all("SELECT * FROM products ORDER BY id");
    const header =
      "id,name,unit,category,brand,stock,status,image,createdAt,updatedAt\n";
    const lines = rows
      .map(
        (r) =>
          `${r.id},"${r.name}","${r.unit || ""}","${r.category || ""}","${
            r.brand || ""
          }",${r.stock},"${r.status || ""}","${r.image || ""}","${
            r.createdAt || ""
          }","${r.updatedAt || ""}"`
      )
      .join("\n");
    const csv = header + lines;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="products_export.csv"'
    );
    res.send(csv);
  });

  // Import CSV
  app.post("/api/products/import", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const content = fs.readFileSync(req.file.path, "utf8");

    try {
      const records = parse(content, { columns: true, skip_empty_lines: true });

      let added = 0;
      let skipped = 0;
      let updated = 0;

      await db.exec("BEGIN");

      for (const rec of records) {
        const name = (rec.name || "").trim();
        if (!name) {
          skipped++;
          continue;
        }

        const existing = await db.get(
          "SELECT * FROM products WHERE LOWER(name)=LOWER(?)",
          [name.toLowerCase()]
        );

        const recStock = Number(rec.stock) || 0;

        if (existing) {
          // Check if any field has changed
          const hasChanged =
            existing.unit !== rec.unit ||
            existing.category !== rec.category ||
            existing.brand !== rec.brand ||
            existing.stock !== recStock ||
            existing.status !== rec.status ||
            existing.image !== rec.image;

          if (hasChanged) {
            await db.run(
              `UPDATE products 
             SET unit=?, category=?, brand=?, stock=?, status=?, image=?, updatedAt=CURRENT_TIMESTAMP 
             WHERE id=?`,
              [
                rec.unit || "",
                rec.category || "",
                rec.brand || "",
                recStock,
                rec.status || "",
                rec.image || "",
                existing.id,
              ]
            );

            updated++;
          } else {
            skipped++;
          }

          continue;
        }

        // INSERT new
        await db.run(
          `INSERT INTO products 
        (name, unit, category, brand, stock, status, image, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            name,
            rec.unit || "",
            rec.category || "",
            rec.brand || "",
            recStock,
            rec.status || "",
            rec.image || "",
          ]
        );

        added++;
      }

      await db.exec("COMMIT");

      fs.unlinkSync(req.file.path);

      res.json({ added, updated, skipped });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Failed to parse CSV", details: err.message });
    }
  });

  // Update product
  app.put("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { name, unit, category, brand, stock, status, image, changedBy } =
      req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (stock == null || isNaN(Number(stock)) || Number(stock) < 0)
      return res.status(400).json({ error: "Stock must be a number >= 0" });

    // Check unique name (except itself)
    const conflict = await db.get(
      "SELECT * FROM products WHERE LOWER(name)=LOWER(?) AND id != ?",
      [name, id]
    );
    if (conflict)
      return res.status(400).json({ error: "Product name must be unique" });

    const existing = await db.get("SELECT * FROM products WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const oldStock = existing.stock || 0;
    const newStock = Number(stock);

    await db.run(
      `UPDATE products SET name=?, unit=?, category=?, brand=?, stock=?, status=?, image=?, updatedAt=CURRENT_TIMESTAMP WHERE id = ?`,
      [
        name,
        unit || "",
        category || "",
        brand || "",
        newStock,
        status || "",
        image || "",
        id,
      ]
    );

    if (oldStock !== newStock) {
      await db.run(
        `INSERT INTO inventory_logs (productId, oldStock, newStock, changedBy) VALUES (?, ?, ?, ?)`,
        [id, oldStock, newStock, changedBy || "admin"]
      );
    }

    const updated = await db.get("SELECT * FROM products WHERE id = ?", [id]);
    res.json(updated);
  });

  // Get history
  app.get("/api/products/:id/history", async (req, res) => {
    const id = Number(req.params.id);
    const rows = await db.all(
      "SELECT * FROM inventory_logs WHERE productId = ? ORDER BY timestamp DESC",
      [id]
    );
    res.json(rows);
  });

  // Delete product
  app.delete("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id);
    await db.run("DELETE FROM products WHERE id = ?", [id]);
    res.json({ success: true });
  });

  // Create product
  app.post("/api/products", async (req, res) => {
    const { name, unit, category, brand, stock, status, image, changedBy } =
      req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (stock == null || isNaN(Number(stock)) || Number(stock) < 0)
      return res.status(400).json({ error: "Stock must be a number >= 0" });

    // check duplicate
    const existing = await db.get(
      "SELECT * FROM products WHERE LOWER(name)=LOWER(?)",
      [name]
    );
    if (existing)
      return res.status(400).json({ error: "Product name must be unique" });

    const result = await db.run(
      `INSERT INTO products (name, unit, category, brand, stock, status, image, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        name,
        unit || "",
        category || "",
        brand || "",
        Number(stock),
        status || "",
        image || "",
      ]
    );

    const created = await db.get("SELECT * FROM products WHERE id = ?", [
      result.lastID,
    ]);

    // create initial inventory log if stock > 0
    if (Number(stock) !== 0) {
      await db.run(
        `INSERT INTO inventory_logs (productId, oldStock, newStock, changedBy) VALUES (?, ?, ?, ?)`,
        [created.id, 0, Number(stock), changedBy || "admin"]
      );
    }

    res.status(201).json(created);
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () =>
    console.log(`Inventory backend listening on port ${port}`)
  );
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
