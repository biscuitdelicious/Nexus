import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Box, Typography, Skeleton } from '@mui/material';
import { fetchSeverityData } from '../services/api';
import { COLORS } from '../theme/colors';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, p: 1.5, borderRadius: 0 }}>
        <Typography sx={{ color: payload[0].payload.fill, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700, mb: 0.5, letterSpacing: '1px' }}>
          {payload[0].name}
        </Typography>
        <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '1.25rem', fontWeight: 700 }}>
          {payload[0].value}
        </Typography>
      </Box>
    );
  }
  return null;
};

const SeverityPieChart = ({ onSelect }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const result = await fetchSeverityData();
        if (!cancelled) setData(result);
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

  if (loading) {
    return <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', bgcolor: COLORS.surface }} />;
  }

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const clickable = typeof onSelect === 'function';
  const handleSelect = () => { if (clickable) onSelect(); };

  return (
    <Box
      onClick={handleSelect}
      role={clickable ? 'button' : undefined}
      title={clickable ? 'View all tickets' : undefined}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: clickable ? 'pointer' : 'default',
        '&:hover .pie-cta': clickable ? { color: COLORS.info } : {},
      }}
    >
      {/* Donut + center total */}
      <Box sx={{ position: 'relative', flexGrow: 1, minHeight: 0 }}>
        {total === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem', letterSpacing: '1px' }}>
              NO TICKETS
            </Typography>
          </Box>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  onClick={handleSelect}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cursor={clickable ? 'pointer' : 'default'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '1.8rem', lineHeight: 1 }}>
                {total}
              </Typography>
              <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.6rem', letterSpacing: '1.5px' }}>
                TOTAL
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mt: 0.5, flexShrink: 0 }}>
        {data.map((entry) => (
          <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, bgcolor: entry.color, flexShrink: 0 }} />
            <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.5px' }}>
              {entry.name} {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {clickable && (
        <Typography className="pie-cta" sx={{ textAlign: 'center', color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.6rem', letterSpacing: '1px', mt: 0.5, flexShrink: 0, transition: 'color 0.15s' }}>
          VIEW TICKETS →
        </Typography>
      )}
    </Box>
  );
};

export default SeverityPieChart;
