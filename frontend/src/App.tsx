import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatHeader from './components/ChatHeader';
import ChatInputBox from './components/ChatInputBox';
import ChatMessageList from './components/ChatMessageList';
import { useChatStore } from './store/useChatStore';

function App() {
  const { initializeSocket, fetchSessionMessages } = useChatStore();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    // Initialize socket with sessionId if available
    initializeSocket();
    if (sessionId) {
      fetchSessionMessages(sessionId);
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100dvh',
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <ChatHeader />
      <ChatMessageList />
      {!sessionId && <ChatInputBox />}
    </Box>
  );
}

export default App;
