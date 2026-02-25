/**
 * User Management Routes
 *
 * All routes are museum-scoped: users can only see/manage
 * other users belonging to their own museum.
 */
import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const SALT_ROUNDS = 10;

// ── GET /users ────────────────────────────────────────────────────────────
// List all users in the current museum
router.get("/", async (req: any, res) => {
  try {
    const users = await (prisma as any).user.findMany({
      where: { museumId: req.user.museumId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(users);

  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// ── POST /users ───────────────────────────────────────────────────────────
// Add a new user to the current museum
router.post("/", async (req: any, res) => {
  try {
    const { email, name, password, role = "member" } = req.body;
    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ error: "Email, name, and password are required" });
    }

    // Check email uniqueness globally (users share email namespace)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role,
        museumId: req.user.museumId, // always scoped to current museum
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);

  } catch (err: any) {
    res.status(500).json({ error: "Failed to create user", message: err.message });
  }
});


// ── DELETE /users/:id ────────────────────────────────────────────────────
// Remove a user — only if they belong to the same museum
router.delete("/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    // Prevent self-deletion
    if (id === req.user.userId) {
      return res.status(400).json({ error: "You cannot remove yourself" });
    }

    // Verify target user belongs to same museum
    const target = await prisma.user.findFirst({
      where: { id, museumId: req.user.museumId },
    });

    if (!target) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;