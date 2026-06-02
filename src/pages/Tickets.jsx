import React, { useState, useEffect } from 'react';
import { Box, Typography, Fade, Grid, Paper, Button, Chip, Skeleton, Menu, MenuItem } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckIcon from '@mui/icons-material/Check';
import SnoozeIcon from '@mui/icons-material/Snooze';
import { fetchTickets, acknowledgeTicket, snoozeTicket } from '../services/api';
import { COLORS } from '../theme/colors';

const SNOOZE_OPTIONS = [
  { value: '15m', label: '15 MIN' },
  { value: '1h',  label: '1 HOUR' },
  { value: '8h',  label: '8 HOURS' },
];

const getSeverityColor = (sev) => {
  switch (sev) {
    case 'ALARM':    return COLORS.critical;
    case 'INCIDENT': return COLORS.warn;
    case 'EVENT':    return COLORS.textMuted;
    default:         return COLORS.textMuted;
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
    const id = setInterval(loadData, 30000);
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

  // Per-ticket snooze menu state. Keyed by ticket id.
  const [snoozeAnchor, setSnoozeAnchor] = useState({ id: null, el: null });

  const openSnoozeMenu = (id, el) => setSnoozeAnchor({ id, el });
  const closeSnoozeMenu = () => setSnoozeAnchor({ id: null, el: null });

  const handleSnooze = async (id, duration) => {
    closeSnoozeMenu();
    const res = await snoozeTicket(id, duration);
    if (res.ok) {
      // Optimistic: remove from list since /events/open will hide it
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } else {
      console.error('Snooze failed:', res.message);
    }
  };

  return (
    <Fade in={true} timeout={200}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5, background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <WarningAmberIcon sx={{ color: COLORS.info, fontSize: 28 }} />
          </Box>
          <Typography variant="h4" sx={{ color: COLORS.text, fontFamily: '"Georgia", serif', fontStyle: 'italic' }}>
            Open Tickets
          </Typography>
        </Box>

        <Typography sx={{ mb: 4, ml: 8.5, color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Open alarms waiting to be acknowledged.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((skeletonId) => (
              <Skeleton key={skeletonId} variant="rectangular" height={90} sx={{ bgcolor: COLORS.surface, borderRadius: 0 }} />
            ))}
          </Box>
        ) : (
          <Grid container spacing={2}>
            {tickets.map((ticket) => (
              <Grid item xs={12} key={ticket.id}>
                <Paper variant="outlined" sx={{ borderRadius: 0, bgcolor: COLORS.surface, borderColor: COLORS.border, p: 0, overflow: 'hidden', transition: 'none', '&:hover': { borderColor: COLORS.border } }}>
                  <Box sx={{ display: 'flex', alignItems: 'stretch' }}>

                    <Box sx={{ width: '6px', flexShrink: 0, bgcolor: getSeverityColor(ticket.severity) }} />

                    <Grid container alignItems="center" sx={{ p: 2, width: 'calc(100% - 6px)' }}>

                      <Grid item xs={12} md={2}>
                        <Typography sx={{ color: COLORS.info, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                          {ticket.id}
                        </Typography>
                        <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem',  marginRight: 0.5 }}>
                          {ticket.ts}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={2.5}>
                        <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: 0.5 }}>
                          SOURCE_ID
                        </Typography>
                        <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem'}}>
                          {ticket.source}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4.5} sx={{ pr: 2 }}>
                        <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', mb: 0.5 }}>
                          INCIDENT_DESCRIPTION
                        </Typography>
                        <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
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
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '80px', color: COLORS.border }}>
                            <CheckIcon fontSize="small" />
                            <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700 }}>ACK</Typography>
                          </Box>
                        ) : (
                          <>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<SnoozeIcon fontSize="small" />}
                            onClick={(e) => openSnoozeMenu(ticket.id, e.currentTarget)}
                            sx={{
                              borderRadius: 0,
                              borderColor: COLORS.border,
                              color: COLORS.textMuted,
                              fontFamily: '"Roboto Mono", monospace',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              minWidth: 0,
                              px: 1,
                              '&:hover': { borderColor: COLORS.textMuted, bgcolor: 'transparent' }
                            }}
                          >
                            SNOOZE
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAck(ticket.id)}
                            sx={{
                              borderRadius: 0,
                              bgcolor: COLORS.info,
                              color: COLORS.bg,
                              fontFamily: '"Roboto Mono", monospace',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              width: '80px',
                              minWidth: '80px',
                              '&:hover': { bgcolor: COLORS.info }
                            }}
                          >
                            ACK
                          </Button>
                          </>
                        )}
                      </Grid>
                    </Grid>

                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 4, p: 2, border: `1px solid ${COLORS.border}`, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: COLORS.info }} />
          <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>
            TOTAL PENDING ACTIONS: {tickets.filter(t => t.status === 'PENDING').length}
          </Typography>
        </Box>

        <Menu
          anchorEl={snoozeAnchor.el}
          open={Boolean(snoozeAnchor.el)}
          onClose={closeSnoozeMenu}
          PaperProps={{
            sx: {
              bgcolor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 0,
              mt: 0.5,
            },
          }}
        >
          {SNOOZE_OPTIONS.map((opt) => (
            <MenuItem
              key={opt.value}
              onClick={() => handleSnooze(snoozeAnchor.id, opt.value)}
              sx={{
                fontFamily: '"Roboto Mono", monospace',
                fontSize: '0.75rem',
                color: COLORS.text,
                letterSpacing: '1px',
                '&:hover': { bgcolor: 'rgba(88, 166, 255, 0.08)' },
              }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Fade>
  );
};

export default Tickets;