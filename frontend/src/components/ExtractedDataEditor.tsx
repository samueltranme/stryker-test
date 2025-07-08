import React from 'react';
import { Box, TextField, Button, Typography, LinearProgress } from '@mui/material';
import { useRouter } from 'next/router';

interface Props {
  editedData: Record<string, string>;
  setEditedData: (data: Record<string, string>) => void;
  handleSave: (onSuccess?: () => void) => void;
  saveProgress: number;
  saved: boolean;
}

const ExtractedDataEditor: React.FC<Props> = ({
  editedData,
  setEditedData,
  handleSave,
  saveProgress,
  saved,
}) => {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    setEditedData({ ...editedData, [key]: e.target.value });
  };

  const handleSaveClick = () => {
    handleSave(() => router.push('/'));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Edit Extracted Metadata
      </Typography>
      <Box display="grid" gap={2}>
        {Object.entries(editedData).map(([key, value]) => (
          <TextField
            key={key}
            label={key}
            fullWidth
            value={value}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, key)}
          />
        ))}
      </Box>
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveClick}>
        Save to DB
      </Button>
      {saveProgress > 0 && (
        <LinearProgress variant="determinate" value={saveProgress} sx={{ mt: 2 }} />
      )}
      {saved && (
        <Typography color="success.main" mt={1}>
          Saved successfully!
        </Typography>
      )}
    </Box>
  );
};

export default ExtractedDataEditor;
