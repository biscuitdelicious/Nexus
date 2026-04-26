import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  Fade,
  CircularProgress
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PersonIcon from '@mui/icons-material/Person';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import {
  getChatApiBaseUrl,
  getChatSessionId,
  sendChatMessage,
  resetChatSession
} from '../services/chatApi.jsx';

const TYPEWRITER_DELAY_MS = 35;

const tokenizeForStream = (text) => text.match(/\S+\s*/g) || [];

const buildBotMessage = (text, { stream = true } = {}) => {
  const tokens = tokenizeForStream(text);
  return {
    text,
    isBot: true,
    timestamp: new Date(),
    tokens,
    revealed: stream ? 0 : tokens.length,
    streaming: stream && tokens.length > 0
  };
};

const initialBotMessage = () =>
  buildBotMessage('Nexus assistant ready. How can I help you today?', { stream: true });

const PROMPT_LIBRARY = [
  { label: 'DB SCHEMA', prompt: 'Describe the database schema briefly.' },
  { label: 'LATEST READING', prompt: 'Show me the latest sensor reading for sensor 1.' },
  { label: 'AVG TEMP 24H', prompt: 'What is the average temperature in the last 24 hours?' },
  { label: 'AVG TEMP 1H', prompt: 'What is the average temperature in the last hour?' },
  { label: 'RECENT ALARMS', prompt: 'List the 5 most recent alarms.' },
  { label: 'TOP DEVICES', prompt: 'Top 5 devices with the most incidents.' },
  { label: 'OPEN INCIDENTS', prompt: 'How many active incidents are there right now?' },
  { label: 'CRITICAL 24H', prompt: 'How many critical incidents occurred in the last 24 hours?' },
  { label: 'OPEN TICKETS', prompt: 'Show open tickets sorted by severity.' },
  { label: 'CPU LOAD', prompt: 'What is the current CPU load average?' },
  { label: 'MEMORY USAGE', prompt: 'What is the current memory allocation?' },
  { label: 'BY SEVERITY', prompt: 'Count incidents grouped by severity.' },
  { label: 'BY DEVICE', prompt: 'Count incidents grouped by device.' },
  { label: 'RESOLVED TODAY', prompt: 'Show tickets resolved today.' },
  { label: 'UNRESOLVED HIGH', prompt: 'List all unresolved high severity incidents.' },
  { label: 'AVG RESOLUTION', prompt: 'Average ticket resolution time per severity level.' },
  { label: 'TEMP TREND 6H', prompt: 'Show the temperature trend for the last 6 hours.' },
  { label: 'OFFLINE DEVICES', prompt: 'Find devices that are currently offline.' },
  { label: 'PEAK TODAY', prompt: 'What was the peak temperature today?' },
  { label: 'LOWEST TODAY', prompt: 'What was the lowest temperature today?' },
  { label: 'COMPARE DAYS', prompt: 'Compare today average temperature with yesterday.' },
  { label: 'OVER THRESHOLD', prompt: 'List sensors that exceeded the critical threshold today.' },
  { label: 'SENSOR LIST', prompt: 'List all configured sensors with their last reading.' },
  { label: 'EVENTS HOUR', prompt: 'How many events happened in the last hour?' }
];

const DEFAULT_QUICK_ACTIONS = PROMPT_LIBRARY.slice(0, 5);

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'and', 'or',
  'me', 'my', 'i', 'you', 'your', 'show', 'tell', 'give', 'list', 'find',
  'what', 'which', 'who', 'how', 'why', 'when', 'do', 'does', 'did', 'can',
  'could', 'would', 'should', 'will', 'shall', 'may', 'might', 'about',
  'please'
]);

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const meaningfulTokens = (text) => tokenize(text).filter((t) => !STOP_WORDS.has(t));

