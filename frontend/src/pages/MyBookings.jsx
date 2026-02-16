import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookings as bookingsApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MyBookings() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi
      .list()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRefund = async (id) => {
    if (!confirm('Cancel this booking and request refund?')) return;
    try {
      await bookingsApi.refund(id);
      setList((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const formatTime = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  const canRefund = (b) =>
    b.status === 'CONFIRMED' &&
    new Date(b.show?.startTime) > new Date(Date.now() + 2 * 60 * 60 * 1000);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">My bookings</h1>
      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--card)]" />
          ))}
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.length === 0 ? (
            <li className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-zinc-500">
              No bookings yet. <Link to="/" className="text-[var(--accent)]">Browse movies</Link>
            </li>
          ) : (
            list.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{b.show?.movie?.title}</p>
                  <p className="text-sm text-zinc-500">
                    {formatTime(b.show?.startTime)} · {b.seats?.length} seat(s) · ${b.totalAmount?.toFixed(2)}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${
                      b.status === 'CONFIRMED'
                        ? 'bg-green-500/20 text-green-400'
                        : b.status === 'REFUNDED'
                          ? 'bg-zinc-500/20 text-zinc-400'
                          : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {b.status === 'CONFIRMED' && (
                    <Link
                      to={`/booking/${b.id}`}
                      className="rounded bg-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-600"
                    >
                      View QR
                    </Link>
                  )}
                  {canRefund(b) && (
                    <button
                      type="button"
                      onClick={() => handleRefund(b.id)}
                      className="rounded bg-red-500/20 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/30"
                    >
                      Cancel & refund
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
