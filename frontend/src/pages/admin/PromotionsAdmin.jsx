import { useState, useEffect } from 'react';
import { admin } from '../../api';

export default function PromotionsAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const load = () => {
    admin.promotions
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
    if (!code || !validFrom || !validUntil) return;
    try {
      await admin.promotions.create({
        code,
        discountPercent: discountPercent ? Number(discountPercent) : null,
        validFrom,
        validUntil,
      });
      setCode('');
      setDiscountPercent('');
      setValidFrom('');
      setValidUntil('');
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Promotions</h1>
      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <input
          type="text"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-white"
        />
        <input
          type="number"
          placeholder="Discount %"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          min={0}
          max={100}
          className="w-24 rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-white"
        />
        <input
          type="datetime-local"
          value={validFrom}
          onChange={(e) => setValidFrom(e.target.value)}
          className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-white"
        />
        <input
          type="datetime-local"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Add
        </button>
      </form>
      {loading ? (
        <div className="mt-6 h-24 animate-pulse rounded-xl bg-[var(--card)]" />
      ) : (
        <ul className="mt-6 space-y-2">
          {list.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2"
            >
              <span className="font-mono text-white">{p.code}</span>
              <span className="text-zinc-400">
                {p.discountPercent ? `${p.discountPercent}%` : ''} · {formatDate(p.validFrom)} – {formatDate(p.validUntil)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
