import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const useDocument = (id: string) => {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [editedData, setEditedData] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  const fetchDocument = async () => {
    if (!id) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await axios.get(`${apiUrl}/document/${id}`);
      setData(res.data);
      setEditedData(res.data.metadata);
    } catch (error: any) {
      setFetchError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: (updatedMetadata: Record<string, string>) =>
      axios.put(`${apiUrl}/document/${id}`, { metadata: updatedMetadata }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
    },
  });

  const saveDocument = (onSuccess?: () => void, onError?: (error: any) => void) => {
    if (!editedData) return;

    saveMutation.mutate(editedData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['document', id] });
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        if (onError) onError(error);
      },
    });
  };

  return {
    data,
    editedData,
    setEditedData,
    isLoading,
    fetchError,
    fetchDocument,
    saveDocument,
    isSaving: saveMutation.isPending,
  };
};

export default useDocument;
