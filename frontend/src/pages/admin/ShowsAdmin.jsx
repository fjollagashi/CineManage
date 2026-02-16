import { useState, useEffect } from 'react';
import { shows as showsApi } from '../../api';

export default function ShowsAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    showsApi
      .list({})
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Shows</h1>
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
                <th className="pb-2 pr-4">Movie</th>
                <th className="pb-2 pr-4">Start</th>
                <th className="pb-2 pr-4">Hall</th>
                <th className="pb-2 pr-4">Standard / VIP</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4 font-medium text-white">{s.movie?.title}</td>
                  <td className="py-3 pr-4 text-zinc-400">{formatTime(s.startTime)}</td>
                  <td className="py-3 pr-4 text-zinc-400">{s.screenHall}</td>
                  <td className="py-3 pr-4 text-zinc-400">
                    ${s.ticketPriceStandard} / ${s.ticketPriceVip}
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
