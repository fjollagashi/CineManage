import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reviews as reviewsApi } from '../api';

export default function ReviewForm() {
  const { id: movieId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await reviewsApi.submit(movieId, { rating, comment });
      navigate(`/movie/${movieId}`);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Write a review</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
        )}
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">Rating</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`rounded-lg border px-4 py-2 text-lg ${
                  rating >= n
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-[var(--border)] bg-[var(--card)] text-zinc-500'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Comment (optional)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit review'}
        </button>
      </form>
    </div>
  );
}
