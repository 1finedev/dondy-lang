import { useChatStore } from '@/store/useChatStore';
import ChatIcon from '@mui/icons-material/Chat';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ChatHeader = () => {
  const navigate = useNavigate();
  const { restartSession } = useChatStore();

  const handleRestart = () => {
    restartSession();
    navigate(`/`);
  };

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
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box
          display="flex"
          alignItems="center"
          sx={{
            cursor: 'pointer'
          }}
          onClick={handleRestart}
        >
          <ChatIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography
            variant="h6"
            component="h1"
            sx={{ color: 'text.primary', fontWeight: 500 }}
          >
            Dondy Support
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          sx={{
            ml: 2,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              color: 'white',
              backgroundColor: 'primary.light'
            }
          }}
          onClick={() => navigate(`/admin`)}
        >
          View All Leads
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;
