import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { isAdmin, isEmployee } = useAuth();

  if (!isAdmin && !isEmployee) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center text-zinc-500">
        Access denied. Admin or employee only.
      </div>
    );
  }

  const nav = [
    { to: '/admin', end: true, label: 'Dashboard' },
    { to: '/admin/bookings', label: 'Bookings' },
    ...(isAdmin
      ? [
          { to: '/admin/movies', label: 'Movies' },
          { to: '/admin/shows', label: 'Shows' },
          { to: '/admin/reviews', label: 'Reviews' },
          { to: '/admin/promotions', label: 'Promotions' },
          { to: '/admin/employees', label: 'Employees' },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-0">
            {nav.map(({ to, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm ${isActive ? 'bg-[var(--accent)] text-white' : 'text-zinc-400 hover:bg-[var(--card)] hover:text-white'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
