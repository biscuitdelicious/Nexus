import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Fade } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import GridViewIcon from '@mui/icons-material/GridView';

import Dashboard from './Dashboard';
import Devices from './Devices';
import Observability from './Observability';
import Tickets from './Tickets';

const NocWall = ({ setActivePage }) => {
  const [panels, setPanels] = useState([
    { id: 'Dashboard', title: 'SYS.DASHBOARD', component: <Dashboard /> },
    { id: 'Devices', title: 'NET.DEVICES', component: <Devices /> },
    { id: 'Observability', title: 'TEL.METRICS', component: <Observability /> },
    { id: 'Tickets', title: 'SEC.TICKETS', component: <Tickets /> },
  ]);

  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedIdx(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx) return;

    const newPanels = [...panels];
    const draggedItem = newPanels[draggedIdx];

    newPanels.splice(draggedIdx, 1);
    newPanels.splice(dropIdx, 0, draggedItem);

    setPanels(newPanels);
  };

  return (
    <Fade in={true} timeout={800}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5, background: '#141414', border: '1px solid #2A2A2A' }}>
            <GridViewIcon sx={{ color: '#D4FF00', fontSize: 28 }} />
          </Box>
          <Typography variant="h4" sx={{ color: '#FFFFFF', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontWeight: 'normal' }}>
            Command Center
          </Typography>
        </Box>

        <Typography sx={{ mb: 4, ml: 8.5, color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Drag & drop to rearrange active monitoring feeds.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 3,
            height: 'calc(100vh - 200px)'
          }}
        >
          {panels.map((panel, index) => (
            <Paper
              key={panel.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 0,
                bgcolor: '#0D0D0D',
                borderColor: '#2A2A2A',
                height: '100%',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: '#444' }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  bgcolor: '#141414',
                  borderBottom: '1px solid #2A2A2A',
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DragIndicatorIcon sx={{ color: '#444', fontSize: 18 }} />
                  <Box sx={{ width: 8, height: 8, bgcolor: '#FF003C', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                  <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '1px' }}>
                    FEED: {panel.title}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setActivePage(panel.id)}
                  sx={{ color: '#888', borderRadius: 0, '&:hover': { color: '#D4FF00', bgcolor: 'rgba(212,255,0,0.1)' } }}
                >
                  <OpenInFullIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, position: 'relative' }}>
                <Box sx={{ transformOrigin: 'top left', width: '100%' }}>
                  {panel.component}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.3; }
              100% { opacity: 1; }
            }
          `}
        </style>
      </Box>
    </Fade>
  );
};

export default NocWall;