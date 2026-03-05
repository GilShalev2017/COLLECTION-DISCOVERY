/**
 * Collection Routes — Museum-Scoped
 *
 * All routes now extract museumId from req.user (JWT payload)
 * and pass it to the service layer. Users can only see and
 * modify artworks belonging to their own museum.
 */

import { Router } from "express";
import { CollectionService } from "../services/collection.service";
import multer from "multer";
import {
  generateGoogleAuthUrl,
  exchangeCodeForTokens,
} from "../lib/google-auth";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
const service = new CollectionService();

// ── MET MUSEUM IMPORT ─────────────────────────────────────────────────────

router.post("/import/met", async (req: any, res) => {
  try {
    const { searchTerm = "*", departmentIds = [] } = req.body;
    const result = await service.importFromMet(
      searchTerm,
      departmentIds,
      req.user.museumId, // ← scoped to this museum
    );
    res.json(result);
  } catch (err: any) {
    console.error("[IMPORT ROUTE] Error:", err);
    res.status(500).json({ error: "Import failed", message: err.message });
  }
});

// ── AI ENRICHMENT ──────────────────────────────────────────────────────────

router.post("/enrich/:id", async (req: any, res) => {
  try {
    const item = await service.enrichWithAI(req.params.id, req.user.museumId);
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: "Enrichment failed" });
  }
});

// ── BROWSE ITEMS ───────────────────────────────────────────────────────────

router.get("/items", async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    console.log(`page: ${page}`);
    console.log(`limit: ${limit}`);

    if (page < 1) return res.status(400).json({ error: "Page must be >= 1" });
    if (limit < 1 || limit > 1000)
      return res
        .status(400)
        .json({ error: "Limit must be between 1 and 1000" });

    const result = await service.getAllItems(page, limit, req.user.museumId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// ── DEPARTMENTS ────────────────────────────────────────────────────────────

router.get("/departments", async (_req, res) => {
  try {
    const departments = await service.getDepartments();
    res.json(departments);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

// ── CLEAR COLLECTION ───────────────────────────────────────────────────────

router.delete("/clear", async (req: any, res) => {
  try {
    const result = await service.clearCollection(req.user.museumId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Clear failed", message: err.message });
  }
});

// ── DELETE SINGLE ITEM ─────────────────────────────────────────────────────

router.delete("/items/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    const result = await service.deleteArtwork(id, req.user.museumId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Deletion failed", message: err.message });
  }
});

// ── GOOGLE DRIVE AUTH ──────────────────────────────────────────────────────

router.get("/import/drive/auth", (req, res) => {
  const url = generateGoogleAuthUrl();
  res.json({ url });
});

router.post("/import/drive", async (req: any, res) => {
  try {
    const { folderId, accessToken: authCode } = req.body;
    if (!folderId || !authCode) {
      return res.status(400).json({ error: "Missing folderId or code" });
    }

    const tokens = await exchangeCodeForTokens(authCode);
    if (!tokens.access_token)
      throw new Error("Google failed to provide an access token.");

    const result = await service.importFromDrive(
      folderId,
      tokens.access_token,
      req.user.museumId,
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── MULTER CONFIG ──────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/artworks");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "csv") {
      file.mimetype === "text/csv" || file.originalname.endsWith(".csv")
        ? cb(null, true)
        : cb(new Error("Only CSV files are allowed"));
    } else if (file.fieldname === "images") {
      [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ].includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error("Only image files allowed"));
    } else {
      cb(new Error("Unexpected field"));
    }
  },
});

// ── CSV IMPORT ─────────────────────────────────────────────────────────────

router.post(
  "/import/csv",
  upload.fields([
    { name: "csv", maxCount: 1 },
    { name: "images", maxCount: 100 },
  ]),
  async (req: any, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const csvFile = files["csv"]?.[0];
      const imageFiles = files["images"];

      if (!csvFile)
        return res.status(400).json({ error: "No CSV file uploaded" });

      const result = await service.importFromCSV(
        csvFile,
        imageFiles,
        req.user.museumId,
      );

      res.json({
        success: true,
        items: result.items,
        stats: {
          new: result.newCount,
          updated: result.updatedCount,
          removed: 0,
        },
        message: `Successfully processed ${result.items.length} artworks`,
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "CSV import failed", message: err.message });
    }
  },
);

export default router;
