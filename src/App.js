import React, { useState } from 'react';
import { 
  Container, 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import Chat from './components/Chat';
import DocumentQA from './components/DocumentQA';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        overflow: 'hidden'
      }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            color: '#fff',
            '&.Mui-selected': {
              color: '#90caf9'
            }
          }
        }}>
          <Tab label="Chat" />
          <Tab label="Document Q&A" />
        </Tabs>
        <Box sx={{ height: 'calc(100vh - 48px)' }}>
          {activeTab === 0 ? <Chat /> : <DocumentQA />}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
