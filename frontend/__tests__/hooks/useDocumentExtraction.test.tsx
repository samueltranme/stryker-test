// useDocumentExtraction.test.tsx
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import useDocumentExtraction from '../../src/hooks/useDocumentExtraction';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper to create a new QueryClient per test
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// Wrapper component to provide React Query context
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useDocumentExtraction hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state', () => {
    const { result } = renderHook(() => useDocumentExtraction(), { wrapper });

    expect(result.current.file).toBeNull();
    expect(result.current.metadata).toBeNull();
    expect(result.current.uploadStatus).toBe('idle');
    expect(result.current.saveStatus).toBe('idle');
  });

  test('handleUpload sets metadata and fileUrl on success', async () => {
    const mockResponse = {
      metadata: { title: 'Document Title' },
      file_url: 'http://example.com/file.pdf',
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => useDocumentExtraction(), { wrapper });

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

    act(() => {
      result.current.setFile(file);
    });

    act(() => {
      result.current.handleUpload();
    });

    await waitFor(() => {
      expect(result.current.metadata).toEqual(mockResponse.metadata);
      expect(result.current.uploadStatus).toBe('success');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/upload'),
      expect.any(FormData)
    );
  });

  test('handleSave calls API and triggers onSuccess callback', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        metadata: { title: 'Document Title' },
        file_url: 'http://example.com/file.pdf',
      },
    });

    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    const { result } = renderHook(() => useDocumentExtraction(), { wrapper });

    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });

    act(() => {
      result.current.setFile(file);
    });

    // Call handleUpload to set metadata and fileUrl in state
    act(() => {
      result.current.handleUpload();
    });

    // Wait for upload mutation to succeed and state to update
    await waitFor(() => {
      expect(result.current.metadata).toEqual({ title: 'Document Title' });
    });

    const onSuccess = jest.fn();

    act(() => {
      result.current.handleSave(onSuccess);
    });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/save'), {
        file_url: 'http://example.com/file.pdf',
        metadata: { title: 'Document Title' },
      });
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.saveStatus).toBe('success');
  });
});
