import SendIcon from '@mui/icons-material/Send';
import { Box, IconButton, Paper, TextField } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';

const ChatInputBox = () => {
  const {
    inputValue,
    setInputValue,
    sendMessage,
    connectionStatus,
    isLoading
  } = useChatStore();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoading) return;
    inputRef.current?.focus();
  }, [isLoading]);

  return (
    <Paper
      elevation={0}
      sx={{
        borderTop: '1px solid',
        borderColor: 'grey.200',
        p: 2,
        backgroundColor: 'white'
      }}
    >
      <Box
        component="form"
        onSubmit={sendMessage}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          maxWidth: { xs: '90vw', sm: '60vw' },
          minWidth: { xs: '90vw', sm: '60vw' },
          marginX: 'auto'
        }}
      >
        <Box
          sx={{
            mx: 'auto',
            position: 'relative',
            flexGrow: 1,
            cursor: connectionStatus !== 'connected' ? 'not-allowed' : 'auto'
          }}
        >
          <TextField
            inputRef={inputRef}
            fullWidth
            disabled={connectionStatus !== 'connected' || isLoading}
            placeholder={
              connectionStatus !== 'connected'
                ? `${connectionStatus}...`
                : 'Send a response...'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              sx: {
                borderRadius: 28,
                '&.MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2
                  }
                }
              }
            }}
          />
        </Box>
        <IconButton
          type="submit"
          color="primary"
          disabled={connectionStatus !== 'connected' || isLoading}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: 'primary.light'
            },
            width: 40,
            height: 40,
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatInputBox;
