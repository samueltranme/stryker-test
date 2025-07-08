import { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

interface Metadata {
  [key: string]: any;
}

const useDocumentExtraction = () => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) =>
      axios.post(`${apiUrl}/upload`, formData).then((res) => res.data),
    onSuccess: (data) => {
      setMetadata(data.metadata);
      setFileUrl(data.file_url);
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      axios.post(`${apiUrl}/save`, { file_url: fileUrl, metadata }).then((res) => res.data),
  });

  const handleUpload = (onSuccess?: () => void, onError?: (error: any) => void) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        if (onError) onError(error);
      },
    });
  };

  const handleSave = (onSuccess?: () => void, onError?: (error: any) => void) => {
    if (!metadata || !fileUrl) return;
    saveMutation.mutate(undefined, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        if (onError) onError(error);
      },
    });
  };

  return {
    file,
    setFile,
    metadata,
    setMetadata,
    handleUpload,
    handleSave,
    uploadStatus: uploadMutation.status,
    saveStatus: saveMutation.status,
  };
};

export default useDocumentExtraction;
