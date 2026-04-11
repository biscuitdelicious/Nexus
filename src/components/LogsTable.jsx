import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

const levelColor = (level) => {
  switch (level) {
    case 'error':
      return 'error';
    case 'warn':
      return 'warning';
    case 'info':
      return 'info';
    case 'debug':
      return 'default';
    default:
      return 'default';
  }
};

const formatTs = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const LogsTable = ({ entries }) => {
  const [levelFilter, setLevelFilter] = useState('all');

  const levels = useMemo(() => {
    const set = new Set(entries.map((e) => e.level));
    return ['all', ...Array.from(set).sort()];
  }, [entries]);

  const filtered = useMemo(() => {
    if (levelFilter === 'all') return entries;
    return entries.filter((e) => e.level === levelFilter);
  }, [entries, levelFilter]);

  return (
    <Paper variant="outlined" sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Recent logs
        </Typography>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="logs-level-filter">Level</InputLabel>
          <Select
            labelId="logs-level-filter"
            label="Level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            {levels.map((lvl) => (
              <MenuItem key={lvl} value={lvl}>
                {lvl === 'all' ? 'All levels' : lvl}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer sx={{ maxHeight: 420 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 200 }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 100 }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 160 }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap', typography: 'body2' }}>{formatTs(row.ts)}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.level} color={levelColor(row.level)} variant="outlined" />
                </TableCell>
                <TableCell sx={{ fontFamily: 'ui-monospace, monospace', typography: 'body2' }}>{row.source}</TableCell>
                <TableCell sx={{ fontFamily: 'ui-monospace, monospace', typography: 'body2', wordBreak: 'break-word' }}>
                  {row.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default LogsTable;
