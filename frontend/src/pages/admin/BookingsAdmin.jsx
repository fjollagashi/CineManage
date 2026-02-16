import { useState, useEffect } from 'react';
import { bookings as bookingsApi } from '../../api';

export default function BookingsAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi
      .list()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Bookings</h1>
      {loading ? (
        <div className="mt-6 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--card)]" />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-zinc-500">
                <th className="pb-2 pr-4">Movie</th>
                <th className="pb-2 pr-4">Show time</th>
                <th className="pb-2 pr-4">Customer</th>
                <th className="pb-2 pr-4">Seats</th>
                <th className="pb-2 pr-4">Amount</th>
                <th className="pb-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id} className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4 font-medium text-white">{b.show?.movie?.title}</td>
                  <td className="py-3 pr-4 text-zinc-400">{formatTime(b.show?.startTime)}</td>
                  <td className="py-3 pr-4 text-zinc-400">
                    {b.user?.firstName} {b.user?.lastName}
                  </td>
                  <td className="py-3 pr-4 text-zinc-400">
                    {b.seats?.map((s) => `${s.row}${s.number}`).join(', ')}
                  </td>
                  <td className="py-3 pr-4 text-zinc-400">${b.totalAmount?.toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        b.status === 'CONFIRMED'
                          ? 'bg-green-500/20 text-green-400'
                          : b.status === 'REFUNDED'
                            ? 'bg-zinc-500/20 text-zinc-400'
                            : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
