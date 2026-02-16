import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shows as showsApi, movies as moviesApi } from '../api';

export default function Showtimes() {
  const { id: movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([moviesApi.get(movieId), showsApi.list({ movieId })])
      .then(([m, s]) => {
        setMovie(m);
        setShowtimes(s.filter((show) => new Date(show.startTime) >= new Date()));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [movieId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="h-32 animate-pulse rounded-xl bg-[var(--card)]" />
      </div>
    );
  }

  const formatTime = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to={`/movie/${movieId}`} className="text-sm text-zinc-400 hover:text-white">
        ← {movie?.title}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Select showtime</h1>
      <p className="mt-1 text-zinc-500">{movie?.title} · Choose a time to continue to seat selection</p>
      <ul className="mt-8 space-y-3">
        {showtimes.length === 0 ? (
          <li className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-zinc-500">
            No upcoming showtimes. Check back later.
          </li>
        ) : (
          showtimes.map((show) => (
            <li key={show.id}>
              <Link
                to={`/show/${show.id}/book`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]/50"
              >
                <div>
                  <p className="font-medium text-white">{formatTime(show.startTime)}</p>
                  <p className="text-sm text-zinc-500">{show.screenHall} · Standard ${show.ticketPriceStandard} / VIP ${show.ticketPriceVip}</p>
                </div>
                <span className="text-[var(--accent)]">Select seats →</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
