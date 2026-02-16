import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shows as showsApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function SeatBooking() {
  const { id: showId } = useParams();
  const navigate = useNavigate();
  const { user, isCustomer } = useAuth();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!user || !isCustomer) {
      navigate('/login');
      return;
    }
    showsApi
      .get(showId)
      .then(setShow)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [showId, user, isCustomer, navigate]);

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;
    setSelected((prev) =>
      prev.some((s) => s.id === seat.id) ? prev.filter((s) => s.id !== seat.id) : [...prev, seat]
    );
  };

  const total = selected.reduce((sum, s) => {
    const price = s.seatType === 'VIP' ? show?.ticketPriceVip : show?.ticketPriceStandard;
    return sum + (price || 0);
  }, 0);

  const handleContinue = () => {
    if (selected.length === 0) return;
    navigate('/checkout', {
      state: { showId, show, seatIds: selected.map((s) => s.id), seats: selected, total },
    });
  };

  if (loading || !show) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-xl bg-[var(--card)]" />
      </div>
    );
  }

  const rows = [...new Set(show.seats.map((s) => s.row))].sort();
  const priceStandard = show.ticketPriceStandard;
  const priceVip = show.ticketPriceVip;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Select seats</h1>
      <p className="mt-1 text-zinc-500">
        {show.movie?.title} · {new Date(show.startTime).toLocaleString()}
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-zinc-900/50 p-6">
          <div className="mb-4 text-center text-sm text-zinc-500">Screen</div>
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <div key={row} className="flex justify-center gap-1">
                <span className="mr-2 w-6 text-sm text-zinc-500">{row}</span>
                {show.seats
                  .filter((s) => s.row === row)
                  .sort((a, b) => a.number - b.number)
                  .map((seat) => {
                    const isSelected = selected.some((s) => s.id === seat.id);
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={seat.isBooked}
                        onClick={() => toggleSeat(seat)}
                        className={`h-8 w-8 rounded text-xs font-medium transition sm:h-9 sm:w-9 ${
                          seat.isBooked
                            ? 'cursor-not-allowed bg-zinc-700 text-zinc-500'
                            : isSelected
                              ? 'bg-[var(--accent)] text-white'
                              : seat.seatType === 'VIP'
                                ? 'bg-amber-600/30 text-amber-400 hover:bg-amber-600/50'
                                : 'bg-[var(--card)] text-zinc-300 hover:bg-zinc-600'
                        }`}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-[var(--card)]" /> Available
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-amber-600/30" /> VIP (+${(priceVip - priceStandard).toFixed(0)})
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-zinc-700" /> Booked
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-[var(--accent)]" /> Selected
          </span>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-zinc-400">
          {selected.length} seat(s) selected · <strong className="text-white">${total.toFixed(2)}</strong>
        </p>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={handleContinue}
          className="mt-4 w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          Continue to payment
        </button>
      </div>
    </div>
  );
}
