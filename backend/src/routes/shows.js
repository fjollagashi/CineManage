import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// List shows (by movie or by date range) - public
router.get('/', async (req, res) => {
  try {
    const { movieId, from, to } = req.query;
    const where = {};
    if (movieId) where.movieId = movieId;
    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }
    const shows = await prisma.show.findMany({
      where,
      include: {
        movie: { select: { id: true, title: true, durationMin: true, posterUrl: true } },
        _count: { select: { seats: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    res.json(shows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get one show with seats
router.get('/:id', async (req, res) => {
  try {
    const show = await prisma.show.findUnique({
      where: { id: req.params.id },
      include: {
        movie: true,
        seats: { orderBy: [{ row: 'asc' }, { number: 'asc' }] },
      },
    });
    if (!show) return res.status(404).json({ error: 'Show not found' });
    res.json(show);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: create show
router.post('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { movieId, startTime, endTime, ticketPriceStandard, ticketPriceVip, screenHall } = req.body;
    if (!movieId || !startTime) return res.status(400).json({ error: 'movieId and startTime required' });
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 120 * 60 * 1000);
    const show = await prisma.show.create({
      data: {
        movieId,
        startTime: start,
        endTime: end,
        ticketPriceStandard: Number(ticketPriceStandard ?? 10),
        ticketPriceVip: Number(ticketPriceVip ?? 15),
        screenHall: screenHall || 'Hall 1',
      },
    });
    // Create default seat layout (5 rows A-E, 8 seats per row)
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seats = rows.flatMap((row, i) =>
      Array.from({ length: 8 }, (_, j) => ({
        showId: show.id,
        row,
        number: j + 1,
        seatType: i === 0 ? 'VIP' : 'STANDARD',
      }))
    );
    await prisma.seat.createMany({ data: seats });
    const withSeats = await prisma.show.findUnique({
      where: { id: show.id },
      include: { movie: true, seats: true },
    });
    res.status(201).json(withSeats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: update show
router.patch('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.startTime) body.startTime = new Date(body.startTime);
    if (body.endTime) body.endTime = new Date(body.endTime);
    const show = await prisma.show.update({
      where: { id: req.params.id },
      data: body,
    });
    res.json(show);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Show not found' });
    res.status(500).json({ error: e.message });
  }
});

// Admin: delete show
router.delete('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.show.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Show not found' });
    res.status(500).json({ error: e.message });
  }
});

export default router;
