import React, { useState } from 'react';
import { Box, Typography, Fade, Grid, Paper, Button, Chip, Divider } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckIcon from '@mui/icons-material/Check';

const initialTickets = [
  { id: 'TK-9022', ts: '2024-05-15 14:20:01', source: 'DB_CLUSTER_01', message: 'High memory usage detected on Node 3', severity: 'CRITICAL', status: 'PENDING' },
  { id: 'TK-9025', ts: '2024-05-15 14:25:44', source: 'NET_CORE_RT', message: 'Packet loss exceeds 5% on Interface Gi0/1', severity: 'WARNING', status: 'PENDING' },
  { id: 'TK-9028', ts: '2024-05-15 14:30:12', source: 'APP_SRV_LOGS', message: 'Unauthorized access attempt detected', severity: 'CRITICAL', status: 'PENDING' },
  { id: 'TK-9031', ts: '2024-05-15 14:45:10', source: 'STORAGE_UNIT_B', message: 'Predictive failure on Drive 4', severity: 'MINOR', status: 'PENDING' },
];

const getSeverityColor = (sev) => {
  switch (sev) {
    case 'CRITICAL': return '#FF003C';
    case 'WARNING': return '#FFA500';
    case 'MINOR': return '#D4FF00';
    default: return '#888888';
  }
};

const Tickets = () => {
  const [tickets, setTickets] = useState(initialTickets);

  const handleAck = (id) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'ACKNOWLEDGED' } : t));
  };

  return (
    <Fade in={true} timeout={800}>
      <Box>
        {/* Header Pagina */}
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

        <Grid container spacing={2}>
          {tickets.map((ticket) => (
            <Grid item xs={12} key={ticket.id}>
              <Paper variant="outlined" sx={{ borderRadius: 0, bgcolor: '#141414', borderColor: '#2A2A2A', p: 0, overflow: 'hidden', transition: 'none', '&:hover': { borderColor: '#444' } }}>
                <Box sx={{ display: 'flex', alignItems: 'stretch', flexDirection: { xs: 'column', md: 'row' } }}>

                  {/* Indicator de Severitate Lateral */}
                  <Box sx={{ width: '6px', bgcolor: getSeverityColor(ticket.severity) }} />

                  <Box sx={{ flexGrow: 1, p: 2.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>

                    {/* ID & Timestamp */}
                    <Box sx={{ minWidth: '140px' }}>
                      <Typography sx={{ color: '#D4FF00', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                        {ticket.id}
                      </Typography>
                      <Typography sx={{ color: '#444', fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem' }}>
                        {ticket.ts}
                      </Typography>
                    </Box>

                    {/* Sursa */}
                    <Box sx={{ minWidth: '150px' }}>
                      <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', mb: 0.5 }}>
                        SOURCE_ID
                      </Typography>
                      <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
                        {ticket.source}
                      </Typography>
                    </Box>

                    {/* Mesaj */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', mb: 0.5 }}>
                        INCIDENT_DESCRIPTION
                      </Typography>
                      <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
                        {ticket.message}
                      </Typography>
                    </Box>

                    {/* Eticheta Severitate (Re-usable Label) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                          width: '100px'
                        }}
                      />

                      {/* Status / ACK Button */}
                      {ticket.status === 'ACKNOWLEDGED' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, color: '#444' }}>
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
                            px: 3,
                            '&:hover': { bgcolor: '#BDE600' }
                          }}
                        >
                          ACK
                        </Button>
                      )}
                    </Box>

                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Footer Info */}
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