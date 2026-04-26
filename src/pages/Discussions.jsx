import React, { useState } from 'react';
import {
  Box, Typography, Paper, Avatar, TextField, Button,
  Chip, Divider, IconButton, Fade, Grid, List, ListItem, ListItemButton, ListItemText
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumIcon from '@mui/icons-material/Forum';

// --- MOCK DATA PENTRU TOATE ALARMELE ---
const mockIncidents = [
  {
    id: '#40',
    title: 'CPU Critical Temperature Threshold Exceeded',
    status: 'OPEN',
    author: 'nexus_system_daemon',
    createdAt: '3 days ago',
    device: 'DB-Server-Primary-01',
    description: `Alarma declanșată automat de sistemul de telemetrie.\n\nSenzorul termic a înregistrat o temperatură de **85.4°C** (Prag critic: 80.0°C) pe pachetul CPU.\n\n**Metrice recente:**\n- CPU Load: 98%\n- Mem Alocată: 14.2 GB / 16.0 GB\n- Fan Speed: 3200 RPM (Maxim)\n\nVă rugăm să investigați procesele care cauzează această încărcare. Dacă temperatura atinge 90°C, serverul va intra în modul de avarie (shut down) pentru a preveni daune fizice.`,
    comments: [
      { id: 1, author: 'mihai.admin', time: '2 days ago', text: 'Am verificat procesele. Se pare că un container de Docker (`data-indexer-v2`) a intrat într-un loop infinit și a blocat toate thread-urile. Am dat restart la container, dar temperatura încă scade foarte greu.', isSystem: false },
      { id: 2, author: 'NEXUS_SYSTEM', time: '1 day ago', text: 'SYSTEM LOG: Container `data-indexer-v2` restarted successfully by [mihai.admin]. CPU load dropped to 45%.', isSystem: true },
      { id: 3, author: 'victor.oncall', time: '12 hours ago', text: 'Temperatura a ajuns la 72°C. Încă e peste media normală de 65°C. Propun să verificăm dacă s-a acumulat praf pe heatsink sau dacă pasta termoconductoare trebuie schimbată la mentenanța de sâmbătă.', isSystem: false }
    ]
  },
  {
    id: '#39',
    title: 'High Latency on API Gateway',
    status: 'RESOLVED',
    author: 'mihai.admin',
    createdAt: '5 days ago',
    device: 'API-Gateway-02',
    description: `Timpul de răspuns pe API Gateway a depășit 2000ms pentru mai mult de 5 minute. Posibil atac DDoS sau un query greșit în baza de date.`,
    comments: [
      { id: 1, author: 'victor.oncall', time: '5 days ago', text: 'Am aplicat rate-limiting pe endpoint-ul de search. Timpul de răspuns a revenit la normal (sub 100ms).', isSystem: false }
    ]
  },
  {
    id: '#38',
    title: 'Memory Leak in Auth Service',
    status: 'OPEN',
    author: 'nexus_system_daemon',
    createdAt: '1 week ago',
    device: 'Auth-Node-01',
    description: `Serviciul de autentificare consumă 95% din memoria RAM disponibilă.`,
    comments: []
  }
];

const Discussions = () => {
  const [incidentsList, setIncidentsList] = useState(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState(null); // null = Arată Lista, altfel arată discuția
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedIncident) return;

    const comment = {
      id: Date.now(),
      author: 'current_user',
      time: 'just now',
      text: newComment,
      isSystem: false
    };

    const updatedIncident = {
      ...selectedIncident,
      comments: [...selectedIncident.comments, comment]
    };

    setSelectedIncident(updatedIncident);
    setIncidentsList(prev => prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc));
    setNewComment('');
  };

  const handleToggleStatus = () => {
    if (!selectedIncident) return;

    const updatedIncident = {
      ...selectedIncident,
      status: selectedIncident.status === 'OPEN' ? 'RESOLVED' : 'OPEN',
      comments: [
        ...selectedIncident.comments,
        {
          id: Date.now(),
          author: 'NEXUS_SYSTEM',
          time: 'just now',
          text: `Incident status changed to ${selectedIncident.status === 'OPEN' ? 'RESOLVED' : 'OPEN'} by [current_user].`,
          isSystem: true
        }
      ]
    };

    setSelectedIncident(updatedIncident);
    setIncidentsList(prev => prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc));
  };

  // VEDEREA 1: LISTA CU TOATE ALARMELE
  if (!selectedIncident) {
    return (
      <Fade in={true} timeout={600}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#FFF', fontFamily: '"Georgia", serif', fontStyle: 'italic', mb: 1 }}>
                Incident Discussions
              </Typography>
              <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
                Forum central pentru investigarea și documentarea alarmelor.
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#D4FF00', color: '#000', borderRadius: 0, fontFamily: '"Roboto Mono", monospace', fontWeight: 700,
                '&:hover': { bgcolor: '#b8de00' }
              }}
            >
              New Topic
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ bgcolor: '#141414', borderColor: '#2A2A2A', borderRadius: 0 }}>
            <List disablePadding>
              {incidentsList.map((inc, index) => (
                <React.Fragment key={inc.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => setSelectedIncident(inc)}
                      sx={{
                        p: 3,
                        transition: 'none',
                        '&:hover': { bgcolor: 'rgba(212, 255, 0, 0.03)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', width: '100%', gap: 3, alignItems: 'center' }}>
                        {inc.status === 'OPEN' ? <ErrorIcon sx={{ color: '#FF003C' }} /> : <CheckCircleIcon sx={{ color: '#D4FF00' }} />}

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                            {inc.title} <Typography component="span" sx={{ color: '#888', fontSize: '0.9rem' }}>{inc.id}</Typography>
                          </Typography>
                          <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>
                            Opened by <Box component="span" sx={{ color: '#D4FF00' }}>{inc.author}</Box> {inc.createdAt} on {inc.device}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ForumIcon sx={{ color: '#555', fontSize: 18 }} />
                          <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', fontWeight: 700 }}>
                            {inc.comments.length}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < incidentsList.length - 1 && <Divider sx={{ borderColor: '#2A2A2A' }} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Fade>
    );
  }

  // VEDEREA 2: DISCUȚIA PENTRU O ALARMĂ SPECIFICĂ
  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 5 }}>

        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelectedIncident(null)}
            sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', mb: 3, '&:hover': { color: '#D4FF00', bgcolor: 'transparent' } }}
          >
            Back to Discussions
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" sx={{ color: '#FFF', fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>
              {selectedIncident.title} <Typography component="span" variant="h4" sx={{ color: '#888', fontStyle: 'normal' }}>{selectedIncident.id}</Typography>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={selectedIncident.status === 'OPEN' ? <ErrorIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
              label={selectedIncident.status}
              sx={{
                borderRadius: 0,
                bgcolor: selectedIncident.status === 'OPEN' ? 'rgba(255, 0, 60, 0.1)' : 'rgba(212, 255, 0, 0.1)',
                color: selectedIncident.status === 'OPEN' ? '#FF003C' : '#D4FF00',
                border: `1px solid ${selectedIncident.status === 'OPEN' ? '#FF003C' : '#D4FF00'}`,
                fontFamily: '"Roboto Mono", monospace',
                fontWeight: 700,
                letterSpacing: '1px'
              }}
            />
            <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
              <Box component="span" sx={{ color: '#D4FF00', fontWeight: 700 }}>{selectedIncident.author}</Box> triggered this {selectedIncident.createdAt} · {selectedIncident.comments.length} comments
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#2A2A2A', mb: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={9}>

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Avatar sx={{ bgcolor: '#141414', border: '1px solid #2A2A2A', color: '#FF003C', borderRadius: 0, width: 40, height: 40 }}>
                <TimelineIcon />
              </Avatar>
              <Paper sx={{ flexGrow: 1, bgcolor: '#141414', border: '1px solid #2A2A2A', borderRadius: 0 }}>
                <Box sx={{ p: 1.5, borderBottom: '1px solid #2A2A2A', bgcolor: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                    <Box component="span" sx={{ color: '#FFF', fontWeight: 700 }}>{selectedIncident.author}</Box> reported {selectedIncident.createdAt}
                  </Typography>
                  <Chip label="AUTHOR" size="small" sx={{ borderRadius: 0, bgcolor: 'transparent', color: '#888', border: '1px solid #2A2A2A', fontSize: '0.65rem' }} />
                </Box>
                <Box sx={{ p: 3 }}>
                  <Typography sx={{ color: '#EAEAEA', fontFamily: '"Roboto Mono", monospace', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedIncident.description}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {selectedIncident.comments.map((comment) => (
              comment.isSystem ? (
                <Box key={comment.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, pl: 2, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: 22, top: -30, bottom: -10, width: '2px', bgcolor: '#2A2A2A', zIndex: 0 }} />
                  <SettingsIcon sx={{ color: '#888', fontSize: 20, zIndex: 1, bgcolor: '#0A0A0A' }} />
                  <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                    {comment.text} <Box component="span" sx={{ color: '#555', fontSize: '0.7rem' }}>— {comment.time}</Box>
                  </Typography>
                </Box>
              ) : (
                <Box key={comment.id} sx={{ display: 'flex', gap: 2, mb: 4, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: 20, top: -30, bottom: -20, width: '2px', bgcolor: '#2A2A2A', zIndex: 0 }} />
                  <Avatar sx={{ bgcolor: '#141414', border: '1px solid #D4FF00', color: '#D4FF00', borderRadius: 0, width: 40, height: 40, zIndex: 1 }}>
                    {comment.author.substring(0, 2).toUpperCase()}
                  </Avatar>
                  <Paper sx={{ flexGrow: 1, bgcolor: '#141414', border: '1px solid #2A2A2A', borderRadius: 0, zIndex: 1 }}>
                    <Box sx={{ p: 1.5, borderBottom: '1px solid #2A2A2A', bgcolor: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                        <Box component="span" sx={{ color: '#FFF', fontWeight: 700 }}>{comment.author}</Box> commented {comment.time}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Typography sx={{ color: '#EAEAEA', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {comment.text}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )
            ))}

            <Divider sx={{ borderColor: '#2A2A2A', mb: 4 }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#D4FF00', color: '#000', borderRadius: 0, width: 40, height: 40 }}>ME</Avatar>
              <Paper sx={{ flexGrow: 1, bgcolor: '#141414', border: '1px solid #D4FF00', borderRadius: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 1, borderBottom: '1px solid #2A2A2A', bgcolor: 'rgba(212, 255, 0, 0.05)' }}>
                  <Typography sx={{ color: '#D4FF00', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', ml: 1 }}>Write a response...</Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  variant="standard"
                  placeholder="Leave a comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: { color: '#FFF', p: 2, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }
                  }}
                />
                <Box sx={{ p: 1.5, bgcolor: '#0D0D0D', borderTop: '1px solid #2A2A2A', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    onClick={handleToggleStatus}
                    sx={{
                      color: selectedIncident.status === 'OPEN' ? '#FF003C' : '#D4FF00',
                      borderRadius: 0,
                      fontFamily: '"Roboto Mono", monospace',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                    {selectedIncident.status === 'OPEN' ? 'Close Incident' : 'Reopen Incident'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    sx={{
                      bgcolor: '#D4FF00',
                      color: '#000',
                      borderRadius: 0,
                      fontFamily: '"Roboto Mono", monospace',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#b8de00' },
                      '&.Mui-disabled': { bgcolor: '#2A2A2A', color: '#555' }
                    }}
                  >
                    Comment
                  </Button>
                </Box>
              </Paper>
            </Box>

          </Grid>

          <Grid item xs={12} md={3}>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700, mb: 1 }}>
                ON-CALL ENGINEERS
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#141414', border: '1px solid #D4FF00', color: '#D4FF00', fontSize: '0.7rem', borderRadius: 0 }}>MI</Avatar>
                <Typography sx={{ color: '#D4FF00', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>mihai.admin</Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: '#2A2A2A', mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700, mb: 1 }}>
                SEVERITY / LABELS
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="CRITICAL" size="small" sx={{ bgcolor: 'rgba(255,0,60,0.1)', color: '#FF003C', border: '1px solid #FF003C', borderRadius: 0, fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem' }} />
                <Chip label="hardware" size="small" sx={{ bgcolor: '#141414', color: '#888', border: '1px solid #2A2A2A', borderRadius: 0, fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem' }} />
                <Chip label="database" size="small" sx={{ bgcolor: '#141414', color: '#888', border: '1px solid #2A2A2A', borderRadius: 0, fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem' }} />
              </Box>
            </Box>

            <Divider sx={{ borderColor: '#2A2A2A', mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700, mb: 1 }}>
                AFFECTED COMPONENT
              </Typography>
              <Typography sx={{ color: '#EAEAEA', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 8, height: 8, bgcolor: '#FF003C', display: 'inline-block' }} />
                {selectedIncident.device}
              </Typography>
            </Box>

          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Discussions;