// __tests__/EditDocumentPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import EditDocumentPage from '../pages/edit/[id]'; // adjust path if needed
import { useRouter } from 'next/router';
import useDocument from '../src/hooks/useDocument';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../src/hooks/useDocument', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('EditDocumentPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { id: '123' },
      push: mockPush,
    });

    (useDocument as jest.Mock).mockReturnValue({
      data: { title: 'Sample Title', author: 'John Doe', file_url: 'url' },
      editedData: { title: 'Sample Title', author: 'John Doe', file_url: 'url' },
      setEditedData: jest.fn(),
      isLoading: false,
      isSaving: false,
      fetchDocument: jest.fn(),
      saveDocument: (cb: () => void) => cb(),
    });
  });

  it('renders form with fields and allows save', () => {
    render(<EditDocumentPage />);

    expect(screen.getByLabelText('title')).toBeInTheDocument();
    expect(screen.getByLabelText('author')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('author'), {
      target: { value: 'Alice' },
    });

    fireEvent.click(screen.getByText('Save Changes'));

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
