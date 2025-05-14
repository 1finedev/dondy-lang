import { Box, keyframes } from '@mui/material';

const typingAnimation = keyframes`
  0%, 80%, 100% { 
    transform: scale(0.6); 
  }
  40% { 
    transform: scale(1.0); 
  }
`;

const TypingIndicator = () => {
  return (
    <Box
      sx={{
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'inline-block',
        maxWidth: '80%',
        animation: 'fadeIn 0.3s ease-in-out'
      }}
    >
      <Box sx={{ display: 'flex', gap: '4px' }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            component="span"
            sx={{
              width: '8px',
              height: '8px',
              backgroundColor: 'primary.main',
              opacity: 0.7,
              borderRadius: '50%',
              display: 'inline-block',
              animation: `${typingAnimation} 1.4s infinite ease-in-out`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TypingIndicator;
