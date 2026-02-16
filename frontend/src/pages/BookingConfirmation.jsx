import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookings as bookingsApi } from '../api';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi
      .get(id)
      .then(setBooking)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="h-64 animate-pulse rounded-xl bg-[var(--card)]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-zinc-500">
        Booking not found. <Link to="/" className="text-[var(--accent)]">Go home</Link>
      </div>
    );
  }

  const show = booking.show;
  const movie = show?.movie;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Booking confirmed</h1>
        <p className="mt-2 text-zinc-400">{movie?.title}</p>
        <p className="text-sm text-zinc-500">
          {new Date(show?.startTime).toLocaleString()} · {booking.seats?.length} seat(s) · ${booking.totalAmount?.toFixed(2)}
        </p>
        {booking.qrCodeData && (
          <div className="mt-6 flex justify-center">
            <img src={booking.qrCodeData} alt="QR Code" className="h-40 w-40 rounded-lg border border-[var(--border)]" />
          </div>
        )}
        <p className="mt-4 text-sm text-zinc-500">Show this QR code at the entrance</p>
        <Link
          to="/bookings"
          className="mt-6 inline-block rounded-lg bg-[var(--accent)] px-6 py-2 font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          View my bookings
        </Link>
      </div>
    </div>
  );
}
