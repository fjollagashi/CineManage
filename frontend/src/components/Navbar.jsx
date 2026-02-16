import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isEmployee, isCustomer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-white">
          Cine<span className="text-[var(--accent)]">Manage</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm text-zinc-400 hover:text-white">
            Movies
          </Link>
          {user ? (
            <>
              {isCustomer && (
                <>
                  <Link to="/bookings" className="text-sm text-zinc-400 hover:text-white">
                    My Bookings
                  </Link>
                </>
              )}
              {isEmployee && (
                <Link to="/admin/bookings" className="text-sm text-zinc-400 hover:text-white">
                  Bookings
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-sm text-zinc-400 hover:text-white">
                  Admin
                </Link>
              )}
              <div className="ml-2 flex items-center gap-2 border-l border-[var(--border)] pl-4">
                <span className="text-sm text-zinc-500">
                  {user.firstName} ({user.role})
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-zinc-400 hover:text-white">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
