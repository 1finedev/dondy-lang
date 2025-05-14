import { Box } from '@mui/material';
import ChatHeader from './components/ChatHeader';
import ChatInputBox from './components/ChatInputBox';
import ChatMessageList from './components/ChatMessageList';

function App() {
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
      <ChatInputBox />
    </Box>
  );
}

export default App;
