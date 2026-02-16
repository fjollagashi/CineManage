import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { bookings as bookingsApi } from '../api';
import CheckoutForm from '../components/CheckoutForm';

const stripePromise = import.meta.env.VITE_STRIPE_PK
  ? loadStripe(import.meta.env.VITE_STRIPE_PK)
  : null;

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state?.showId || !state?.seatIds?.length) {
      navigate('/');
      return;
    }
    setError('');
    bookingsApi
      .create({
        showId: state.showId,
        seatIds: state.seatIds,
        promotionCode: state.promotionCode || undefined,
      })
      .then((res) => {
        setBooking(res.booking);
        setClientSecret(res.clientSecret);
        if (res.booking?.status === 'CONFIRMED') {
          navigate(`/booking/${res.booking.id}`, { state: { booking: res.booking } });
        }
      })
      .catch((err) => setError(err.message));
  }, [state?.showId, state?.seatIds, state?.promotionCode, navigate]);

  const onSuccess = (confirmedBooking) => {
    navigate(`/booking/${confirmedBooking.id}`, { state: { booking: confirmedBooking } });
  };

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 text-[var(--accent)] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="h-32 animate-pulse rounded-xl bg-[var(--card)]" />
      </div>
    );
  }

  const total = booking.totalAmount;
  const show = booking.show;
  const movie = show?.movie;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Payment</h1>
      <p className="mt-1 text-zinc-500">
        {movie?.title} · {booking.seats?.length} seat(s) · ${total.toFixed(2)}
      </p>
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        {clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              bookingId={booking.id}
              amount={total}
              onSuccess={onSuccess}
            />
          </Elements>
        ) : (
          <CheckoutForm
            bookingId={booking.id}
            amount={total}
            onSuccess={onSuccess}
            noStripe
          />
        )}
      </div>
    </div>
  );
}
