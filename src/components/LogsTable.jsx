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
      return { color: '#FF003C', borderColor: '#FF003C' };
    case 'incident':
      return { color: '#FFA500', borderColor: '#FFA500' };
    case 'event':
      return { color: '#888888', borderColor: '#888888' };
    default:
      return { color: '#FFFFFF', borderColor: '#2A2A2A' };
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
    <Box sx={{ width: '100%', minWidth: 0, border: '1px solid #2A2A2A', backgroundColor: '#141414' }}>
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, borderBottom: '1px solid #2A2A2A' }}>
        <Typography sx={{ flexGrow: 1, fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', color: '#FFFFFF' }}>
          System Logs
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="logs-level-filter" sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Filter Level
          </InputLabel>
          <Select
            labelId="logs-level-filter"
            label="Filter Level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            sx={{
              color: '#FFFFFF',
              borderRadius: 0,
              fontFamily: '"Roboto Mono", monospace',
              fontSize: '0.85rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2A2A2A',
                borderRadius: 0
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#888888',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D4FF00',
              },
              '& .MuiSvgIcon-root': { color: '#888888' }
            }}
          >
            {levels.map((lvl) => (
              <MenuItem key={lvl} value={lvl} sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                {lvl === 'all' ? 'All levels' : lvl}
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
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#2A2A2A' },
          '&::-webkit-scrollbar-track': { background: '#0D0D0D', borderLeft: '1px solid #2A2A2A' },
        }}
      >
        <Table size="medium" stickyHeader sx={{ borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#0D0D0D', color: '#888888', borderBottom: '1px solid #2A2A2A', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', pl: 3 }}>Time</TableCell>
              <TableCell sx={{ backgroundColor: '#0D0D0D', color: '#888888', borderBottom: '1px solid #2A2A2A', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Level</TableCell>
              <TableCell sx={{ backgroundColor: '#0D0D0D', color: '#888888', borderBottom: '1px solid #2A2A2A', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Source</TableCell>
              <TableCell sx={{ backgroundColor: '#0D0D0D', color: '#888888', borderBottom: '1px solid #2A2A2A', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => {
              const style = getLevelStyle(row.level);
              return (
                <TableRow
                  key={row.id}
                  sx={{
                    background: '#141414',
                    transition: 'none',
                    '&:hover': {
                      background: 'rgba(212, 255, 0, 0.02)',
                    },
                    '& td': {
                      borderBottom: '1px solid #2A2A2A',
                    }
                  }}
                >
                  <TableCell sx={{ pl: 3, color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {formatTs(row.ts)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.level}
                      variant="outlined"
                      sx={{
                        color: style.color,
                        borderColor: style.borderColor,
                        fontFamily: '"Roboto Mono", monospace',
                        fontWeight: 700,
                        borderRadius: 0,
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        letterSpacing: '1px',
                        height: '24px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: '"Roboto Mono", monospace', color: '#D4FF00', fontSize: '0.85rem' }}>
                    {row.source}
                  </TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
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