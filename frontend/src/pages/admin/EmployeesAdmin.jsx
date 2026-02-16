import { useState, useEffect } from 'react';
import { admin } from '../../api';

export default function EmployeesAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const load = () => {
    admin.employees
      .list()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) return;
    try {
      await admin.employees.create({ email, password, firstName, lastName, role: 'EMPLOYEE' });
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Employees</h1>
      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-white"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-white"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Add employee
        </button>
      </form>
      {loading ? (
        <div className="mt-6 h-24 animate-pulse rounded-xl bg-[var(--card)]" />
      ) : (
        <ul className="mt-6 space-y-2">
          {list.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2"
            >
              <span className="text-white">{u.firstName} {u.lastName}</span>
              <span className="text-zinc-400">{u.email} · {u.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
