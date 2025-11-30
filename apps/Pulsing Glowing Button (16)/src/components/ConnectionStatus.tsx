import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from './Icons';
import { healthCheck } from '../utils/api';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      await healthCheck();
      setStatus('connected');
    } catch (error) {
      console.error('Connection check failed:', error);
      setStatus('disconnected');
    }
  };

  if (status === 'checking') {
    return null; // Don't show during initial check
  }

  if (status === 'connected' && !showDetails) {
    // Show subtle indicator when connected
    return (
      <button
        onClick={() => setShowDetails(true)}
        className="fixed bottom-4 right-4 p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors z-50"
        title="Backend Connected"
      >
        <CheckCircle size={20} />
      </button>
    );
  }

  if (status === 'disconnected') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm z-50">
        <div className="flex items-start gap-3">
          <XCircle size={24} className="text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 mb-1">Backend Disconnected</p>
            <p className="text-red-700 text-sm mb-3">
              Cannot connect to the database. Please check your connection.
            </p>
            <button
              onClick={checkConnection}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Details panel when connected
  return (
    <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <div className="flex items-start gap-3">
        <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-green-800 mb-1">Backend Connected</p>
          <p className="text-green-700 text-sm mb-3">
            Successfully connected to Neon database via Supabase
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Authentication: Active</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Database: Connected</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>API: Ready</span>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(false)}
            className="mt-3 text-green-600 hover:text-green-700 text-sm underline"
          >
            Minimize
          </button>
        </div>
      </div>
    </div>
  );
}
