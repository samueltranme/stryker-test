// __tests__/UploadPage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import UploadPage from '../pages/upload';
import * as useDocumentExtractionHook from '../src/hooks/useDocumentExtraction';

// Mock child components to simplify test (optional)
jest.mock('../src/components/FileUploadSection', () => (props: any) => {
  return <div data-testid="file-upload-section">{JSON.stringify(props)}</div>;
});
jest.mock('../src/components/ExtractedDataEditor', () => (props: any) => {
  return <div data-testid="extracted-data-editor">{JSON.stringify(props)}</div>;
});

// Mock the hook
jest.mock('../src/hooks/useDocumentExtraction');

describe('<UploadPage />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders header and file upload section with initial state', () => {
    (useDocumentExtractionHook.default as jest.Mock).mockReturnValue({
      file: null,
      setFile: jest.fn(),
      metadata: null,
      setMetadata: jest.fn(),
      handleUpload: jest.fn(),
      handleSave: jest.fn(),
      uploadStatus: 'idle',
      saveStatus: 'idle',
    });

    render(<UploadPage />);

    expect(screen.getByText(/document extraction tool/i)).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    // Since metadata is null, ExtractedDataEditor should not render
    expect(screen.queryByTestId('extracted-data-editor')).toBeNull();
  });

  test('renders ExtractedDataEditor when metadata is available', () => {
    (useDocumentExtractionHook.default as jest.Mock).mockReturnValue({
      file: { name: 'doc.pdf' },
      setFile: jest.fn(),
      metadata: { title: 'Test Document' },
      setMetadata: jest.fn(),
      handleUpload: jest.fn(),
      handleSave: jest.fn(),
      uploadStatus: 'pending',
      saveStatus: 'success',
    });

    render(<UploadPage />);

    expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    expect(screen.getByTestId('extracted-data-editor')).toBeInTheDocument();

    // You can also check if progress and saved props are passed correctly by inspecting JSON string
    const fileUploadProps = JSON.parse(
      screen.getByTestId('file-upload-section').textContent || '{}'
    );
    expect(fileUploadProps.progress).toBe(50);

    const editorProps = JSON.parse(screen.getByTestId('extracted-data-editor').textContent || '{}');
    expect(editorProps.saveProgress).toBe(0); // because saveStatus === 'success', so progress = 0
    expect(editorProps.saved).toBe(true);
  });
});
