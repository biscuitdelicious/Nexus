import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

const getLevelStyle = (level) => {
  switch (level.toLowerCase()) {
    case 'alarm':
      return { bg: 'rgba(255, 59, 48, 0.15)', color: '#ff3b30', border: 'rgba(255, 59, 48, 0.3)' };
    case 'incident':
      return { bg: 'rgba(255, 149, 0, 0.15)', color: '#ff9500', border: 'rgba(255, 149, 0, 0.3)' };
    case 'event':
      return { bg: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF', border: 'rgba(10, 132, 255, 0.3)' };
    default:
      return { bg: 'rgba(255, 255, 255, 0.1)', color: '#FFF', border: 'rgba(255, 255, 255, 0.2)' };
  }
};

const formatTs = (iso) => {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return iso;
  }
};

const LogsTable = ({ entries }) => {
  const [levelFilter, setLevelFilter] = useState('all');

  const allowedEntries = useMemo(() => {
    return entries.filter((e) => ['alarm', 'incident', 'event'].includes(e.level.toLowerCase()));
  }, [entries]);

  const levels = useMemo(() => {
    const set = new Set(allowedEntries.map((e) => e.level.toLowerCase()));
    return ['all', ...Array.from(set).sort()];
  }, [allowedEntries]);

  const filtered = useMemo(() => {
    if (levelFilter === 'all') return allowedEntries;
    return allowedEntries.filter((e) => e.level.toLowerCase() === levelFilter);
  }, [allowedEntries, levelFilter]);

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
          System Logs
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="logs-level-filter" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Filter Level
          </InputLabel>
          <Select
            labelId="logs-level-filter"
            label="Filter Level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            sx={{
              color: '#fff',
              borderRadius: '12px',
              background: 'rgba(25, 25, 32, 0.4)',
              backdropFilter: 'blur(12px)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0A84FF',
              },
              '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' }
            }}
          >
            {levels.map((lvl) => (
              <MenuItem key={lvl} value={lvl}>
                {lvl === 'all' ? 'All levels' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer
        sx={{
          maxHeight: 500,
          background: 'transparent',
          boxShadow: 'none',
          '&::-webkit-scrollbar': { width: '6px', height: '6px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' },
        }}
      >
        <Table size="medium" stickyHeader sx={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', borderBottom: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', pl: 3 }}>Time</TableCell>
              <TableCell sx={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', borderBottom: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Level</TableCell>
              <TableCell sx={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', borderBottom: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Source</TableCell>
              <TableCell sx={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', borderBottom: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => {
              const style = getLevelStyle(row.level);
              return (
                <TableRow
                  key={row.id}
                  sx={{
                    background: 'rgba(25, 25, 32, 0.4)',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    },
                    '& td': {
                      borderBottom: 'none',
                      borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                    },
                    '& td:first-of-type': {
                      borderLeft: '1px solid rgba(255, 255, 255, 0.03)',
                      borderTopLeftRadius: '16px',
                      borderBottomLeftRadius: '16px',
                    },
                    '& td:last-of-type': {
                      borderRight: '1px solid rgba(255, 255, 255, 0.03)',
                      borderTopRightRadius: '16px',
                      borderBottomRightRadius: '16px',
                    }
                  }}
                >
                  <TableCell sx={{ pl: 3, color: 'rgba(255,255,255,0.6)', typography: 'body2', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {formatTs(row.ts)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.level}
                      sx={{
                        background: style.bg,
                        color: style.color,
                        border: `1px solid ${style.border}`,
                        fontWeight: 800,
                        borderRadius: '8px',
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        letterSpacing: '0.5px',
                        height: '24px',
                        boxShadow: `0 2px 10px ${style.bg}`
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', color: '#0A84FF', fontSize: '0.85rem', fontWeight: 600 }}>
                    {row.source}
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>
                    {row.message}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LogsTable;