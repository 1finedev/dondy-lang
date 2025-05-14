import { Box } from '@mui/material';
import ChatHeader from './ChatHeader';
import ChatInputBox from './ChatInputBox';
import ChatMessageList from './ChatMessageList';

const Chat = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <ChatHeader />
      <ChatMessageList />
      <ChatInputBox />
    </Box>
  );
};

export default Chat;
