import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { X, Calendar as CalendarIcon, Clock, CheckCircle, Loader2 } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function BookMeetingModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    date: '',
    time: '',
    notes: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [meetLink, setMeetLink] = useState('');

  const handleDateChange = async (date) => {
    setFormData({ ...formData, date, time: '' });
    if (!date) return;

    setIsLoadingSlots(true);
    try {
      const response = await base44.functions.invoke('getAvailableSlots', { date });
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await base44.functions.invoke('bookPartnershipMeeting', {
        ...formData,
        duration: 60
      });

      if (response.data.success) {
        setMeetLink(response.data.meetLink);
        setIsComplete(true);
      } else {
        throw new Error('Failed to book meeting');
      }
    } catch (error) {
      console.error('Failed to book meeting:', error);
      alert('Failed to book meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', company: '', date: '', time: '', notes: '' });
    setIsComplete(false);
    setMeetLink('');
    onClose();
  };

  const canSubmit = formData.name && formData.email && formData.company && formData.date && formData.time;

  if (!isOpen) return null;

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.8)' }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
          style={{ background: 'white' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5"
          >
            <X className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
          </button>

          {/* Content */}
          <div className="p-12">
            {!isComplete ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: brandColors.goldPrestige + '20' }}>
                    <CalendarIcon className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold" style={{ 
                      color: brandColors.navyDeep,
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      Book a Meeting
                    </h2>
                    <p className="text-sm" style={{ color: brandColors.navyDeep + '60' }}>
                      Schedule a 1-hour partnership discussion
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
                        Your Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Smith"
                        required
                        className="border-2"
                        style={{ borderColor: brandColors.navyDeep + '20' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@company.com"
                        required
                        className="border-2"
                        style={{ borderColor: brandColors.navyDeep + '20' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
                      Company *
                    </label>
                    <Input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your Company"
                      required
                      className="border-2"
                      style={{ borderColor: brandColors.navyDeep + '20' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
                      Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={today}
                      required
                      className="border-2"
                      style={{ borderColor: brandColors.navyDeep + '20' }}
                    />
                  </div>

                  {formData.date && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
                        Available Times (EST) *
                      </label>
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" style={{ color: brandColors.goldPrestige }} />
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border-2 rounded-lg" style={{ borderColor: brandColors.navyDeep + '20' }}>
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => setFormData({ ...formData, time: slot.time })}
                              className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                              style={{
                                background: formData.time === slot.time ? brandColors.goldPrestige : brandColors.cream,
                                color: formData.time === slot.time ? 'white' : brandColors.navyDeep,
                                border: `2px solid ${formData.time === slot.time ? brandColors.goldPrestige : 'transparent'}`
                              }}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-sm text-gray-500">
                          No available slots for this date
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Tell us what you'd like to discuss..."
                      rows={3}
                      className="w-full px-3 py-2 border-2 rounded-lg resize-none"
                      style={{ borderColor: brandColors.navyDeep + '20' }}
                    />
                  </div>

                  <div className="flex items-center gap-2 p-4 rounded-lg" style={{ background: brandColors.skyBlue + '10' }}>
                    <Clock className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                    <p className="text-sm" style={{ color: brandColors.navyDeep }}>
                      <strong>Duration:</strong> 60 minutes · <strong>Format:</strong> Google Meet video call
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full py-6 text-lg mt-6"
                    style={{
                      background: canSubmit && !isSubmitting ? brandColors.goldPrestige : brandColors.navyDeep + '20',
                      color: canSubmit && !isSubmitting ? 'white' : brandColors.navyDeep + '60'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Booking Meeting...
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: brandColors.goldPrestige + '20' }}>
                  <CheckCircle className="w-10 h-10" style={{ color: brandColors.goldPrestige }} />
                </div>
                <h2 className="text-3xl font-bold mb-4" style={{ 
                  color: brandColors.navyDeep,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Meeting Booked!
                </h2>
                <p className="text-lg mb-6" style={{ color: brandColors.navyDeep + '80' }}>
                  Calendar invite sent to <strong>{formData.email}</strong>
                </p>
                {meetLink && (
                  <div className="p-4 rounded-lg mb-6" style={{ background: brandColors.cream }}>
                    <p className="text-sm mb-2" style={{ color: brandColors.navyDeep + '60' }}>
                      Google Meet Link:
                    </p>
                    <a 
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-medium hover:underline"
                      style={{ color: brandColors.skyBlue }}
                    >
                      {meetLink}
                    </a>
                  </div>
                )}
                <Button
                  onClick={handleClose}
                  className="px-8 py-6 text-lg"
                  style={{ background: brandColors.goldPrestige, color: 'white' }}
                >
                  Done
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}