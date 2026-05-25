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
               LOGIN
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
          
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                label="Remember me"
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
                Forgot password?
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
              {'>_ LOG IN'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

export default Login;
