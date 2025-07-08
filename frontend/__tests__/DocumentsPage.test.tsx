// __tests__/DocumentsPage.test.tsx
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import DocumentsPage from '../pages/index'; // Adjust path based on your structure
import * as useDocumentsHook from '../src/hooks/useDocuments';
import { useRouter } from 'next/router';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the hook
jest.mock('../src/hooks/useDocuments');

beforeEach(() => {
  jest.useFakeTimers();
});

describe('<DocumentsPage />', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading initially', () => {
    (useDocumentsHook.default as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<DocumentsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('shows error message', () => {
    (useDocumentsHook.default as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: true,
      refetch: jest.fn(),
    });

    render(<DocumentsPage />);
    expect(screen.getByText(/failed to load documents/i)).toBeInTheDocument();
  });

  test('shows no documents found', () => {
    (useDocumentsHook.default as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<DocumentsPage />);
    expect(screen.getByText(/no documents found/i)).toBeInTheDocument();
  });

  test('renders documents in table and handles edit click', async () => {
    (useDocumentsHook.default as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          file_url: 'https://example.com/file.pdf',
          metadata: {
            title: 'Sample Doc',
            author: 'Alice',
          },
        },
      ],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<DocumentsPage />);

    expect(await screen.findByText('Sample Doc')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(mockPush).toHaveBeenCalledWith('/edit/1');
  });

  test('search input updates debounced term', async () => {
    const refetchMock = jest.fn();

    (useDocumentsHook.default as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: refetchMock,
    });

    render(<DocumentsPage />);
    const input = screen.getByPlaceholderText(/search documents/i);

    fireEvent.change(input, { target: { value: 'invoice' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });
    // advance debounce timer
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });
});
