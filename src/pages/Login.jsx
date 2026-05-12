import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Divider, Fade, IconButton, InputAdornment, Checkbox, FormControlLabel
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TerminalIcon from '@mui/icons-material/Terminal';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fieldSx = {
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
      color: '#666',
      fontFamily: '"Roboto Mono", monospace',
      fontSize: '0.7rem',
      letterSpacing: '1.5px',
      textTransform: 'uppercase'
    },
    '& .MuiFormLabel-root.Mui-focused': { color: '#D4FF00' }
  };

  return (
    <Fade in timeout={600}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', px: 2 }}>
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
              Operator Login
            </Typography>
            <Typography
              sx={{
                color: '#888',
                fontFamily: '"Roboto Mono", monospace',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Authenticate to access Nexus control plane.
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
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: '#0A0A0A',
              borderBottom: '1px solid #2A2A2A',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <TerminalIcon sx={{ color: '#D4FF00', fontSize: 16 }} />
            <Typography
              sx={{
                color: '#FFF',
                fontFamily: '"Roboto Mono", monospace',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '1.5px'
              }}
            >
              SESSION_AUTH
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 6, height: 6, bgcolor: '#FF003C', boxShadow: '0 0 6px #FF003C' }} />
              <Typography sx={{ color: '#FF003C', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', letterSpacing: '2px' }}>
                LOCKED
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              variant="standard"
              label="Operator ID"
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
              sx={fieldSx}
            />

            <TextField
              fullWidth
              variant="standard"
              label="Access Key"
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
              sx={fieldSx}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    sx={{
                      color: '#444',
                      borderRadius: 0,
                      '&.Mui-checked': { color: '#D4FF00' }
                    }}
                  />
                }
                label="Keep session"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    color: '#888',
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.7rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }
                }}
              />
              <Typography
                component="a"
                sx={{
                  color: '#666',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  '&:hover': { color: '#D4FF00' }
                }}
              >
                Reset Key
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              disableElevation
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
              {'>_ AUTHENTICATE'}
            </Button>

            <Divider sx={{ borderColor: '#2A2A2A', my: 0.5 }}>
              <Typography sx={{ color: '#444', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', letterSpacing: '2px', px: 1 }}>
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                bgcolor: 'transparent',
                color: '#888',
                borderRadius: 0,
                borderColor: '#2A2A2A',
                py: 1.25,
                fontFamily: '"Roboto Mono", monospace',
                fontWeight: 700,
                letterSpacing: '2px',
                fontSize: '0.75rem',
                '&:hover': { borderColor: '#D4FF00', color: '#D4FF00', bgcolor: 'rgba(212,255,0,0.04)' }
              }}
            >
              SSO / IDP PROVIDER
            </Button>
          </Box>

          <Box
            sx={{
              px: 2.5,
              py: 1.25,
              bgcolor: '#0A0A0A',
              borderTop: '1px solid #2A2A2A',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography sx={{ color: '#555', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', letterSpacing: '1.5px' }}>
              v0.1.0 · MOCK
            </Typography>
            <Typography sx={{ color: '#555', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', letterSpacing: '1.5px' }}>
              No request to backend
            </Typography>
          </Box>
        </Paper>

        <Typography
          sx={{
            mt: 3,
            color: '#555',
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '0.7rem',
            letterSpacing: '1px',
            textAlign: 'center'
          }}
        >
          Request access from the NOC admin if you do not have credentials.
        </Typography>
      </Box>
    </Fade>
  );
};

export default Login;
