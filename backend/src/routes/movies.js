import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, requireRole, optionalAuth } from '../middleware/auth.js';

const router = Router();

// List movies (public; optional auth for favorites later)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { genre, search, active } = req.query;
    const where = {};
    if (genre) where.genre = genre;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { director: { contains: search } },
      ];
    }
    if (active !== undefined) where.isActive = active === 'true';
    const movies = await prisma.movie.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { shows: true, reviews: true } },
      },
    });
    res.json(movies);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get one movie (public)
router.get('/:id', async (req, res) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: req.params.id },
      include: {
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { shows: true } },
      },
    });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: create movie
router.post('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const {
      title,
      genre,
      durationMin,
      rating,
      director,
      actors,
      description,
      posterUrl,
      trailerUrl,
    } = req.body;
    if (!title || !genre || durationMin == null || !rating || !director || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const movie = await prisma.movie.create({
      data: {
        title,
        genre,
        durationMin: parseInt(durationMin, 10),
        rating,
        director,
        actors: Array.isArray(actors) ? actors.join(', ') : (actors || ''),
        description,
        posterUrl: posterUrl || null,
        trailerUrl: trailerUrl || null,
      },
    });
    res.status(201).json(movie);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: update movie
router.patch('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.id;
    if (body.actors && Array.isArray(body.actors)) body.actors = body.actors.join(', ');
    const movie = await prisma.movie.update({
      where: { id: req.params.id },
      data: body,
    });
    res.json(movie);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Movie not found' });
    res.status(500).json({ error: e.message });
  }
});

// Admin: delete movie
router.delete('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.movie.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Movie not found' });
    res.status(500).json({ error: e.message });
  }
});

export default router;
