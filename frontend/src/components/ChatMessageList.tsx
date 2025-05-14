import { EventTypes, useChatStore } from '@/store/useChatStore';
import { Box, Paper, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import TypingIndicator from './TypingIndicator';

const ChatMessageList = () => {
  const { messages, isLoading, currentStream } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change or typing indicator appears/disappears
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        flex: 1,
        maxWidth: { xs: '90vw', sm: '60vw' },
        minWidth: { xs: '90vw', sm: '60vw' },
        marginX: 'auto',
        overflowY: 'auto',
        backgroundColor: 'background.default',
        p: 2,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
        {messages.map((message) => (
          <Box
            key={message?._id}
            sx={{
              display: 'flex',
              justifyContent:
                message?.event === EventTypes.USER_PROMPT
                  ? 'flex-end'
                  : 'flex-start',
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                maxWidth: { xs: '90%', sm: '80%' },
                backgroundColor:
                  message?.event === EventTypes.USER_PROMPT
                    ? 'rgb(248, 240, 255)'
                    : 'rgb(240, 244, 255)',
                px: 2,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {message?.content
                  .split(/\b(https?:\/\/\S+)\b/)
                  .map((part, index) =>
                    part.match(/^https?:\/\//) ? (
                      <Typography
                        key={index}
                        component="a"
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.dark'
                          }
                        }}
                      >
                        {part}
                      </Typography>
                    ) : (
                      <span key={index}>{part}</span>
                    )
                  )}
              </Typography>
            </Paper>
          </Box>
        ))}
        {isLoading ? (
          <TypingIndicator />
        ) : currentStream.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                animation: 'fadeIn 0.3s ease-in-out'
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  maxWidth: { xs: '90%', sm: '80%' },
                  backgroundColor: 'rgb(240, 244, 255)',
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {currentStream}
                </Typography>
              </Paper>
            </Box>
          </Box>
        ) : null}
        <div ref={messagesEndRef} />
      </Box>
    </Box>
  );
};

export default ChatMessageList;
