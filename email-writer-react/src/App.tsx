import { useState } from 'react';
import './App.css';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';
import axios from 'axios';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setGeneratedReply('');
    try {
      const response = await axios.post("http://localhost:9090/api/email/generate", {
        emailContent,
        tone,
      });
      setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
    } catch (error) {
      setError('Failed to generate email reply. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}
        >
          ✉️ Smart Email Reply Generator
        </Typography>

        <TextField
          label="Paste the email here"
          placeholder="Enter the original email content..."
          variant="outlined"
          fullWidth
          multiline
          rows={6}
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 3 }}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Tone (Optional)</InputLabel>
          <Select
            value={tone}
            label="Tone (Optional)"
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="Professional">Professional</MenuItem>
            <MenuItem value="Casual">Casual</MenuItem>
            <MenuItem value="Friendly">Friendly</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleSubmit}
          disabled={!emailContent || loading}
          sx={{ borderRadius: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Reply'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {generatedReply && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              ✨ Your AI-Generated Reply
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={generatedReply}
              inputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              fullWidth
              onClick={handleCopy}
              sx={{ borderRadius: 2 }}
            >
              Copy to Clipboard
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
