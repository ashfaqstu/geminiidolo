import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const BackendWakeUp = () => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const wakeUpBackend = async () => {
      const maxRetries = 5;
      const retryDelay = 5000; // 5 seconds between retries
      let attempt = 0;

      const toastId = toast.loading('Waking up the server... This may take a moment ☕', {
        duration: Infinity,
        description: 'Free-tier servers sleep after inactivity.',
      });

      while (attempt < maxRetries) {
        try {
          await axios.get(`${BACKEND_URL}/api/health`, { timeout: 15000 });
          toast.success('Server is awake and ready! 🚀', {
            id: toastId,
            duration: 3000,
            description: undefined,
          });
          return;
        } catch (err) {
          attempt++;
          if (attempt < maxRetries) {
            toast.loading(`Waking up the server... Attempt ${attempt + 1}/${maxRetries} ☕`, {
              id: toastId,
              description: 'Free-tier servers sleep after inactivity.',
            });
            await new Promise((r) => setTimeout(r, retryDelay));
          }
        }
      }

      toast.error('Server is taking too long to respond 😴', {
        id: toastId,
        duration: 6000,
        description: 'Please try refreshing the page in a minute.',
      });
    };

    wakeUpBackend();
  }, []);

  return null;
};

export default BackendWakeUp;
