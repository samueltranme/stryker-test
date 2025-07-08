import React, { useCallback, useRef } from 'react';
import { Box, Button, LinearProgress, Typography, Paper } from '@mui/material';

interface Props {
  file: File | null;
  setFile: (file: File | null) => void;
  handleUpload: () => void;
  progress: number;
}

const FileUploadSection: React.FC<Props> = ({ file, setFile, handleUpload, progress }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) setFile(droppedFile);
    },
    [setFile]
  );

  const handleFileClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <Box my={2}>
      <Paper
        elevation={2}
        sx={{
          border: '2px dashed #aaa',
          padding: 4,
          textAlign: 'center',
          backgroundColor: '#fafafa',
        }}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Typography variant="body1" mb={2}>
          Drag and drop a document or choose a file
        </Typography>

        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          hidden
          data-testid="file-input"
        />

        <Button variant="outlined" onClick={handleFileClick} sx={{ minWidth: 220 }}>
          {file ? file.name : 'Choose File'}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          sx={{ ml: 2 }}
          disabled={!file}
        >
          Upload & Extract
        </Button>
      </Paper>

      {progress > 0 && <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />}
    </Box>
  );
};

export default FileUploadSection;
