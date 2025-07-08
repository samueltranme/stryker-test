import Head from 'next/head';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import useDocuments from '../src/hooks/useDocuments';

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: documents, isLoading, error, refetch } = useDocuments(debouncedSearch);

  useEffect(() => {
    refetch();
  }, [debouncedSearch, refetch]);

  const handleEdit = (id: number) => router.push(`/edit/${id}`);
  const goToUpload = () => router.push('/upload');

  return (
    <>
      <Head>
        <title>Document List | Customer Intelligence</title>
      </Head>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h4">Uploaded Documents</Typography>
          <Button variant="contained" onClick={goToUpload}>
            Upload New Document
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />

        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">Failed to load documents.</Typography>
        ) : !documents || documents.length === 0 ? (
          <Typography>No documents found.</Typography>
        ) : (
          <Paper sx={{ overflowX: 'auto' }}>
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    {Object.keys(documents[0].metadata).map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>{doc.id}</TableCell>
                      {Object.entries(doc.metadata).map(([key, value]) => (
                        <TableCell
                          key={key}
                          sx={{
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {value}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button size="small" href={doc.file_url} target="_blank">
                          Preview
                        </Button>
                        <Button size="small" onClick={() => handleEdit(doc.id)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </>
  );
}
