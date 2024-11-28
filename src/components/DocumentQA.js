import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDocument } from 'pdfjs-dist/webpack';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Configure PDF.js worker
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MessageContent = ({ content }) => {
  return (
    <Box sx={{ 
      '& p': { m: 0 },
      '& h1': { mt: 1, mb: 2 },
      '& h2': { mt: 1, mb: 1 },
      '& h3': { mt: 1, mb: 1 },
      '& ul, & ol': { mt: 0.5, mb: 0.5 },
      '& code': { 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '2px 4px',
        borderRadius: 1,
        fontFamily: 'monospace'
      },
      '& pre': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 1,
        borderRadius: 1,
        overflow: 'auto'
      }
    }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </Box>
  );
};

function DocumentQA() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.includes('pdf')) {
      setNotification({
        open: true,
        message: 'Please upload a PDF file',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
      }

      setDocumentContent(fullText.trim());
      setFileName(file.name);
      setNotification({
        open: true,
        message: 'Document uploaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      setNotification({
        open: true,
        message: 'Error processing PDF file',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const clearDocument = () => {
    setDocumentContent('');
    setFileName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !documentContent) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.x.ai/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "grok-beta",
          max_tokens: 1280,
          system: `You are a helpful assistant. Format your responses using markdown for better readability. Use headings, lists, and code blocks where appropriate. Use the following document content to answer questions: ${documentContent}`,
          messages: [
            {
              role: "user",
              content: `Based on the provided document, ${userMessage}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      const assistantMessage = Array.isArray(data.content) 
        ? data.content.map(item => item.text).join('')
        : typeof data.content === 'object' && data.content.text 
          ? data.content.text 
          : data.content;

      setMessages(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: 'Sorry, there was an error processing your request.' }
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      <Paper 
        elevation={3} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            backgroundColor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h4">
            Document Q&A
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {fileName && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {fileName}
                </Typography>
                <Tooltip title="Remove document">
                  <IconButton size="small" onClick={clearDocument}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            <Tooltip title="Upload PDF">
              <IconButton
                component="label"
                disabled={loading}
              >
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleFileUpload}
                />
                <UploadFileIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {messages.map((message, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                maxWidth: '80%',
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: message.role === 'user' ? 'primary.dark' : 'background.paper'
              }}
            >
              {message.role === 'user' ? (
                <Typography>{message.content}</Typography>
              ) : (
                <MessageContent content={message.content} />
              )}
            </Paper>
          ))}
        </Box>

        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            p: 2, 
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            backgroundColor: 'background.paper',
            display: 'flex',
            gap: 1
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={documentContent ? "Ask a question about the document..." : "Upload a PDF first"}
            disabled={loading || !documentContent}
            sx={{ backgroundColor: 'background.default' }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !documentContent}
            endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default DocumentQA;
