import { render, screen, fireEvent } from '@testing-library/react';
import FileUploadSection from '../../src/components/FileUploadSection';

describe('FileUploadSection', () => {
  const mockSetFile = jest.fn();
  const mockHandleUpload = jest.fn();
  const fakeFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without a file and disables upload button', () => {
    render(
      <FileUploadSection
        file={null}
        setFile={mockSetFile}
        handleUpload={mockHandleUpload}
        progress={0}
      />
    );

    expect(screen.getByText('Choose File')).toBeInTheDocument();
    expect(screen.getByText('Upload & Extract')).toBeDisabled();
  });

  it('renders with a selected file and enables upload button', () => {
    render(
      <FileUploadSection
        file={fakeFile}
        setFile={mockSetFile}
        handleUpload={mockHandleUpload}
        progress={0}
      />
    );

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('Upload & Extract')).toBeEnabled();
  });

  it('calls setFile on file input change', () => {
    render(
      <FileUploadSection
        file={null}
        setFile={mockSetFile}
        handleUpload={mockHandleUpload}
        progress={0}
      />
    );

    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [fakeFile] } });

    expect(mockSetFile).toHaveBeenCalledWith(fakeFile);
  });

  it('calls handleUpload on upload button click', () => {
    render(
      <FileUploadSection
        file={fakeFile}
        setFile={mockSetFile}
        handleUpload={mockHandleUpload}
        progress={0}
      />
    );

    fireEvent.click(screen.getByText('Upload & Extract'));
    expect(mockHandleUpload).toHaveBeenCalled();
  });

  it('displays upload progress', () => {
    render(
      <FileUploadSection
        file={fakeFile}
        setFile={mockSetFile}
        handleUpload={mockHandleUpload}
        progress={50}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles drag and drop file upload', () => {
    render(
      <FileUploadSection
        file={null}
        setFile={mockSetFile}
        handleUpload={mockHandleUpload}
        progress={0}
      />
    );

    const dropZone = screen.getByText('Drag and drop a document or choose a file').parentElement!;
    const dataTransfer = {
      files: [fakeFile],
      types: ['Files'],
      getData: jest.fn(),
      setData: jest.fn(),
      clearData: jest.fn(),
    };

    fireEvent.drop(dropZone, {
      dataTransfer,
    });

    expect(mockSetFile).toHaveBeenCalledWith(fakeFile);
  });
});
