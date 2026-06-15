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
    ownerName TEXT NOT NULL DEFAULT 'legacy',
    prompt TEXT NOT NULL,
    style TEXT,
    filename TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

const imageColumns = db
  .prepare("PRAGMA table_info(images)")
  .all() as Array<{ name: string }>;

if (!imageColumns.some((column) => column.name === "ownerName")) {
  db.exec("ALTER TABLE images ADD COLUMN ownerName TEXT NOT NULL DEFAULT 'legacy'");
}

// Types
export interface ImageRecord {
  id: string;
  ownerName: string;
  prompt: string;
  style: string | null;
  filename: string;
  createdAt: string;
}

// Save image to database
export function saveImage(data: {
  ownerName: string;
  prompt: string;
  style: string;
  filename: string;
}): ImageRecord {
  const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(
    `INSERT INTO images (id, ownerName, prompt, style, filename, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  stmt.run(
    id,
    data.ownerName,
    data.prompt,
    data.style,
    data.filename,
    createdAt,
  );

  return { id, ...data, createdAt };
}

// Get all images for one user
export function getImages(ownerName: string): ImageRecord[] {
  const stmt = db.prepare(
    "SELECT * FROM images WHERE ownerName = ? ORDER BY createdAt DESC",
  );
  return stmt.all(ownerName) as ImageRecord[];
}

// Get image by ID
export function getImageById(
  id: string,
  ownerName: string,
): ImageRecord | null {
  const stmt = db.prepare("SELECT * FROM images WHERE id = ? AND ownerName = ?");
  return (stmt.get(id, ownerName) as ImageRecord) || null;
}

// Delete image
export function deleteImage(id: string, ownerName: string): boolean {
  const stmt = db.prepare("DELETE FROM images WHERE id = ? AND ownerName = ?");
  const result = stmt.run(id, ownerName);
  return result.changes > 0;
}

export default db;
