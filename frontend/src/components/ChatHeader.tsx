import ChatIcon from '@mui/icons-material/Chat';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';

const ChatHeader = () => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center">
          <ChatIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography
            variant="h6"
            component="h1"
            sx={{ color: 'text.primary', fontWeight: 500 }}
          >
            Dondy Support
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;
