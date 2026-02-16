import { Router } from 'express';
import Stripe from 'stripe';
import QRCode from 'qrcode';
import prisma from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' }) : null;

const REFUND_CUTOFF_HOURS = 2;

// List my bookings (customer) or all (employee/admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const where = req.role === 'CUSTOMER' ? { userId: req.userId } : {};
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        show: { include: { movie: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
        seats: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get one booking
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        show: { include: { movie: true } },
        user: true,
        seats: true,
      },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.userId && req.role === 'CUSTOMER') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(booking);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create payment intent and reserve seats (customer)
router.post('/', authMiddleware, requireRole('CUSTOMER'), async (req, res) => {
  try {
    const { showId, seatIds, promotionCode } = req.body;
    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'showId and seatIds array required' });
    }
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: { movie: true, seats: true },
    });
    if (!show) return res.status(404).json({ error: 'Show not found' });

    const seats = show.seats.filter((s) => seatIds.includes(s.id));
    if (seats.length !== seatIds.length) return res.status(400).json({ error: 'Invalid or duplicate seat selection' });
    const anyBooked = seats.some((s) => s.isBooked);
    if (anyBooked) return res.status(400).json({ error: 'One or more seats are already booked' });

    let total = 0;
    for (const s of seats) {
      total += s.seatType === 'VIP' ? show.ticketPriceVip : show.ticketPriceStandard;
    }

    let discount = 0;
    if (promotionCode) {
      const promo = await prisma.promotion.findUnique({
        where: { code: promotionCode, isActive: true },
      });
      if (promo && new Date() >= promo.validFrom && new Date() <= promo.validUntil) {
        if (promo.maxUses == null || promo.usedCount < promo.maxUses) {
          if (promo.discountPercent) discount = total * (promo.discountPercent / 100);
          else if (promo.discountFixed) discount = promo.discountFixed;
        }
      }
    }
    total = Math.max(0, total - discount);

    const booking = await prisma.booking.create({
      data: {
        userId: req.userId,
        showId,
        status: 'PENDING',
        totalAmount: total,
      },
    });
    await prisma.seat.updateMany({
      where: { id: { in: seatIds } },
      data: { isBooked: true, bookingId: booking.id },
    });

    if (stripe && total > 0) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'usd',
        metadata: { bookingId: booking.id },
      });
      res.status(201).json({
        booking: await prisma.booking.findUnique({
          where: { id: booking.id },
          include: { show: { include: { movie: true } }, seats: true },
        }),
        clientSecret: paymentIntent.client_secret,
      });
    } else {
      // No Stripe: confirm immediately for demo
      const qrPayload = `${booking.id}|${showId}|${req.userId}`;
      const qrCodeData = await QRCode.toDataURL(qrPayload);
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED', qrCodeData },
      });
      res.status(201).json({
        booking: await prisma.booking.findUnique({
          where: { id: booking.id },
          include: { show: { include: { movie: true } }, seats: true },
        }),
        clientSecret: null,
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Confirm payment (webhook or client callback) - in production use Stripe webhook
router.post('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { show: true },
    });
    if (!booking || booking.userId !== req.userId) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'PENDING') return res.status(400).json({ error: 'Booking already processed' });

    if (stripe && paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (pi.status !== 'succeeded') return res.status(400).json({ error: 'Payment not completed' });
    }

    const qrPayload = `${booking.id}|${booking.showId}|${req.userId}`;
    const qrCodeData = await QRCode.toDataURL(qrPayload);
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED', stripePaymentId: req.body.paymentIntentId || null, qrCodeData },
    });
    const updated = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { show: { include: { movie: true } }, seats: true },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Refund / cancel (customer or employee)
router.post('/:id/refund', authMiddleware, requireRole('CUSTOMER', 'EMPLOYEE', 'ADMIN'), async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { show: true, seats: true },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.userId && req.role === 'CUSTOMER') return res.status(403).json({ error: 'Forbidden' });
    if (booking.status !== 'CONFIRMED') return res.status(400).json({ error: 'Only confirmed bookings can be refunded' });

    const cutoff = new Date(booking.show.startTime);
    cutoff.setHours(cutoff.getHours() - REFUND_CUTOFF_HOURS);
    if (new Date() > cutoff && req.role === 'CUSTOMER') {
      return res.status(400).json({ error: `Refund only allowed until ${REFUND_CUTOFF_HOURS} hours before showtime` });
    }

    await prisma.seat.updateMany({
      where: { bookingId: booking.id },
      data: { isBooked: false, bookingId: null },
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'REFUNDED' },
    });
    res.json({ message: 'Refunded successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
