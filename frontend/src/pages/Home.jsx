import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movies } from '../api';

export default function Home() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    movies
      .list({ active: 'true', ...(search && { search }) })
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Now showing</h1>
        <input
          type="search"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-white placeholder-zinc-500 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-[var(--card)]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent)]/50"
            >
              <div className="aspect-[2/3] overflow-hidden bg-zinc-800">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">No poster</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-white group-hover:text-[var(--accent)]">{movie.title}</h2>
                <p className="text-sm text-zinc-500">{movie.genre} · {movie.durationMin} min</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!loading && list.length === 0 && (
        <p className="text-center text-zinc-500">No movies found.</p>
      )}
    </div>
  );
}
