import { useState } from 'react';
import { Mail, Linkedin, X, ArrowLeft, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendContactMessage } from '@/functions/sendContactMessage';
import { useToast } from '@/components/ui/use-toast';

const VIEWS = { MENU: 'menu', FORM: 'form', DONE: 'done' };

export default function ContactUsModal({ open, onClose }) {
  const [view, setView] = useState(VIEWS.MENU);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setView(VIEWS.MENU);
      setName('');
      setEmail('');
      setMessage('');
    }, 300);
  };

  const handleSend = async () => {
    if (!email.trim() || !message.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Email and message are required.' });
      return;
    }
    setSending(true);
    try {
      await sendContactMessage({
        sender_name: name.trim() || undefined,
        sender_email: email.trim(),
        message: message.trim(),
      });

      setView(VIEWS.DONE);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to send', description: 'Please try again.' });
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #0f1d2d 0%, #1a2f47 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #c9a87c, #4a90b8, #c9a87c)' }} />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-white/10 z-10"
        >
          <X className="w-4 h-4 text-white/50" />
        </button>

        <AnimatePresence mode="wait">

          {/* ── MENU VIEW ── */}
          {view === VIEWS.MENU && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-6 pt-6 pb-5">
                <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Get in Touch
                </h2>
                <p className="text-sm" style={{ color: 'rgba(201,168,124,0.7)' }}>
                  We'd love to hear from you
                </p>
              </div>

              <div className="px-6 pb-6 space-y-3">
                {/* Email / Contact Form */}
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView(VIEWS.FORM)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all group text-left"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(201,168,124,0.25)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,124,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,124,0.25)'}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #c9a87c, #b8925a)' }}>
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">Email</p>
                  </div>
                  <span className="text-white/30 group-hover:text-white/60 transition-colors text-lg">→</span>
                </motion.button>

                {/* LinkedIn */}
                <motion.a
                  href="https://www.linkedin.com/company/top-100-aerospace-aviation"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(74,144,184,0.25)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(74,144,184,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(74,144,184,0.25)'}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #4a90b8, #2d6a9f)' }}>
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">LinkedIn</p>
                  </div>
                  <span className="text-white/30 group-hover:text-white/60 transition-colors text-lg">→</span>
                </motion.a>
              </div>
            </motion.div>
          )}

          {/* ── FORM VIEW ── */}
          {view === VIEWS.FORM && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-6 pt-6 pb-4 flex items-center gap-3">
                <button onClick={() => setView(VIEWS.MENU)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Send a Message
                  </h2>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-3">
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,124,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <input
                  type="email"
                  placeholder="Your email *"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,124,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <textarea
                  placeholder="Your message *"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all resize-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,124,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #c9a87c, #b8925a)' }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending…' : 'Send Message'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── DONE VIEW ── */}
          {view === VIEWS.DONE && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-12 flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,124,0.15)' }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: '#c9a87c' }} />
              </div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Message Sent!</h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>We'll get back to you shortly.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                Close
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}