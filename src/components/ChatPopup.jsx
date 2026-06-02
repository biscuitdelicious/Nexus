import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Avatar, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import {
  getChatSessionId,
  sendChatMessage,
  resetChatSession
} from '../services/chatApi';
import { COLORS } from '../theme/colors';

const TYPEWRITER_DELAY_MS = 35;

const tokenizeForStream = (text) => text.match(/\S+\s*/g) || [];

const buildBotMessage = (text, { stream = true } = {}) => {
  const tokens = tokenizeForStream(text);
  return {
    text,
    isBot: true,
    tokens,
    revealed: stream ? 0 : tokens.length,
    streaming: stream && tokens.length > 0
  };
};

const initialBotMessage = () =>
  buildBotMessage('How can I help you?', { stream: true });

const ChatPopup = ({ apiBaseUrl = 'http://127.0.0.1:8001', onExpand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => [initialBotMessage()]);

  const sessionId = useMemo(() => getChatSessionId(), []);

  useEffect(() => {
    let streamingIdx = -1;
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      if (chatHistory[i].streaming) {
        streamingIdx = i;
        break;
      }
    }
    if (streamingIdx === -1) return undefined;
    const msg = chatHistory[streamingIdx];
    if (msg.revealed >= msg.tokens.length) {
      setChatHistory((prev) =>
        prev.map((m, i) => (i === streamingIdx ? { ...m, streaming: false } : m))
      );
      return undefined;
    }
    const timer = setTimeout(() => {
      setChatHistory((prev) =>
        prev.map((m, i) => (i === streamingIdx ? { ...m, revealed: m.revealed + 1 } : m))
      );
    }, TYPEWRITER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (isSending) return;
    if (!message.trim()) return;

    const userMessage = message.trim();
    setChatHistory((prev) => [...prev, { text: userMessage, isBot: false }]);
    setMessage('');
    setIsSending(true);

    try {
      const data = await sendChatMessage(apiBaseUrl, userMessage, sessionId);
      setChatHistory((prev) => [
        ...prev,
        buildBotMessage(data.response || 'No response received.')
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        buildBotMessage(`Backend connection error (${error.message}).`)
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggle = async () => {
    if (isOpen) {
      setChatHistory([initialBotMessage()]);
      try {
        await resetChatSession(apiBaseUrl, sessionId);
      } catch (_error) {
        // ignore
      }
    }
    setIsOpen((prev) => !prev);
  };

  const handleExpand = () => {
    setIsOpen(false);
    onExpand?.();
  };

  return (
    <>
      {isOpen && (
        <Box sx={{ position: 'fixed', bottom: 100, right: 30, zIndex: 9999 }}>
          <Paper
            elevation={0}
            sx={{
              width: 350,
              height: 500,
              minWidth: 280,
              minHeight: 400,
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: COLORS.surface,
              border: `1px solid ${COLORS.info}`,
              borderRadius: 0,
              overflow: 'hidden',
              resize: 'both',
              boxShadow: '0 0 20px rgba(88, 166, 255, 0.2)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '15px',
                height: '15px',
                cursor: 'nwse-resize',
                background: `linear-gradient(135deg, transparent 50%, ${COLORS.info} 50%)`
              }
            }}
          >
            <Box sx={{ p: 2, bgcolor: COLORS.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: COLORS.info, width: 32, height: 32, borderRadius: 0 }}>
                  <SmartToyIcon sx={{ color: COLORS.bg, fontSize: '1.2rem' }} />
                </Avatar>
                <Box>
                  <Typography sx={{ color: COLORS.text, fontSize: '0.9rem', fontWeight: 700, fontFamily: '"Roboto Mono", monospace', letterSpacing: '1px' }}>
                    NEXUS BOT
                  </Typography>
                  <Typography sx={{ color: COLORS.info, fontSize: '0.65rem', fontFamily: '"Roboto Mono", monospace', letterSpacing: '2px' }}>
                    ONLINE
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {onExpand && (
                  <Tooltip title="Open full screen" placement="bottom">
                    <IconButton
                      size="small"
                      onClick={handleExpand}
                      sx={{ color: COLORS.textMuted, borderRadius: 0, '&:hover': { color: COLORS.info, bgcolor: 'transparent' } }}
                    >
                      <OpenInFullIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton size="small" onClick={handleToggle} sx={{ color: COLORS.textMuted, borderRadius: 0, '&:hover': { color: COLORS.info, bgcolor: 'transparent' } }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: COLORS.border } }}>
              {chatHistory.map((msg, index) => (
                <Box key={index} sx={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                  {msg.isBot ? (
                    <Box sx={{ p: 0, bgcolor: 'transparent' }}>
                      <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.45, fontFamily: '"Roboto Mono", monospace', whiteSpace: 'pre-wrap', color: COLORS.text }}>
                        {msg.tokens ? msg.tokens.slice(0, msg.revealed).join('') : msg.text}
                        {msg.streaming && (
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-block',
                              width: '7px',
                              height: '0.95em',
                              ml: '2px',
                              bgcolor: COLORS.info,
                              verticalAlign: 'text-bottom'
                            }}
                          />
                        )}
                      </Typography>
                    </Box>
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor: COLORS.info,
                        color: COLORS.bg,
                        borderRadius: 0,
                        border: 'none'
                      }}
                    >
                      <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.4, fontFamily: '"Roboto Mono", monospace', whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              ))}
            </Box>

            <Box sx={{ p: 2, bgcolor: COLORS.surface, borderTop: `1px solid ${COLORS.border}` }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder={isSending ? '> Processing...' : '> Type a message...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isSending}
                  InputProps={{
                    disableUnderline: true,
                    sx: { color: COLORS.info, fontSize: '0.85rem', fontFamily: '"Roboto Mono", monospace', bgcolor: COLORS.surface, p: '8px 12px', borderRadius: 0, border: `1px solid ${COLORS.border}` }
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={isSending}
                  sx={{
                    bgcolor: COLORS.info,
                    color: COLORS.bg,
                    '&:hover': { bgcolor: COLORS.info },
                    borderRadius: 0,
                    width: 40,
                    height: 40
                  }}
                >
                  <SendIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      <Box
        onClick={handleToggle}
        sx={{
          position: 'fixed',
          bottom: 30,
          right: isOpen ? 30 : -25,
          width: 65,
          height: 60,
          bgcolor: COLORS.surface,
          border: `1px solid ${COLORS.info}`,
          borderRight: isOpen ? `1px solid ${COLORS.info}` : 'none',
          borderRadius: isOpen ? 0 : '10px 0 0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'center' : 'flex-start',
          pl: isOpen ? 0 : 1.5,
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: isOpen ? '0 0 15px rgba(88, 166, 255, 0.25)' : '-4px 4px 15px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
          '&:hover': {
            right: 0,
            bgcolor: COLORS.surface,
            boxShadow: '0 0 15px rgba(88, 166, 255, 0.5)'
          }
        }}
      >
        {isOpen ? (
          <CloseIcon sx={{ color: COLORS.info, fontSize: 28 }} />
        ) : (
          <SmartToyIcon sx={{ color: COLORS.info, fontSize: 32 }} />
        )}
      </Box>

    </>
  );
};

export default ChatPopup;
