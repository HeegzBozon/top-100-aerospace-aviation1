import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createPaymentSession } from '@/functions/createPaymentSession';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Check } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ amount, description, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Create payment intent on backend
      const { clientSecret } = await createPaymentSession({
        amount,
        description,
      });

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { email: '' },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Check className="w-12 h-12 text-green-500" />
        <p className="font-semibold text-slate-700">Payment successful!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-500">Amount</p>
        <p className="text-2xl font-bold text-slate-800">${(amount / 100).toLocaleString()}</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Card Details</label>
        <div className="border border-slate-200 rounded-lg p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: '#1e3a5a',
                  '::placeholder': { color: '#a0aec0' },
                },
                invalid: { color: '#ef4444' },
              },
            }}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-[#1e3a5a] hover:bg-[#1e3a5a]/90 text-white gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${(amount / 100).toLocaleString()}`
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function PaymentModal({ isOpen, onClose, amount, onSuccess }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={amount}
            description="Onboarding deposit"
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}