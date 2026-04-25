import React, { useState, useEffect } from 'react';
import { Box, Typography, Fade, Grid, Paper, Button, Chip, Skeleton } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckIcon from '@mui/icons-material/Check';
import { fetchTickets, acknowledgeTicket } from '../services/api';

const getSeverityColor = (sev) => {
  switch (sev) {
    case 'ALARM': return '#FF003C';
    case 'INCIDENT': return '#FFA500';
    case 'EVENT': return '#888888';
    default: return '#888888';
  }
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const data = await fetchTickets();
        if (!cancelled) setTickets(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    const id = setInterval(loadData, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const handleAck = async (id) => {
    try {
      const response = await acknowledgeTicket(id);
      if (response.success) {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: 'ACKNOWLEDGED' } : t));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5, background: '#141414', border: '1px solid #2A2A2A' }}>
            <WarningAmberIcon sx={{ color: '#D4FF00', fontSize: 28 }} />
          </Box>
          <Typography variant="h4" sx={{ color: '#FFFFFF', fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>
            Alarm & Ticket Management
          </Typography>
        </Box>

        <Typography sx={{ mb: 4, ml: 8.5, color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Active system alerts requiring operator intervention and acknowledgement.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((skeletonId) => (
              <Skeleton key={skeletonId} variant="rectangular" height={90} sx={{ bgcolor: '#141414', borderRadius: 0 }} />
            ))}
          </Box>
        ) : (
          <Grid container spacing={2}>
            {tickets.map((ticket) => (
              <Grid item xs={12} key={ticket.id}>
                <Paper variant="outlined" sx={{ borderRadius: 0, bgcolor: '#141414', borderColor: '#2A2A2A', p: 0, overflow: 'hidden', transition: 'none', '&:hover': { borderColor: '#444' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'stretch' }}>

                    <Box sx={{ width: '6px', flexShrink: 0, bgcolor: getSeverityColor(ticket.severity) }} />

                    <Grid container alignItems="center" sx={{ p: 2, width: 'calc(100% - 6px)' }}>

                      <Grid item xs={12} md={2}>
                        <Typography sx={{ color: '#D4FF00', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                          {ticket.id}
                        </Typography>
                        <Typography sx={{ color: '#444', fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem' }}>
                          {ticket.ts}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={2.5}>
                        <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', mb: 0.5 }}>
                          SOURCE_ID
                        </Typography>
                        <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
                          {ticket.source}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4.5} sx={{ pr: 2 }}>
                        <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', mb: 0.5 }}>
                          INCIDENT_DESCRIPTION
                        </Typography>
                        <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
                          {ticket.message}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={ticket.severity}
                          variant="outlined"
                          sx={{
                            borderRadius: 0,
                            fontFamily: '"Roboto Mono", monospace',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            color: getSeverityColor(ticket.severity),
                            borderColor: getSeverityColor(ticket.severity),
                            width: '90px'
                          }}
                        />

                        {ticket.status === 'ACKNOWLEDGED' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '80px', color: '#444' }}>
                            <CheckIcon fontSize="small" />
                            <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700 }}>ACK</Typography>
                          </Box>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAck(ticket.id)}
                            sx={{
                              borderRadius: 0,
                              bgcolor: '#D4FF00',
                              color: '#000',
                              fontFamily: '"Roboto Mono", monospace',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              width: '80px',
                              minWidth: '80px',
                              '&:hover': { bgcolor: '#BDE600' }
                            }}
                          >
                            ACK
                          </Button>
                        )}
                      </Grid>
                    </Grid>

                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 4, p: 2, border: '1px solid #2A2A2A', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: '#D4FF00' }} />
          <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>
            TOTAL PENDING ACTIONS: {tickets.filter(t => t.status === 'PENDING').length}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default Tickets;