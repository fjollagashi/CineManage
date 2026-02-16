import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movies as moviesApi } from '../../api';

export default function MoviesAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moviesApi
      .list({})
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await moviesApi.delete(id);
      setList((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Movies</h1>
        <Link
          to="/admin/movies/new"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Add movie
        </Link>
      </div>
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
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Genre</th>
                <th className="pb-2 pr-4">Duration</th>
                <th className="pb-2 pr-4">Active</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4 font-medium text-white">{m.title}</td>
                  <td className="py-3 pr-4 text-zinc-400">{m.genre}</td>
                  <td className="py-3 pr-4 text-zinc-400">{m.durationMin} min</td>
                  <td className="py-3 pr-4">{m.isActive ? 'Yes' : 'No'}</td>
                  <td className="py-3">
                    <Link to={`/admin/movies/${m.id}`} className="text-[var(--accent)] hover:underline">
                      Edit
                    </Link>
                    {' · '}
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id, m.title)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
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
