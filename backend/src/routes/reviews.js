import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// List reviews for a movie (public, approved only)
router.get('/movie/:movieId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { movieId: req.params.movieId, isApproved: true },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Customer: add or update review
router.put('/movie/:movieId', authMiddleware, requireRole('CUSTOMER'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (rating == null || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }
    const review = await prisma.review.upsert({
      where: {
        userId_movieId: { userId: req.userId, movieId: req.params.movieId },
      },
      create: {
        userId: req.userId,
        movieId: req.params.movieId,
        rating,
        comment: comment || null,
      },
      update: { rating, comment: comment ?? undefined },
    });
    res.json(review);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: list all reviews (including unapproved)
router.get('/admin', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        movie: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: approve/reject review
router.patch('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { isApproved } = req.body;
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isApproved: isApproved === true },
    });
    res.json(review);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Review not found' });
    res.status(500).json({ error: e.message });
  }
});

export default router;
