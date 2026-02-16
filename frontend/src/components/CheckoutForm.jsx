import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { bookings as bookingsApi } from '../api';

function StripePaymentForm({ bookingId, amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin + '/booking/' + bookingId },
      });
      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setLoading(false);
        return;
      }
      const booking = await bookingsApi.confirm(bookingId, {
        paymentIntentId: stripe.paymentIntent?.id,
      });
      onSuccess(booking);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-6 w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

function DemoConfirmForm({ bookingId, amount, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const booking = await bookingsApi.confirm(bookingId, {});
      onSuccess(booking);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-zinc-400">
        Demo mode: no Stripe key. Confirm to complete booking.
      </p>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? 'Confirming...' : `Confirm booking · $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutForm({ bookingId, amount, onSuccess, noStripe }) {
  if (noStripe) {
    return <DemoConfirmForm bookingId={bookingId} amount={amount} onSuccess={onSuccess} />;
  }
  return <StripePaymentForm bookingId={bookingId} amount={amount} onSuccess={onSuccess} />;
}