const scorePrompt = (input, prompt) => {
  if (!input.trim()) return 0;
  const inputLower = input.toLowerCase();
  const promptLower = prompt.toLowerCase();

  let score = 0;
  if (promptLower.startsWith(inputLower)) score += 100;

  const inputTokens = meaningfulTokens(input);
  const promptTokens = tokenize(prompt);
  const promptTokenSet = new Set(promptTokens);

  for (const it of inputTokens) {
    if (promptTokenSet.has(it)) {
      score += 10;
      continue;
    }
    for (const pt of promptTokens) {
      if (pt.startsWith(it) && it.length >= 3) {
        score += 6;
        break;
      }
      if (pt.includes(it) && it.length >= 4) {
        score += 3;
        break;
      }
    }
  }
  return score;
};

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const Chatbot = () => {
  const apiBaseUrl = getChatApiBaseUrl();
  const sessionId = useMemo(() => getChatSessionId(), []);

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => [initialBotMessage()]);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isSending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const tokenCount = useMemo(() => tokenize(message).length, [message]);

  const ranked = useMemo(() => {
    const trimmed = message.trim();
    if (!trimmed) return [];
    return PROMPT_LIBRARY
      .map((p) => ({ ...p, score: scorePrompt(trimmed, p.prompt) }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [message]);

  const dynamicQuickActions = ranked.length > 0 ? ranked.slice(0, 6) : DEFAULT_QUICK_ACTIONS;

  const ghostSuggestion = useMemo(() => {
    if (tokenCount < 2) return '';
    const trimmedLower = message.toLowerCase();
    const match = ranked.find((p) => p.prompt.toLowerCase().startsWith(trimmedLower));
    if (!match) return '';
    return match.prompt.slice(message.length);
  }, [ranked, message, tokenCount]);

  const submitPrompt = async (prompt) => {
    const trimmed = prompt.trim();
    if (!trimmed || isSending) return;

    const userEntry = { text: trimmed, isBot: false, timestamp: new Date() };
    setChatHistory((prev) => [...prev, userEntry]);
    setMessage('');
    setIsSending(true);

    try {
      const data = await sendChatMessage(apiBaseUrl, trimmed, sessionId);
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
      inputRef.current?.focus();
    }
  };

  const handleSend = () => submitPrompt(message);

  const handleReset = async () => {
    setChatHistory([initialBotMessage()]);
    try {
      await resetChatSession(apiBaseUrl, sessionId);
    } catch (_error) {
      // ignore
    }
    inputRef.current?.focus();
  };

  const acceptGhost = () => {
    if (!ghostSuggestion) return false;
    setMessage(message + ghostSuggestion);
    return true;
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghostSuggestion) {
      const isRight = e.key === 'ArrowRight';
      const caretAtEnd = e.target.selectionStart === message.length;
      if (isRight && !caretAtEnd) return;
      e.preventDefault();
      acceptGhost();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Fade in timeout={600}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1.5,
                borderRadius: 0,
                background: '#141414',
                border: '1px solid #2A2A2A'
              }}
            >
              <SmartToyIcon sx={{ color: '#D4FF00', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: '#FFFFFF',
                  fontFamily: '"Georgia", serif',
                  fontStyle: 'italic',
                  fontWeight: 'normal'
                }}
              >
                Nexus Assistant
              </Typography>
              <Typography
                sx={{
                  color: '#888888',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Conversational AI for telemetry, incidents and database insights.
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Reset conversation" placement="left">
            <span>
              <IconButton
                onClick={handleReset}
                disabled={isSending}
                sx={{
                  borderRadius: 0,
                  border: '1px solid #2A2A2A',
                  color: '#888',
                  width: 44,
                  height: 44,
                  '&:hover': { color: '#D4FF00', borderColor: '#D4FF00', bgcolor: 'rgba(212,255,0,0.05)' }
                }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0A0A0A',
            border: '1px solid #2A2A2A',
            borderRadius: 0,
            overflow: 'hidden',
            minHeight: 0
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: '#141414',
              borderBottom: '1px solid #2A2A2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: '#D4FF00',
                  boxShadow: '0 0 8px #D4FF00',
                  animation: 'pulse 2s infinite'
                }}
              />
              <Typography
                sx={{
                  color: '#fff',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '1.5px'
                }}
              >
                NEXUS_BOT
              </Typography>
              <Typography
                sx={{
                  color: '#D4FF00',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '2px'
                }}
              >
                ONLINE
              </Typography>
            </Box>
            <Typography
              sx={{
                color: '#666',
                fontFamily: '"Roboto Mono", monospace',
                fontSize: '0.65rem',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              session :: {sessionId.slice(-8)}
            </Typography>
          </Box>

          <Box
            ref={scrollRef}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              px: { xs: 2, md: 4 },
              py: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              minHeight: 0,
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#2A2A2A' },
              '&::-webkit-scrollbar-thumb:hover': { bgcolor: '#D4FF00' }
            }}
          >
            {chatHistory.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  flexDirection: msg.isBot ? 'row' : 'row-reverse',
                  alignItems: 'flex-start',
                  gap: 1.5
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 0,
                    bgcolor: msg.isBot ? '#141414' : '#D4FF00',
                    border: msg.isBot ? '1px solid #2A2A2A' : 'none',
                    color: msg.isBot ? '#D4FF00' : '#000'
                  }}
                >
                  {msg.isBot ? (
                    <SmartToyIcon sx={{ fontSize: '1rem' }} />
                  ) : (
                    <PersonIcon sx={{ fontSize: '1rem' }} />
                  )}
                </Avatar>

                <Box sx={{ maxWidth: { xs: '85%', md: '70%' } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: msg.isBot ? 'row' : 'row-reverse',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5
                    }}
                  >
                    <Typography
                      sx={{
                        color: msg.isBot ? '#D4FF00' : '#888',
                        fontFamily: '"Roboto Mono", monospace',
                        fontSize: '0.65rem',
                        letterSpacing: '1.5px',
                        fontWeight: 700
                      }}
                    >
                      {msg.isBot ? 'NEXUS' : 'YOU'}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#555',
                        fontFamily: '"Roboto Mono", monospace',
                        fontSize: '0.6rem'
                      }}
                    >
                      {formatTime(msg.timestamp || new Date())}
                    </Typography>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.75,
                      bgcolor: msg.isBot ? '#141414' : '#D4FF00',
                      color: msg.isBot ? '#EAEAEA' : '#000',
                      borderRadius: 0,
                      border: msg.isBot ? '1px solid #2A2A2A' : 'none',
                      borderLeft: msg.isBot ? '2px solid #D4FF00' : 'none'
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        lineHeight: 1.55,
                        fontFamily: '"Roboto Mono", monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.isBot && msg.tokens
                        ? msg.tokens.slice(0, msg.revealed).join('')
                        : msg.text}
                      {msg.isBot && msg.streaming && (
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            width: '8px',
                            height: '1em',
                            ml: '2px',
                            bgcolor: '#D4FF00',
                            verticalAlign: 'text-bottom',
                            animation: 'cursorBlink 1s steps(2) infinite'
                          }}
                        />
                      )}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}

            {isSending && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 0,
                    bgcolor: '#141414',
                    border: '1px solid #2A2A2A',
                    color: '#D4FF00'
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: '1rem' }} />
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: '#141414',
                    border: '1px solid #2A2A2A',
                    borderLeft: '2px solid #D4FF00',
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CircularProgress size={12} sx={{ color: '#D4FF00' }} />
                  <Typography
                    sx={{
                      color: '#888',
                      fontFamily: '"Roboto Mono", monospace',
                      fontSize: '0.75rem',
                      letterSpacing: '1px'
                    }}
                  >
                    PROCESSING...
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              px: { xs: 2, md: 3 },
              pt: 1.5,
              pb: 1,
              borderTop: '1px solid #2A2A2A',
              bgcolor: '#0A0A0A',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
              <BoltIcon sx={{ color: '#D4FF00', fontSize: 14 }} />
              <Typography
                sx={{
                  color: '#666',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '1.5px'
                }}
              >
                {ranked.length > 0 ? 'SUGGESTED' : 'QUICK START'}
              </Typography>
            </Box>
            {dynamicQuickActions.map((action) => (
              <Tooltip key={action.label + action.prompt} title={action.prompt} placement="top">
                <Chip
                  label={action.label}
                  size="small"
                  onClick={() => submitPrompt(action.prompt)}
                  disabled={isSending}
                  sx={{
                    borderRadius: 0,
                    bgcolor: 'transparent',
                    color: '#888',
                    border: '1px solid #2A2A2A',
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '1px',
                    height: 24,
                    '&:hover': {
                      bgcolor: 'rgba(212,255,0,0.05)',
                      color: '#D4FF00',
                      borderColor: '#D4FF00'
                    }
                  }}
                />
              </Tooltip>
            ))}
          </Box>

          {ghostSuggestion && (
            <Box
              sx={{
                px: { xs: 2, md: 3 },
                pb: 0.75,
                bgcolor: '#0A0A0A',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <KeyboardReturnIcon sx={{ color: '#D4FF00', fontSize: 14, transform: 'rotate(180deg)' }} />
              <Typography
                sx={{
                  color: '#666',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '1px'
                }}
              >
                <Box component="span" sx={{ color: '#D4FF00' }}>TAB</Box>
                {' to autocomplete: '}
                <Box component="span" sx={{ color: '#aaa' }}>{message}</Box>
                <Box component="span" sx={{ color: '#D4FF00' }}>{ghostSuggestion}</Box>
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              p: 2,
              bgcolor: '#141414',
              borderTop: '1px solid #2A2A2A',
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-end'
            }}
          >
            <Box sx={{ position: 'relative', flexGrow: 1 }}>
              <TextField
                inputRef={inputRef}
                fullWidth
                multiline
                maxRows={4}
                variant="standard"
                placeholder={isSending ? 'Processing...' : 'Ask anything...   (Enter sends, Shift+Enter newline, Tab accepts suggestion)'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: '#D4FF00',
                    fontSize: '0.9rem',
                    fontFamily: '"Roboto Mono", monospace',
                    bgcolor: '#0A0A0A',
                    p: '10px 14px',
                    borderRadius: 0,
                    border: '1px solid #2A2A2A',
                    '&:focus-within': { borderColor: '#D4FF00' }
                  }
                }}
              />
              {ghostSuggestion && (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    p: '10px 14px',
                    border: '1px solid transparent',
                    fontSize: '0.9rem',
                    fontFamily: '"Roboto Mono", monospace',
                    pointerEvents: 'none',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'transparent'
                  }}
                >
                  {message}
                  <Box component="span" sx={{ color: '#555' }}>{ghostSuggestion}</Box>
                </Box>
              )}
            </Box>
            <IconButton
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              sx={{
                bgcolor: '#D4FF00',
                color: '#000',
                borderRadius: 0,
                width: 48,
                height: 48,
                '&:hover': { bgcolor: '#b8de00' },
                '&.Mui-disabled': { bgcolor: '#2A2A2A', color: '#555' }
              }}
            >
              <SendIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          </Box>
        </Paper>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          @keyframes cursorBlink {
            50% { opacity: 0; }
          }
        `}</style>
      </Box>
    </Fade>
  );
};

export default Chatbot;