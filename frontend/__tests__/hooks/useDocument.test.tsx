// __tests__/useDocument.test.tsx
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import useDocument from '../../src/hooks/useDocument';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDocument', () => {
  const id = '123';
  const mockData = {
    id,
    metadata: { title: 'Test Doc', author: 'Tester' },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and sets document data correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useDocument(id), { wrapper: createWrapper() });

    // Initially loading true when fetching
    act(() => {
      result.current.fetchDocument();
    });

    expect(result.current.isLoading).toBe(true);

    // Wait for data to be set
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.editedData).toEqual(mockData.metadata);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.fetchError).toBeNull();
    });
  });

  it('handles fetch error', async () => {
    const error = new Error('Network Error');
    mockedAxios.get.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useDocument(id), { wrapper: createWrapper() });

    act(() => {
      result.current.fetchDocument();
    });

    await waitFor(() => {
      expect(result.current.fetchError).toBe(error);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('saves edited data successfully', async () => {
    mockedAxios.put.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDocument(id), { wrapper: createWrapper() });

    // Set some editedData
    act(() => {
      result.current.setEditedData({ title: 'Updated Title' });
    });

    // Mock onSuccess callback
    const onSuccess = jest.fn();

    act(() => {
      result.current.saveDocument(onSuccess);
    });

    // Wait for mutation to complete
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(expect.stringContaining(`/document/${id}`), {
        metadata: { title: 'Updated Title' },
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('does not save if editedData is null', () => {
    const { result } = renderHook(() => useDocument(id), { wrapper: createWrapper() });

    act(() => {
      result.current.setEditedData(null);
      result.current.saveDocument();
    });

    expect(mockedAxios.put).not.toHaveBeenCalled();
  });
});
