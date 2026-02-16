import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movies as moviesApi } from '../../api';

export default function MovieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({
    title: '',
    genre: '',
    durationMin: '',
    rating: '',
    director: '',
    actors: '',
    description: '',
    posterUrl: '',
    trailerUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      moviesApi.get(id).then((m) => {
        setForm({
          title: m.title || '',
          genre: m.genre || '',
          durationMin: m.durationMin ?? '',
          rating: m.rating || '',
          director: m.director || '',
          actors: m.actors || '',
          description: m.description || '',
          posterUrl: m.posterUrl || '',
          trailerUrl: m.trailerUrl || '',
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        durationMin: parseInt(form.durationMin, 10),
        actors: form.actors,
      };
      if (isEdit) {
        await moviesApi.update(id, payload);
      } else {
        await moviesApi.create(payload);
      }
      navigate('/admin/movies');
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit movie' : 'Add movie'}</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 max-w-xl">
        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
        )}
        <label className="block">
          <span className="text-sm text-zinc-400">Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-zinc-400">Genre</span>
            <input
              type="text"
              value={form.genre}
              onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
              required
              className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-400">Duration (min)</span>
            <input
              type="number"
              value={form.durationMin}
              onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.value }))}
              required
              min={1}
              className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-zinc-400">Rating</span>
          <input
            type="text"
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
            required
            placeholder="PG-13, R, etc."
            className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-400">Director</span>
          <input
            type="text"
            value={form.director}
            onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))}
            required
            className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-400">Actors (comma-separated)</span>
          <input
            type="text"
            value={form.actors}
            onChange={(e) => setForm((f) => ({ ...f, actors: e.target.value }))}
            className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-400">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            rows={4}
            className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-400">Poster URL</span>
          <input
            type="url"
            value={form.posterUrl}
            onChange={(e) => setForm((f) => ({ ...f, posterUrl: e.target.value }))}
            className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-400">Trailer URL</span>
          <input
            type="url"
            value={form.trailerUrl}
            onChange={(e) => setForm((f) => ({ ...f, trailerUrl: e.target.value }))}
            className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[var(--accent)] px-4 py-2 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/movies')}
            className="rounded border border-[var(--border)] px-4 py-2 text-zinc-400 hover:bg-[var(--card)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
