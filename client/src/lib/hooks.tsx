import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useModuleData<T>(module: string) {
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: [module],
    queryFn: () => api.list<T>(module),
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.create<T>(module, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [module] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.update<T>(module, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [module] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(module, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [module] });
    },
  });

  return {
    data,
    loading: isLoading,
    error,
    refresh: refetch,
    create: createMutation.mutate,
    update: (id: number, data: any) => updateMutation.mutate({ id, data }),
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
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