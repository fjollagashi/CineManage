import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Sales reports: daily/weekly/monthly
router.get('/sales', authMiddleware, requireRole('ADMIN', 'EMPLOYEE'), async (req, res) => {
  try {
    const { period = 'day' } = req.query; // day | week | month
    const now = new Date();
    let start;
    if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      start = d;
    } else {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
    }
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        createdAt: { gte: start },
      },
      include: { show: { include: { movie: true } } },
    });
    const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
    const byMovie = {};
    for (const b of bookings) {
      const title = b.show.movie.title;
      if (!byMovie[title]) byMovie[title] = { tickets: 0, revenue: 0 };
      byMovie[title].tickets += b.seats?.length ?? 1;
      byMovie[title].revenue += b.totalAmount;
    }
    res.json({
      period,
      from: start,
      to: now,
      totalBookings: bookings.length,
      totalRevenue,
      byMovie: Object.entries(byMovie).map(([title, d]) => ({ movie: title, ...d })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Refunds & cancellations
router.get('/refunds', authMiddleware, requireRole('ADMIN', 'EMPLOYEE'), async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = { status: { in: ['REFUNDED', 'CANCELLED'] } };
    if (from) where.updatedAt = { ...where.updatedAt, gte: new Date(from) };
    if (to) where.updatedAt = { ...where.updatedAt, lte: new Date(to) };
    const list = await prisma.booking.findMany({
      where,
      include: { show: { include: { movie: true } }, user: { select: { email: true, firstName: true, lastName: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Dashboard summary (admin)
router.get('/dashboard', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalMovies, totalShows, confirmedToday, revenueToday, topMovies] = await Promise.all([
      prisma.movie.count({ where: { isActive: true } }),
      prisma.show.count({ where: { startTime: { gte: new Date() } } }),
      prisma.booking.count({
        where: { status: 'CONFIRMED', createdAt: { gte: today } },
      }),
      prisma.booking.aggregate({
        where: { status: 'CONFIRMED', createdAt: { gte: today } },
        _sum: { totalAmount: true },
      }),
      prisma.booking.groupBy({
        by: ['showId'],
        where: { status: 'CONFIRMED' },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
    ]);
    const showIds = topMovies.map((s) => s.showId);
    const shows = await prisma.show.findMany({
      where: { id: { in: showIds } },
      include: { movie: { select: { title: true } } },
    });
    const byTitle = {};
    for (const s of shows) {
      const t = s.movie.title;
      if (!byTitle[t]) byTitle[t] = { tickets: 0, revenue: 0 };
      const g = topMovies.find((x) => x.showId === s.id);
      if (g) {
        byTitle[t].tickets += g._count.id;
        byTitle[t].revenue += g._sum.totalAmount || 0;
      }
    }
    res.json({
      totalMovies,
      totalShows,
      bookingsToday: confirmedToday,
      revenueToday: revenueToday._sum.totalAmount || 0,
      topMovies: Object.entries(byTitle)
        .map(([title, d]) => ({ title, ...d }))
        .sort((a, b) => b.tickets - a.tickets)
        .slice(0, 10),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
