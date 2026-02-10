import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || ''; // In production, leave empty so /api/* routes are proxied via vercel.json rewrites

const BackendWakeUp = () => {
  const hasRun = useRef(false);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [attempt, setAttempt] = useState(1);
  const maxRetries = 5;

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const wakeUpBackend = async () => {
      const retryDelay = 5000;
      let currentAttempt = 0;

      while (currentAttempt < maxRetries) {
        try {
          await axios.get(`${BACKEND_URL}/api/health`, { timeout: 15000 });
          setStatus('success');
          return;
        } catch (err) {
          currentAttempt++;
          setAttempt(currentAttempt + 1);
          if (currentAttempt < maxRetries) {
            await new Promise((r) => setTimeout(r, retryDelay));
          }
        }
      }

      setStatus('error');
    };

    wakeUpBackend();
  }, []);

  if (status === 'success') return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 text-center px-6 max-w-md">
        {status === 'loading' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <Loader2 className="relative w-16 h-16 text-primary animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Waking up the server...
              </h2>
              <p className="text-foreground/60 text-sm">
                Free-tier servers sleep after inactivity. This may take a moment ☕
              </p>
            </div>
            <div className="flex items-center gap-2 text-foreground/40 text-xs">
              <span>Attempt {attempt} of {maxRetries}</span>
              <div className="flex gap-1">
                {Array.from({ length: maxRetries }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      i < attempt ? 'bg-primary' : 'bg-foreground/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl">😴</div>
            <div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">
                Server is taking too long
              </h2>
              <p className="text-foreground/60 text-sm mb-4">
                The server didn't respond after {maxRetries} attempts.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-105 transition-all"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BackendWakeUp;
