import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import useDocument from '../../src/hooks/useDocument';

export default function EditDocumentPage() {
  const router = useRouter();
  const { id } = router.query;

  const { editedData, setEditedData, isLoading, isSaving, fetchDocument, saveDocument } =
    useDocument(id as string);

  const [status, setStatus] = useState<null | {
    type: 'success' | 'error' | 'warning';
    message: string;
  }>(null);

  useEffect(() => {
    if (id) fetchDocument();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    saveDocument(
      () => {
        setStatus({ type: 'success', message: 'Document saved successfully!' });
        setTimeout(() => router.push('/'), 1000); // short delay for feedback
      },
      (error) => {
        setStatus({ type: 'error', message: `Failed to save the document. ${error.message}` });
      }
    );
  };

  if (isLoading || !editedData) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Document | Customer Intelligence</title>
      </Head>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Document Metadata
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(editedData).map(([key, value]) =>
            key !== 'file_url' ? (
              <TextField
                key={key}
                label={key}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                fullWidth
              />
            ) : null
          )}

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            sx={{ mt: 2 }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Container>

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
    </>
  );
}
