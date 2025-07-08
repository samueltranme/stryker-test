import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface DocumentItem {
  id: number;
  file_url: string;
  metadata: Record<string, any>;
}

const useDocuments = (search: string = '') => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const query = useQuery<DocumentItem[]>({
    queryKey: ['documents', search],
    queryFn: async () => {
      const params = search ? { search } : {};
      const response = await axios.get(`${apiUrl}/documents`, { params });
      return response.data;
    },
  });

  return query;
};

export default useDocuments;
