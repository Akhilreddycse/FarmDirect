import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const Contact = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setSubmitted(true);
        addToast('Thank you! Your message has been sent to our support team.', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Get in Touch</span>
        <h1 className="text-3xl font-extrabold text-stone-900 font-display mt-1">
          Farmer & Customer Support
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-2">
          Have queries about farmer registration, crop delivery schedules, or marketplace orders? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        <div className="lg:col-span-5 bg-forest-950 text-white p-8 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold font-display text-emerald-400">Headquarters & Farmer Helpdesk</h3>
          <p className="text-xs text-stone-300 leading-relaxed">
            Our agricultural liaison centers operate across Tamil Nadu.
          </p>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>+91 9701264680</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>akhilreddysangepu1@gmail.com</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Tamil Nadu</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-forest-600 mx-auto" />
              <h3 className="text-base font-bold text-stone-900">Message Received</h3>
              <p className="text-xs text-stone-500">We will respond within 4 business hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs mt-1 focus:outline-none focus:border-forest-600"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs mt-1 focus:outline-none focus:border-forest-600"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700">Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs mt-1 focus:outline-none focus:border-forest-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-forest-700 hover:bg-forest-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
