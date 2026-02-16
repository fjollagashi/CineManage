import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analytics } from '../../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analytics
      .dashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-[#141419]" />;
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-[#2a2a32] bg-[#141419] p-6">
        <p className="text-zinc-400">Failed to load dashboard. Is the backend running on port 4000?</p>
        <Link to="/" className="mt-4 inline-block text-[#e50914] hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-zinc-500">Active movies</p>
          <p className="text-2xl font-bold text-white">{data.totalMovies}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-zinc-500">Upcoming shows</p>
          <p className="text-2xl font-bold text-white">{data.totalShows}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-zinc-500">Bookings today</p>
          <p className="text-2xl font-bold text-white">{data.bookingsToday}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-zinc-500">Revenue today</p>
          <p className="text-2xl font-bold text-white">${Number(data.revenueToday).toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Top movies (tickets sold)</h2>
        <ul className="space-y-2">
          {(data.topMovies || []).slice(0, 5).map((m, i) => (
            <li
              key={m.title}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2"
            >
              <span className="text-white">{m.title}</span>
              <span className="text-zinc-400">
                {m.tickets} tickets · ${Number(m.revenue || 0).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
