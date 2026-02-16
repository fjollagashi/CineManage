import { useState, useEffect } from 'react';
import { reviews as reviewsApi } from '../../api';

export default function ReviewsAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsApi
      .listAdmin()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleApproved = async (id, isApproved) => {
    try {
      await reviewsApi.moderate(id, isApproved);
      setList((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved } : r)));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Reviews</h1>
      {loading ? (
        <div className="mt-6 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--card)]" />
          ))}
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{r.movie?.title}</p>
                  <p className="text-sm text-zinc-500">
                    {r.user?.firstName} {r.user?.lastName} · ★ {r.rating}
                  </p>
                  {r.comment && <p className="mt-2 text-zinc-400">{r.comment}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <span
                    className={`rounded px-2 py-1 text-xs ${r.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}
                  >
                    {r.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleApproved(r.id, !r.isApproved)}
                    className="rounded bg-[var(--accent)]/20 px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent)]/30"
                  >
                    {r.isApproved ? 'Hide' : 'Approve'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
