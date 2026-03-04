import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("vault.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL, -- 'text', 'image', 'document', 'note'
    source_tool TEXT,
    tags TEXT, -- JSON array of strings
    category TEXT,
    is_favorite INTEGER DEFAULT 0,
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/entries", (req, res) => {
    const entries = db.prepare("SELECT * FROM entries ORDER BY created_at DESC").all();
    res.json(entries.map(e => ({
      ...e,
      tags: JSON.parse(e.tags || '[]'),
      is_favorite: !!e.is_favorite
    })));
  });

  app.post("/api/entries", (req, res) => {
    const { title, content, type, source_tool, tags, category, file_path } = req.body;
    const info = db.prepare(`
      INSERT INTO entries (title, content, type, source_tool, tags, category, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, content, type, source_tool, JSON.stringify(tags || []), category, file_path);
    
    const newEntry = db.prepare("SELECT * FROM entries WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({
      ...newEntry,
      tags: JSON.parse(newEntry.tags || '[]'),
      is_favorite: !!newEntry.is_favorite
    });
  });

  app.patch("/api/entries/:id", (req, res) => {
    const { id } = req.params;
    const { is_favorite, title, category, tags } = req.body;
    
    if (is_favorite !== undefined) {
      db.prepare("UPDATE entries SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(is_favorite ? 1 : 0, id);
    }
    if (title !== undefined) {
      db.prepare("UPDATE entries SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(title, id);
    }
    if (category !== undefined) {
      db.prepare("UPDATE entries SET category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(category, id);
    }
    if (tags !== undefined) {
      db.prepare("UPDATE entries SET tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(JSON.stringify(tags), id);
    }

    const updatedEntry = db.prepare("SELECT * FROM entries WHERE id = ?").get(id);
    res.json({
      ...updatedEntry,
      tags: JSON.parse(updatedEntry.tags || '[]'),
      is_favorite: !!updatedEntry.is_favorite
    });
  });

  app.delete("/api/entries/:id", (req, res) => {
    db.prepare("DELETE FROM entries WHERE id = ?").run(req.params.id);
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
