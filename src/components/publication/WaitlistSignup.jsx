import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { publicationBrand as brandColors, top100Women2025Config } from '@/components/publication/publicationConfig';

export default function WaitlistSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');
    await base44.integrations.Core.SendEmail({
      to: top100Women2025Config.waitlistEmail,
      subject: top100Women2025Config.waitlistSubject,
      body: `New waitlist signup for Orbital Index feature: ${trimmedEmail}`,
    });
    setStatus('success');
    setMessage("You're on the list!");
    setEmail('');
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 rounded-full px-5 py-3"
        role="status"
        style={{ background: `${brandColors.navyDeep}10`, border: `1px solid ${brandColors.navyDeep}20` }}
      >
        <CheckCircle className="h-4 w-4" style={{ color: brandColors.goldPrestige }} />
        <span className="text-sm" style={{ color: brandColors.navyDeep }}>{message}</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col items-start gap-3 sm:flex-row sm:items-center" noValidate>
      <div className="relative w-full flex-1">
        <label htmlFor="orbital-waitlist-email" className="sr-only">Email for Orbital Index waitlist</label>
        <input
          id="orbital-waitlist-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') {
              setStatus('idle');
              setMessage('');
            }
          }}
          placeholder="Enter your email"
          aria-invalid={status === 'error'}
          aria-describedby={status === 'error' ? 'orbital-waitlist-error' : undefined}
          className="w-full rounded-full px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[#c9a87c] focus:ring-offset-2"
          style={{
            background: 'white',
            border: `1px solid ${status === 'error' ? '#b91c1c' : `${brandColors.goldPrestige}50`}`,
            color: brandColors.navyDeep,
          }}
          disabled={status === 'loading'}
        />
        {status === 'error' && (
          <div id="orbital-waitlist-error" className="mt-2 flex items-center gap-2 text-xs text-red-700" role="alert">
            <AlertCircle className="h-3.5 w-3.5" />
            {message}
          </div>
        )}
      </div>
      <Button
        type="submit"
        disabled={status === 'loading' || !email.trim()}
        className="whitespace-nowrap rounded-full px-6 py-3 text-sm font-medium transition-all focus-visible:ring-[#c9a87c]"
        style={{ background: brandColors.navyDeep, color: 'white' }}
      >
        {status === 'loading' ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending</>
        ) : (
          <><Send className="mr-2 h-4 w-4" /> Notify Me</>
        )}
      </Button>
    </form>
  );
}