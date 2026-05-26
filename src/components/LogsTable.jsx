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
import { COLORS } from '../theme/colors';

const getLevelStyle = (level) => {
  if (!level) return { color: COLORS.text, borderColor: COLORS.border };

  switch (level.toLowerCase()) {
    case 'alarm':
      return { color: COLORS.critical, borderColor: COLORS.critical };
    case 'incident':
      return { color: COLORS.warn, borderColor: COLORS.warn };
    case 'event':
      return { color: COLORS.textMuted, borderColor: COLORS.textMuted };
    default:
      return { color: COLORS.text, borderColor: COLORS.border };
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

const LogsTable = ({ entries = [] }) => {
  const [levelFilter, setLevelFilter] = useState('all');

  const allowedEntries = useMemo(() => {
    return entries.filter((e) => {
      const typeStr = e.type || e.level || '';
      return ['alarm', 'incident', 'event'].includes(typeStr.toLowerCase());
    });
  }, [entries]);

  const levels = useMemo(() => {
    const set = new Set(allowedEntries.map((e) => (e.type || e.level || '').toLowerCase()));
    return ['all', ...Array.from(set).sort()];
  }, [allowedEntries]);

  const filtered = useMemo(() => {
    if (levelFilter === 'all') return allowedEntries;
    return allowedEntries.filter((e) => (e.type || e.level || '').toLowerCase() === levelFilter);
  }, [allowedEntries, levelFilter]);

  return (
    <Box sx={{ width: '100%', minWidth: 0, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.surface }}>
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, borderBottom: `1px solid ${COLORS.border}` }}>
        <Typography sx={{ flexGrow: 1, fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', color: COLORS.text }}>
          System Logs
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="logs-level-filter" sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Filter Level
          </InputLabel>
          <Select
            labelId="logs-level-filter"
            label="Filter Level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            sx={{
              color: COLORS.text,
              borderRadius: 0,
              fontFamily: '"Roboto Mono", monospace',
              fontSize: '0.85rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.border,
                borderRadius: 0
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.textMuted,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.info,
              },
              '& .MuiSvgIcon-root': { color: COLORS.textMuted }
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
          '&::-webkit-scrollbar-thumb': { backgroundColor: COLORS.border },
          '&::-webkit-scrollbar-track': { background: COLORS.surface, borderLeft: `1px solid ${COLORS.border}` },
        }}
      >
        <Table size="medium" stickyHeader sx={{ borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: COLORS.surface, color: COLORS.textMuted, borderBottom: `1px solid ${COLORS.border}`, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', pl: 3 }}>Time</TableCell>
              <TableCell sx={{ backgroundColor: COLORS.surface, color: COLORS.textMuted, borderBottom: `1px solid ${COLORS.border}`, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Level</TableCell>
              <TableCell sx={{ backgroundColor: COLORS.surface, color: COLORS.textMuted, borderBottom: `1px solid ${COLORS.border}`, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Source</TableCell>
              <TableCell sx={{ backgroundColor: COLORS.surface, color: COLORS.textMuted, borderBottom: `1px solid ${COLORS.border}`, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => {
              const rowType = row.type || row.level || 'UNKNOWN';
              const style = getLevelStyle(rowType);
              return (
                <TableRow
                  key={row.id}
                  sx={{
                    background: COLORS.surface,
                    transition: 'none',
                    '&:hover': {
                      background: 'rgba(88, 166, 255, 0.06)',
                    },
                    '& td': {
                      borderBottom: `1px solid ${COLORS.border}`,
                    }
                  }}
                >
                  <TableCell sx={{ pl: 3, color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {formatTs(row.ts)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rowType}
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
                  <TableCell sx={{ fontFamily: '"Roboto Mono", monospace', color: COLORS.info, fontSize: '0.85rem' }}>
                    {row.source}
                  </TableCell>
                  <TableCell sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
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