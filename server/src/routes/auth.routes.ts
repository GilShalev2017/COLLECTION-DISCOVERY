/**
 * Auth Routes
 *
 * Handles user registration, login, and current-user fetch.
 * Registration also creates the Museum record (first user = museum admin).
 */

import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "tema-dev-secret-change-in-prod";
const SALT_ROUNDS = 10;

// ── POST /auth/register ───────────────────────────────────────────────────
// Creates a new Museum + first admin User in one transaction.
router.post("/register", async (req, res) => {
  try {
    const { museumName, museumSlug, email, password, name } = req.body;

    if (!museumName || !museumSlug || !email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check slug uniqueness
    const existing = await (prisma as any).museum.findUnique({
      where: { slug: museumSlug },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Museum slug already taken. Choose a different one." });
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create museum + first user atomically
    const museum = await (prisma as any).museum.create({
      data: {
        name: museumName,
        slug: museumSlug,
        users: {
          create: {
            email,
            passwordHash,
            name,
            role: "admin",
          },
        },
      },
      include: { users: true },
    });

    const user = museum.users[0];

    const token = jwt.sign(
      { userId: user.id, museumId: museum.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        museumId: museum.id,
        museumName: museum.name,
      },
    });
  } catch (err: any) {
    console.error("[AUTH] Register error:", err);
    res
      .status(500)
      .json({ error: "Registration failed", message: err.message });
  }
});

// ── POST /auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { museum: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, museumId: user.museumId, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        museumId: user.museumId,
        museumName: user.museum.name,
      },
    });
  } catch (err: any) {
    console.error("[AUTH] Login error:", err);
    res.status(500).json({ error: "Login failed", message: err.message });
  }
});

// ── GET /auth/me ──────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { museum: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      museumId: user.museumId,
      museumName: user.museum.name,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
