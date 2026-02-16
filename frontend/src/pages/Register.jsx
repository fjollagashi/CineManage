import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Create account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-400">First name</span>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-400">Last name</span>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-400">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-400">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={6}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account? <Link to="/login" className="text-[var(--accent)] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
