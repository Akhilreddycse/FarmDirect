import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Check, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const FollowFarmButton = ({ farmerId, farmName = 'this farm', className = '' }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const token = localStorage.getItem('farmdirect_token');

  useEffect(() => {
    if (!farmerId) return;
    if (!token) {
      setReady(true);
      return;
    }

    let isMounted = true;
    api
      .get(`/follow/${farmerId}/status`)
      .then((res) => {
        if (isMounted) setIsFollowing(!!res.data.isFollowing);
      })
      .catch((err) => {
        console.warn('Status check failed:', err.message);
      })
      .finally(() => {
        if (isMounted) setReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, [farmerId, token]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      addToast('Please log in to follow farms and get harvest alerts!', 'info');
      navigate('/login');
      return;
    }

    setBusy(true);
    try {
      if (isFollowing) {
        const res = await api.delete(`/follow/${farmerId}`);
        setIsFollowing(false);
        addToast(res.data?.message || `Unfollowed ${farmName}`, 'info');
      } else {
        const res = await api.post(`/follow/${farmerId}`);
        setIsFollowing(true);
        addToast(
          res.data?.message || `✓ Following ${farmName}! You'll receive notifications for new harvests.`,
          'success'
        );
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
      const msg = err.response?.data?.message || 'Could not update follow status';
      addToast(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy || !ready}
      type="button"
      className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-60 cursor-pointer ${
        isFollowing
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
          : 'bg-forest-700 text-white hover:bg-forest-800 active:scale-95'
      } ${className}`}
      title={isFollowing ? 'Click to unfollow' : 'Follow this farm to receive crop harvest alerts'}
    >
      {busy ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Following Farm
        </>
      ) : (
        <>
          <Heart className="w-3.5 h-3.5" />
          Follow Farm
        </>
      )}
    </button>
  );
};

export default FollowFarmButton;
