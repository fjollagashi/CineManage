import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// List employees (admin only)
router.get('/employees', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'EMPLOYEE'] } },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create employee (admin only)
router.post('/employees', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'EMPLOYEE' } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, firstName, lastName required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, role: role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE' },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List promotions (admin)
router.get('/promotions', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const list = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create promotion (admin)
router.post('/promotions', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { code, description, discountPercent, discountFixed, validFrom, validUntil, maxUses } = req.body;
    if (!code || !validFrom || !validUntil) return res.status(400).json({ error: 'code, validFrom, validUntil required' });
    const promo = await prisma.promotion.create({
      data: {
        code,
        description: description || null,
        discountPercent: discountPercent != null ? Number(discountPercent) : null,
        discountFixed: discountFixed != null ? Number(discountFixed) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        maxUses: maxUses != null ? parseInt(maxUses, 10) : null,
      },
    });
    res.status(201).json(promo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update promotion (admin)
router.patch('/promotions/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.validFrom) body.validFrom = new Date(body.validFrom);
    if (body.validUntil) body.validUntil = new Date(body.validUntil);
    const promo = await prisma.promotion.update({
      where: { id: req.params.id },
      data: body,
    });
    res.json(promo);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Promotion not found' });
    res.status(500).json({ error: e.message });
  }
});

export default router;
