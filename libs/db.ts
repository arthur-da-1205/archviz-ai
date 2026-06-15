import Database from "better-sqlite3";

// Initialize database
const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "./gallery.db";
const db = new Database(dbPath);

// Enable WAL mode for concurrent read/write
db.pragma("journal_mode = WAL");

// Create images table
db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    style TEXT,
    filename TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

// Types
export interface ImageRecord {
  id: string;
  prompt: string;
  style: string | null;
  filename: string;
  createdAt: string;
}

// Save image to database
export function saveImage(data: {
  prompt: string;
  style: string;
  filename: string;
}): ImageRecord {
  const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(
    `INSERT INTO images (id, prompt, style, filename, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
  );

  stmt.run(id, data.prompt, data.style, data.filename, createdAt);

  return { id, ...data, createdAt };
}

// Get all images
export function getImages(): ImageRecord[] {
  const stmt = db.prepare("SELECT * FROM images ORDER BY createdAt DESC");
  return stmt.all() as ImageRecord[];
}

// Get image by ID
export function getImageById(id: string): ImageRecord | null {
  const stmt = db.prepare("SELECT * FROM images WHERE id = ?");
  return (stmt.get(id) as ImageRecord) || null;
}

// Delete image
export function deleteImage(id: string): boolean {
  const stmt = db.prepare("DELETE FROM images WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

export default db;
