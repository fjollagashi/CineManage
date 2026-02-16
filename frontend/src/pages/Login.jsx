import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'EMPLOYEE' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 min-h-[60vh]">
      <div className="rounded-2xl border border-[#2a2a32] bg-[#141419] p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Sign in</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
          )}
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-400">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-400">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Don't have an account? <Link to="/register" className="text-[var(--accent)] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
