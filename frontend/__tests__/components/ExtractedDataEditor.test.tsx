// __tests__/ExtractedDataEditor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ExtractedDataEditor from '../../src/components/ExtractedDataEditor'; // adjust path if needed
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('ExtractedDataEditor', () => {
  const mockPush = jest.fn();
  const mockSetEditedData = jest.fn();
  const mockHandleSave = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders form fields based on editedData and calls handlers', () => {
    render(
      <ExtractedDataEditor
        editedData={{ title: 'Test Title', author: 'Test Author' }}
        setEditedData={mockSetEditedData}
        handleSave={mockHandleSave}
        saveProgress={0}
        saved={false}
      />
    );

    expect(screen.getByLabelText('title')).toBeInTheDocument();
    expect(screen.getByLabelText('author')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('title'), {
      target: { value: 'Updated Title' },
    });

    expect(mockSetEditedData).toHaveBeenCalledWith({
      title: 'Updated Title',
      author: 'Test Author',
    });

    fireEvent.click(screen.getByText('Save to DB'));
    expect(mockHandleSave).toHaveBeenCalled();
  });

  it('shows progress bar and success message when appropriate', () => {
    render(
      <ExtractedDataEditor
        editedData={{ title: 'Test Title' }}
        setEditedData={mockSetEditedData}
        handleSave={mockHandleSave}
        saveProgress={70}
        saved={true}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Saved successfully!')).toBeInTheDocument();
  });
});
