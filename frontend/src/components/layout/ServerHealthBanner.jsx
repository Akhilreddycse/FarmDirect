import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../../services/api';

/**
 * ServerHealthBanner
 * Polls the backend /api/health endpoint every 15 seconds.
 * Shows a red banner when the backend is unreachable.
 * Automatically dismisses when connection is restored.
 */
const ServerHealthBanner = () => {
  const [status, setStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [retrying, setRetrying] = useState(false);
  const [justRestored, setJustRestored] = useState(false);
  const intervalRef = useRef(null);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const checkHealth = async (isManual = false) => {
    if (isManual) setRetrying(true);
    try {
      await api.get('/health', { timeout: 4000 });
      if (statusRef.current === 'offline') {
        // Was offline — show a brief "restored" toast
        setJustRestored(true);
        setTimeout(() => setJustRestored(false), 3000);
      }
      setStatus('online');
    } catch {
      setStatus('offline');
    } finally {
      if (isManual) setRetrying(false);
    }
  };

  useEffect(() => {
    // Initial check after 2s (let app boot first)
    const initial = setTimeout(() => checkHealth(), 2000);

    // Poll every 15 seconds
    intervalRef.current = setInterval(() => checkHealth(), 15000);

    return () => {
      clearTimeout(initial);
      clearInterval(intervalRef.current);
    };
  }, []);

  // Nothing to show when online (except brief "restored" confirmation)
  if (status === 'online' && !justRestored) return null;

  // Brief green flash when connection is restored
  if (justRestored) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-bounce-in">
        <div className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
          <CheckCircle className="w-4 h-4" />
          Server connection restored!
        </div>
      </div>
    );
  }

  // Offline banner
  if (status === 'offline') {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span>
              Backend server is offline — API calls will fail.{' '}
              <span className="font-normal opacity-90">
                Run <code className="bg-red-800 px-1.5 py-0.5 rounded text-xs font-mono">npm run dev</code> in the project root to start both servers.
              </span>
            </span>
          </div>
          <button
            onClick={() => checkHealth(true)}
            disabled={retrying}
            className="flex items-center gap-1.5 bg-red-800 hover:bg-red-900 transition px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ServerHealthBanner;
