import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movies } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isCustomer } = useAuth();

  useEffect(() => {
    movies
      .get(id)
      .then(setMovie)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !movie) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-xl bg-[var(--card)]" />
      </div>
    );
  }

  const avgRating =
    movie.reviews?.length > 0
      ? (movie.reviews.reduce((s, r) => s + r.rating, 0) / movie.reviews.length).toFixed(1)
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="shrink-0 md:w-72">
          <div className="aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">No poster</div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
          <p className="mt-1 text-zinc-400">
            {movie.genre} · {movie.durationMin} min · {movie.rating}
          </p>
          {avgRating && (
            <p className="mt-2 text-amber-400">
              ★ {avgRating} ({movie.reviews?.length} reviews)
            </p>
          )}
          <p className="mt-4 text-zinc-300">{movie.description}</p>
          <p className="mt-2 text-sm text-zinc-500">
            Director: {movie.director} · Cast: {movie.actors}
          </p>
          {movie.trailerUrl && (
            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              Watch trailer
            </a>
          )}
          <div className="mt-8">
            <Link
              to={`/movie/${id}/shows`}
              className="inline-flex items-center rounded-lg bg-[var(--accent)] px-5 py-2.5 font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              See showtimes & book
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-12 border-t border-[var(--border)] pt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Reviews</h2>
        {movie.reviews?.length ? (
          <ul className="space-y-4">
            {movie.reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400">★ {r.rating}</span>
                  <span className="text-sm text-zinc-500">
                    {r.user?.firstName} {r.user?.lastName}
                  </span>
                </div>
                {r.comment && <p className="mt-2 text-zinc-300">{r.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500">No reviews yet.</p>
        )}
        {user && isCustomer && (
          <Link
            to={`/movie/${id}/review`}
            className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
          >
            Write a review
          </Link>
        )}
      </section>
    </div>
  );
}
