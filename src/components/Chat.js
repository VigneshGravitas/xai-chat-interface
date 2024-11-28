import React, { useState } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCloseCopyAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setCopySuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

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
          system: "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy. Format your responses using markdown for better readability. Use headings, lists, and code blocks where appropriate.",
          messages: [
            {
              role: "user",
              content: userMessage
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
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      height: '100%',
      backgroundColor: '#1a1a1a',
      color: 'white',
      px: 3,
      position: 'relative'
    }}>
      <Box sx={{ 
        width: '45%', 
        height: '90%',
        border: '1px solid #333',
        borderRadius: '8px',
        p: 3,
        backgroundColor: '#242424'
      }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#fff' }}>User Input</Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          multiline
          rows={20}
          sx={{
            height: 'calc(100% - 60px)',
            '& .MuiOutlinedInput-root': {
              height: '100%',
              color: 'white',
              backgroundColor: '#2a2a2a',
              '& fieldset': {
                borderColor: '#333',
              },
              '&:hover fieldset': {
                borderColor: '#444',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#666',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              height: '100% !important',
            }
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          backgroundColor: '#1a1a1a',
          padding: '0 20px'
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ 
            height: 'fit-content',
            px: 4,
            py: 1,
            borderColor: '#666',
            color: 'white',
            '&:hover': {
              borderColor: '#888',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'SEND'}
        </Button>
      </Box>
      <Box sx={{ 
        width: '45%',
        height: '90%',
        border: '1px solid #333',
        borderRadius: '8px',
        p: 3,
        backgroundColor: '#242424',
        overflowY: 'auto'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ color: '#fff' }}>Grok Response</Typography>
          {messages.some(m => m.role === 'assistant') && (
            <Tooltip title="Copy Response">
              <IconButton 
                onClick={() => handleCopy(messages.find(m => m.role === 'assistant')?.content || '')}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box sx={{ 
          height: 'calc(100% - 40px)',
          overflowY: 'auto',
          '& pre': {
            backgroundColor: '#2a2a2a',
            borderRadius: '4px',
            padding: '8px'
          }
        }}>
          {messages.map((message, index) => (
            message.role === 'assistant' && (
              <MessageContent key={index} content={message.content} />
            )
          ))}
        </Box>
      </Box>
      <Snackbar 
        open={copySuccess} 
        autoHideDuration={2000} 
        onClose={handleCloseCopyAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopyAlert} severity="success" sx={{ width: '100%' }}>
          Response copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Chat;
