import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Container, Typography, Box, Snackbar, Alert } from '@mui/material';

import FileUploadSection from '../src/components/FileUploadSection';
import ExtractedDataEditor from '../src/components/ExtractedDataEditor';
import useDocumentExtraction from '../src/hooks/useDocumentExtraction';

export default function UploadPage() {
  const router = useRouter();
  const {
    file,
    setFile,
    metadata,
    setMetadata,
    handleUpload,
    handleSave,
    uploadStatus,
    saveStatus,
  } = useDocumentExtraction();

  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const wrappedUpload = async () => {
    handleUpload(
      () => {
        setStatus({ type: 'success', message: 'Document uploaded and extracted successfully!' });
      },
      (error) => {
        setStatus({ type: 'error', message: `Upload failed: ${error.message}` });
      }
    );
  };

  const wrappedSave = async () => {
    handleSave(
      () => {
        setStatus({ type: 'success', message: 'Document saved successfully!' });
        setTimeout(() => router.push('/'), 1000);
      },
      (error) => {
        setStatus({ type: 'error', message: `Save failed: ${error.message}` });
      }
    );
  };

  return (
    <>
      <Head>
        <title>Upload Document | Customer Intelligence</title>
      </Head>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Document Extraction Tool
        </Typography>
        <FileUploadSection
          file={file}
          setFile={setFile}
          handleUpload={wrappedUpload}
          progress={uploadStatus === 'pending' ? 50 : 0}
        />
        {metadata && (
          <Box mt={4}>
            <ExtractedDataEditor
              editedData={metadata}
              setEditedData={setMetadata}
              handleSave={wrappedSave}
              saveProgress={saveStatus === 'pending' ? 50 : 0}
              saved={saveStatus === 'success'}
            />
          </Box>
        )}
        {status ? (
          <Snackbar
            open
            autoHideDuration={4000}
            onClose={() => setStatus(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setStatus(null)} severity={status.type} sx={{ width: '100%' }}>
              {status.message}
            </Alert>
          </Snackbar>
        ) : null}
      </Container>
    </>
  );
}
