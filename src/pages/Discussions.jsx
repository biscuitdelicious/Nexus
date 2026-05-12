import React, { useState } from 'react';
import {
  Box, Typography, Paper, Avatar, TextField, Button,
  Chip, Divider, Fade, Grid, List, ListItem, ListItemButton
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumIcon from '@mui/icons-material/Forum';
import { useUrlState } from '../hooks/useUrlState';

const idToSlug = (id) => String(id).replace(/^#/, '');

const mockIncidents = [
  {
    id: '#40',
    title: 'CPU Critical Temperature Threshold Exceeded',
    status: 'OPEN',
    author: 'nexus_system_daemon',
    createdAt: '3 days ago',
    device: 'DB-Server-Primary-01',
    description: `Alarm automatically triggered by the telemetry system.\n\nThe thermal sensor recorded a temperature of **85.4°C** (Critical threshold: 80.0°C) on the CPU package.\n\n**Recent metrics:**\n- CPU Load: 98%\n- Allocated Mem: 14.2 GB / 16.0 GB\n- Fan Speed: 3200 RPM (Max)\n\nPlease investigate the processes causing this high load. If the temperature reaches 90°C, the server will initiate an emergency shutdown to prevent physical hardware damage.`,
    comments: [
      { id: 1, author: 'mihai.admin', time: '2 days ago', text: 'I checked the running processes. It looks like a Docker container (`data-indexer-v2`) entered an infinite loop and locked up the threads. I restarted the container, but the temperature is dropping very slowly.', isSystem: false },
      { id: 2, author: 'NEXUS_SYSTEM', time: '1 day ago', text: 'SYSTEM LOG: Container `data-indexer-v2` restarted successfully by [mihai.admin]. CPU load dropped to 45%.', isSystem: true },
      { id: 3, author: 'victor.oncall', time: '12 hours ago', text: 'The temperature has stabilized at 72°C. It is still above the normal 65°C average. I suggest we check for dust accumulation on the heatsink or replace the thermal paste during Saturday\'s maintenance window.', isSystem: false }
    ]
  },
  {
    id: '#39',
    title: 'High Latency on API Gateway',
    status: 'RESOLVED',
    author: 'mihai.admin',
    createdAt: '5 days ago',
    device: 'API-Gateway-02',
    description: `The API Gateway response time exceeded 2000ms for more than 5 minutes. This indicates a potential DDoS attack or an unoptimized database query.`,
    comments: [
      { id: 1, author: 'victor.oncall', time: '5 days ago', text: 'I applied rate-limiting on the search endpoint. Response times have returned to normal operating parameters (under 100ms).', isSystem: false }
    ]
  },
  {
    id: '#38',
    title: 'Memory Leak in Auth Service',
    status: 'OPEN',
    author: 'nexus_system_daemon',
    createdAt: '1 week ago',
    device: 'Auth-Node-01',
    description: `The authentication service is currently consuming 95% of the available system RAM. Immediate investigation required.`,
    comments: []
  }
];

const Discussions = () => {
  const [params, patchParams] = useUrlState();
  const [incidentsList, setIncidentsList] = useState(mockIncidents);
  const [newComment, setNewComment] = useState('');

  const incidentSlug = params.incident;
  const selectedIncident = incidentSlug
    ? incidentsList.find((inc) => idToSlug(inc.id) === incidentSlug) || null
    : null;

  const openIncident = (inc) => patchParams({ incident: idToSlug(inc.id) });
  const closeIncident = () => patchParams({ incident: undefined });

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedIncident) return;

    const comment = {
      id: Date.now(),
      author: 'current_user',
      time: 'just now',
      text: newComment,
      isSystem: false
    };

    setIncidentsList((prev) =>
      prev.map((inc) =>
        inc.id === selectedIncident.id
          ? { ...inc, comments: [...inc.comments, comment] }
          : inc
      )
    );
    setNewComment('');
  };

  const handleToggleStatus = () => {
    if (!selectedIncident) return;

    const nextStatus = selectedIncident.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
    const systemEntry = {
      id: Date.now(),
      author: 'NEXUS_SYSTEM',
      time: 'just now',
      text: `Incident status changed to ${nextStatus} by [current_user].`,
      isSystem: true
    };

    setIncidentsList((prev) =>
      prev.map((inc) =>
        inc.id === selectedIncident.id
          ? { ...inc, status: nextStatus, comments: [...inc.comments, systemEntry] }
          : inc
      )
    );
  };

  if (!selectedIncident) {
    return (
      <Fade in={true} timeout={800}>
        <Box sx={{ width: '100%', overflowX: 'hidden' }}>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 1 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1.5,
                  borderRadius: 0,
                  background: '#141414',
                  border: '1px solid #2A2A2A',
                }}
              >
                <ForumIcon sx={{ color: '#D4FF00', fontSize: { xs: 24, sm: 28 } }} />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#FFFFFF',
                    fontFamily: '"Georgia", serif',
                    fontStyle: 'italic',
                    fontWeight: 'normal',
                    fontSize: { xs: '1.5rem', sm: '2.125rem' }
                  }}
                >
                  Incident Discussions
                </Typography>
              </Box>
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

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              ml: { xs: 0, sm: 8.5 },
              mt: { xs: 1, sm: 0 },
              color: '#888888',
              fontFamily: '"Roboto Mono", monospace',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              textTransform: 'uppercase',
              letterSpacing: '1px',
              wordWrap: 'break-word'
            }}
          >
            Centralized forum for investigating and documenting system alarms.
          </Typography>

          <Paper variant="outlined" sx={{ bgcolor: '#141414', borderColor: '#2A2A2A', borderRadius: 0, mt: 4 }}>
            <List disablePadding>
              {incidentsList.map((inc, index) => (
                <React.Fragment key={inc.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => openIncident(inc)}
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

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ width: '100%', overflowX: 'hidden', pb: 5 }}>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={closeIncident}
          sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', mb: 3, '&:hover': { color: '#D4FF00', bgcolor: 'transparent' } }}
        >
          Back to Discussions
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 1 }, gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.5,
              borderRadius: 0,
              background: '#141414',
              border: '1px solid #2A2A2A',
            }}
          >
            <ForumIcon sx={{ color: '#D4FF00', fontSize: { xs: 24, sm: 28 } }} />
          </Box>

          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontFamily: '"Georgia", serif',
                fontStyle: 'italic',
                fontWeight: 'normal',
                fontSize: { xs: '1.5rem', sm: '2.125rem' }
              }}
            >
              {selectedIncident.title} <Typography component="span" variant="h4" sx={{ color: '#888', fontStyle: 'normal' }}>{selectedIncident.id}</Typography>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 4, ml: { xs: 0, sm: 8.5 }, mt: { xs: 1, sm: 0 } }}>
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