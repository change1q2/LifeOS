import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useModuleData<T>(module: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.list<T>(module);
      setData(result);
    } catch (err) {
      console.error(`Failed to fetch ${module}:`, err);
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const show = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2200);
  };

  const ToastEl = message ? (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 translate-y-0 rounded-md bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all z-[2000]">
      {message}
    </div>
  ) : null;

  return { show, ToastEl };
}
