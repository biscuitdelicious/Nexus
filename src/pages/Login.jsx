import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Fade, IconButton, InputAdornment, Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TerminalIcon from '@mui/icons-material/Terminal';
import { loginUser, signupUser } from '../services/authApi';
import { USE_MOCK_API } from '../services/apiConfig';

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (loading) return;
    setError('');
    setInfo('');
    if (!email || !password) {
      setError('Email and password required');
      return;
    }
    if (!isSignup && USE_MOCK_API) {
      onLogin?.({
        email: email.trim(),
        user_id: 1,
        demo: true,
        first_name: email.trim().split('@')[0] || 'Operator',
      });
      return;
    }
    if (isSignup) {
      if (!firstName.trim()) {
        setError('First name required');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    setLoading(true);
    try {
      if (isSignup) {
        await signupUser(email, password, firstName.trim(), lastName.trim());
        setMode('login');
        setPassword('');
        setFirstName('');
        setLastName('');
        setInfo('Account created. Please sign in.');
      } else {
        const user = await loginUser(email, password);
        onLogin?.(user);
      }
    } catch (err) {
      setError(err?.message || (isSignup ? 'Signup failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    mt: 2,
    '& .MuiInputBase-root': {
      bgcolor: '#0A0A0A',
      borderRadius: 0,
      border: '1px solid #2A2A2A',
      color: '#EAEAEA',
      fontFamily: '"Roboto Mono", monospace',
      fontSize: '0.85rem',
      px: 1.5,
      py: 0.5,
      transition: 'border-color 0.15s',
      '&:hover': { borderColor: '#444' },
      '&.Mui-focused': { borderColor: '#D4FF00' }
    },
    '& .MuiInputBase-input': {
      padding: '10px 4px'
    },
    '& .MuiFormLabel-root': {
      color: '#888',
      fontFamily: '"Roboto Mono", monospace',
      fontSize: '0.75rem',
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      transform: 'none',
      position: 'static',
      mb: 0.5,
      pointerEvents: 'auto'
    },
    '& .MuiFormLabel-root.Mui-focused': { color: '#D4FF00' }
  };

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100vw',
          px: 2,
          position: 'fixed',
          top: 0,
          left: 0,
          bgcolor: '#232323',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
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
            <LockOutlinedIcon sx={{ color: '#D4FF00', fontSize: 28 }} />
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
               {isSignup ? 'SIGN UP' : 'LOGIN'}
            </Typography>
          </Box>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 0,
            bgcolor: '#141414',
            borderColor: '#2A2A2A',
            p: 0,
            overflow: 'hidden'
          }}
        >
          
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {isSignup && (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  fullWidth
                  variant="standard"
                  label="First name"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#666', fontSize: 18 }} />
                      </InputAdornment>
                    )
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  variant="standard"
                  label="Last name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
              </Box>
            )}

            <TextField
              fullWidth
              variant="standard"
              label="Username or Email"
              placeholder="admin@nexus.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#666', fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />

            <TextField
              fullWidth
              variant="standard"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon sx={{ color: '#666', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      sx={{ color: '#666', borderRadius: 0, '&:hover': { color: '#D4FF00', bgcolor: 'transparent' } }}
                    >
                      {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />

            {error && (
              <Alert
                severity="error"
                sx={{
                  bgcolor: 'rgba(255,0,60,0.08)',
                  color: '#FF003C',
                  border: '1px solid #FF003C',
                  borderRadius: 0,
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  '& .MuiAlert-icon': { color: '#FF003C' }
                }}
              >
                {error}
              </Alert>
            )}

            {info && (
              <Alert
                severity="success"
                sx={{
                  bgcolor: 'rgba(212,255,0,0.08)',
                  color: '#D4FF00',
                  border: '1px solid #D4FF00',
                  borderRadius: 0,
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  '& .MuiAlert-icon': { color: '#D4FF00' }
                }}
              >
                {info}
              </Alert>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disableElevation
              disabled={loading}
              sx={{
                mt: 1,
                bgcolor: '#D4FF00',
                color: '#000',
                borderRadius: 0,
                py: 1.25,
                fontFamily: '"Roboto Mono", monospace',
                fontWeight: 700,
                letterSpacing: '2px',
                fontSize: '0.8rem',
                '&:hover': { bgcolor: '#b8de00' }
              }}
            >
              {loading
                ? (isSignup ? 'CREATING ACCOUNT...' : 'AUTHENTICATING...')
                : (isSignup ? '>_ CREATE ACCOUNT' : '>_ LOG IN')}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
              <Typography
                onClick={toggleMode}
                sx={{
                  color: '#888',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  '&:hover': { color: '#D4FF00' }
                }}
              >
                {isSignup
                  ? 'Already have account? Sign in'
                  : "Don't have account? Sign up"}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

export default Login;
