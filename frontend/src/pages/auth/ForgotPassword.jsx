import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Mail, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ForgotPassword = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        addToast('Reset token generated! (See token below for local dev mode)', 'success');
        setResetToken(res.data.resetToken || '');
        setStep(2);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to request reset token', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword,
      });
      if (res.data.success) {
        addToast('Password successfully updated!', 'success');
        setSuccess(true);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-emerald-300 flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-stone-900">Reset Account Password</h2>
          <p className="text-xs text-stone-500">Securely recover access to your FarmDirect account</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-forest-600 mx-auto" />
              <h3 className="text-base font-bold text-stone-900">Password Changed!</h3>
              <p className="text-xs text-stone-500">Your account password has been safely updated.</p>
              <Link
                to="/login"
                className="w-full py-3 bg-forest-700 text-white rounded-xl text-xs font-bold inline-block"
              >
                Sign In with New Password
              </Link>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700">Registered Email Address</label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-forest-600"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-forest-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {loading ? 'Generating...' : 'Continue to Reset Password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700">Reset Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste token here"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none focus:border-forest-600 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 mt-1 focus:outline-none focus:border-forest-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-forest-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {loading ? 'Updating...' : 'Set New Password'}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500 mt-4">
            Remember your credentials?{' '}
            <Link to="/login" className="text-forest-700 font-bold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
