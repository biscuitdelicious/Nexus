import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Paper, Avatar, TextField, Button,
  Chip, Divider, Fade, Grid, List, ListItem, ListItemButton,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  MenuItem
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumIcon from '@mui/icons-material/Forum';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useUrlState } from '../hooks/useUrlState';
import { COLORS } from '../theme/colors';
import {
  fetchDiscussions,
  fetchDiscussionDetail,
  createDiscussion,
  postComment,
  changeDiscussionStatus,
  subscribeToDiscussion,
} from '../services/discussionsApi';

import {fetchDevices} from '../services/api';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return d.toLocaleString();
};


const getCurrentUserDisplay = () => {
  try {
    const raw = localStorage.getItem('nexus_user');
    if (!raw) return 'guest';
    const u = JSON.parse(raw);
    return u?.email || u?.first_name || 'user';
  } catch { return 'user'; }
};

const Discussions = () => {
  const [params, patchParams] = useUrlState();
  const [discussionsList, setDiscussionsList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [newTopicData, setNewTopicData] = useState({ title: '', body: '', device_label: '' });
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [devices, setDevices] = useState([]);

  const commentsEndRef = useRef(null);
  const incidentId = params.incident ? Number(params.incident) : null;
  const currentUser = getCurrentUserDisplay();

  // ---- Load list of discussions on mount + after creation ----
  const reloadList = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const data = await fetchDiscussions();
      setDiscussionsList(Array.isArray(data) ? data : []);
    } catch (err) {
      setListError(err?.message || 'Failed to load discussions');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { reloadList(); }, [reloadList]);

  // ---- Load selected discussion detail when incident URL param changes ----
  useEffect(() => {
    if (!incidentId) { setSelectedDetail(null); return; }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError('');
    fetchDiscussionDetail(incidentId)
      .then((data) => { if (!cancelled) setSelectedDetail(data); })
      .catch((err) => { if (!cancelled) setDetailError(err?.message || 'Failed to load'); })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [incidentId]);

  // ---- WebSocket subscription for live updates on selected discussion ----
  useEffect(() => {
    if (!incidentId) return;
    setWsConnected(false);

    const unsubscribe = subscribeToDiscussion(incidentId, (event) => {
      if (event?.type === 'hello') {
        setWsConnected(true);
        return;
      }
      if (event?.type === 'comment' && event.data) {
        setSelectedDetail((prev) => {
          if (!prev || prev.discussion_id !== event.data.discussion_id) return prev;
          // Skip duplicates (in case POST response already added it)
          if (prev.comments.some((c) => c.comment_id === event.data.comment_id)) return prev;
          return { ...prev, comments: [...prev.comments, event.data] };
        });
      }
      if (event?.type === 'status' && event.data) {
        setSelectedDetail((prev) => {
          if (!prev || prev.discussion_id !== event.data.discussion_id) return prev;
          return { ...prev, status: event.data.status };
        });
        // refresh list to update status chip
        reloadList();
      }
    });

    return () => { unsubscribe(); setWsConnected(false); };
  }, [incidentId, reloadList]);

  // ---- Auto-scroll to bottom on new comments ----
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [selectedDetail?.comments?.length]);

  const openIncident = (inc) => patchParams({ incident: String(inc.discussion_id) });
  const closeIncident = () => patchParams({ incident: undefined });

  const handleAddComment = async () => {
    const msg = newComment.trim();
    if (!msg || !selectedDetail || posting) return;
    setPosting(true);
    try {
      await postComment(selectedDetail.discussion_id, currentUser, msg);
      setNewComment('');
      // WS will append it; nothing else to do
    } catch (err) {
      alert('Failed to post: ' + (err?.message || 'unknown'));
    } finally {
      setPosting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedDetail) return;
    const next = selectedDetail.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
    try {
      await changeDiscussionStatus(selectedDetail.discussion_id, next, currentUser);
    } catch (err) {
      alert('Failed to change status: ' + (err?.message || 'unknown'));
    }
  };

  const handleCreateTopic = async () => {
    const { title, body, device_label } = newTopicData;
    if (!title.trim() || !body.trim()) return;
    setCreatingTopic(true);
    try {
      const created = await createDiscussion({
        title: title.trim(),
        body: body.trim(),
        author_display: currentUser,
        device_label: device_label.trim() || null,
      });
      setNewTopicOpen(false);
      setNewTopicData({ title: '', body: '', device_label: '' });
      await reloadList();
      patchParams({ incident: String(created.discussion_id) });
    } catch (err) {
      alert('Failed to create: ' + (err?.message || 'unknown'));
    } finally {
      setCreatingTopic(false);
    }
  };

  useEffect(() => {
    fetchDevices().then((d) => setDevices(Array.isArray(d) ? d : [])).catch(() => setDevices([]));
  }, []);

  if (!incidentId) {
    return (
      <Fade in={true} timeout={200}>
        <Box sx={{ width: '100%', overflowX: 'hidden' }}>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 1 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                p: 1.5, borderRadius: 0, background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
              }}>
                <ForumIcon sx={{ color: COLORS.info, fontSize: { xs: 24, sm: 28 } }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{
                  color: COLORS.text, 
                  fontFamily: '"Georgia", serif',
                  // fontStyle: 'italic', 
                  fontWeight: 'normal',
                  fontSize: { xs: '1.5rem', sm: '2.125rem' }
                }}>
                  Discussions
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={() => setNewTopicOpen(true)}
              sx={{
                bgcolor: COLORS.info, color: COLORS.bg, borderRadius: 0,
                fontFamily: '"Roboto Mono", monospace', fontWeight: 700,
                '&:hover': { bgcolor: COLORS.info }
              }}
            >
              New Topic
            </Button>
          </Box>

          <Typography variant="body1" sx={{
            mb: 4, ml: { xs: 0, sm: 8.5 }, mt: { xs: 1, sm: 0 },
            color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace',
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            textTransform: 'uppercase', letterSpacing: '1px',
            wordWrap: 'break-word'
          }}>
            Threads about incidents. Add comments, change status
          </Typography>

          {listLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress sx={{ color: COLORS.info }} />
            </Box>
          )}

          {listError && (
            <Paper sx={{ p: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.critical}`, borderRadius: 0, color: COLORS.critical, fontFamily: '"Roboto Mono", monospace' }}>
              {listError}
            </Paper>
          )}

          {!listLoading && !listError && (
            <Paper variant="outlined" sx={{ bgcolor: COLORS.surface, borderColor: COLORS.border, borderRadius: 0, mt: 4 }}>
              <List disablePadding>
                {discussionsList.length === 0 && (
                  <ListItem><Typography sx={{ color: COLORS.textMuted, p: 3, fontFamily: '"Roboto Mono", monospace' }}>No discussions yet. Create one with “New Topic”.</Typography></ListItem>
                )}
                {discussionsList.map((inc, index) => (
                  <React.Fragment key={inc.discussion_id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => openIncident(inc)}
                        sx={{ p: 3, transition: 'none', '&:hover': { bgcolor: 'rgba(212, 255, 0, 0.03)' } }}
                      >
                        <Box sx={{ display: 'flex', width: '100%', gap: 3, alignItems: 'center' }}>
                          {inc.status === 'OPEN'
                            ? <ErrorIcon sx={{ color: COLORS.critical }} />
                            : <CheckCircleIcon sx={{ color: COLORS.info }} />}

                          <Box sx={{ flexGrow: 1 }}>
                            <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                              {inc.title}
                              {' '}
                              <Typography component="span" sx={{ color: COLORS.textMuted, fontSize: '0.9rem' }}>
                                #{inc.discussion_id}
                              </Typography>
                            </Typography>
                            <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>
                              Opened by <Box component="span" sx={{ color: COLORS.info }}>{inc.author_display}</Box> {formatTime(inc.created_at)}
                              {inc.device_label ? <> on {inc.device_label}</> : null}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ForumIcon sx={{ color: COLORS.border, fontSize: 18 }} />
                            <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', fontWeight: 700 }}>
                              {inc.comment_count}
                            </Typography>
                          </Box>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                    {index < discussionsList.length - 1 && <Divider sx={{ borderColor: COLORS.border }} />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}

          {/* New Topic dialog */}
          <Dialog
            open={newTopicOpen}
            onClose={() => setNewTopicOpen(false)}
            PaperProps={{ sx: { bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 0, minWidth: 480 } }}
          >
            <DialogTitle sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', borderBottom: `1px solid ${COLORS.border}`, width: 450 }}>
              New Discussion
            </DialogTitle>
            <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title" variant="outlined" fullWidth
                value={newTopicData.title}
                onChange={(e) => setNewTopicData((d) => ({ ...d, title: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2, '& .MuiInputBase-root': { color: COLORS.text, fontFamily: '"Roboto Mono", monospace' }, '& .MuiFormLabel-root': { color: COLORS.textMuted } }}
              />
              <TextField
                select
                label="Affected device (optional)" variant="outlined" fullWidth
                value={newTopicData.device_label}
                onChange={(e) => setNewTopicData((d) => ({ ...d, device_label: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-root': { color: COLORS.text, fontFamily: '"Roboto Mono", monospace' }, '& .MuiFormLabel-root': { color: COLORS.textMuted } }}
              >
                {devices.map((d) => (
                  <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Body" variant="outlined" fullWidth multiline minRows={4}
                value={newTopicData.body}
                onChange={(e) => setNewTopicData((d) => ({ ...d, body: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-root': { color: COLORS.text, fontFamily: '"Roboto Mono", monospace' }, '& .MuiFormLabel-root': { color: COLORS.textMuted } }}
              />
            </DialogContent>
            <DialogActions sx={{ borderTop: `1px solid ${COLORS.border}`, px: 3, py: 2 }}>
              <Button onClick={() => setNewTopicOpen(false)} sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace' }}>Cancel</Button>
              <Button
                onClick={handleCreateTopic}
                disabled={creatingTopic || !newTopicData.title.trim() || !newTopicData.body.trim()}
                variant="contained"
                sx={{ bgcolor: COLORS.info, color: COLORS.bg, borderRadius: 0, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, '&:hover': { bgcolor: COLORS.info } }}
              >
                {creatingTopic ? 'Creating…' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    );
  }

  // ===================== DETAIL VIEW =====================
  if (detailLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: COLORS.info }} />
      </Box>
    );
  }

  if (detailError) {
    return (
      <Box sx={{ p: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={closeIncident} sx={{ color: COLORS.textMuted, mb: 2 }}>Back</Button>
        <Paper sx={{ p: 3, bgcolor: COLORS.surface, border: `1px solid ${COLORS.critical}`, borderRadius: 0, color: COLORS.critical, fontFamily: '"Roboto Mono", monospace' }}>
          {detailError}
        </Paper>
      </Box>
    );
  }

  if (!selectedDetail) return null;
  const inc = selectedDetail;

  return (
    <Fade in={true} timeout={200}>
      <Box sx={{ width: '100%', overflowX: 'hidden', pb: 5 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={closeIncident}
            sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', '&:hover': { color: COLORS.info, bgcolor: 'transparent' } }}
          >
            Back to Discussions
          </Button>

          <Chip
            icon={wsConnected ? <WifiIcon sx={{ fontSize: 14 }} /> : <WifiOffIcon sx={{ fontSize: 14 }} />}
            label={wsConnected ? 'LIVE' : 'OFFLINE'}
            size="small"
            sx={{
              borderRadius: 0,
              bgcolor: wsConnected ? 'rgba(212,255,0,0.1)' : 'rgba(255,0,60,0.1)',
              color: wsConnected ? COLORS.info : COLORS.critical,
              border: `1px solid ${wsConnected ? COLORS.info : COLORS.critical}`,
              fontFamily: '"Roboto Mono", monospace',
              fontSize: '0.65rem',
              letterSpacing: '1.5px',
              fontWeight: 700,
              '& .MuiChip-icon': { color: 'inherit' }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 1 }, gap: 2 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            p: 1.5, borderRadius: 0, background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
          }}>
            <ForumIcon sx={{ color: COLORS.info, fontSize: { xs: 24, sm: 28 } }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{
              color: COLORS.text, fontFamily: '"Georgia", serif',
              fontStyle: 'italic', fontWeight: 'normal',
              fontSize: { xs: '1.5rem', sm: '2.125rem' }
            }}>
              {inc.title}
              {' '}
              <Typography component="span" variant="h4" sx={{ color: COLORS.textMuted, fontStyle: 'normal' }}>
                #{inc.discussion_id}
              </Typography>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 4, ml: { xs: 0, sm: 8.5 }, mt: { xs: 1, sm: 0 } }}>
          <Chip
            icon={inc.status === 'OPEN' ? <ErrorIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
            label={inc.status}
            sx={{
              borderRadius: 0,
              bgcolor: inc.status === 'OPEN' ? 'rgba(255, 0, 60, 0.1)' : 'rgba(212, 255, 0, 0.1)',
              color: inc.status === 'OPEN' ? COLORS.critical : COLORS.info,
              border: `1px solid ${inc.status === 'OPEN' ? COLORS.critical : COLORS.info}`,
              fontFamily: '"Roboto Mono", monospace', fontWeight: 700, letterSpacing: '1px'
            }}
          />
          <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
            <Box component="span" sx={{ color: COLORS.info, fontWeight: 700 }}>{inc.author_display}</Box>
            {' '}triggered this {formatTime(inc.created_at)} · {inc.comments.length} comments
          </Typography>
        </Box>

        <Divider sx={{ borderColor: COLORS.border, mb: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={9}>

            {/* Original body */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Avatar sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.critical, borderRadius: 0, width: 40, height: 40 }}>
                <TimelineIcon />
              </Avatar>
              <Paper sx={{ flexGrow: 1, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 0 }}>
                <Box sx={{ p: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                    <Box component="span" sx={{ color: COLORS.text, fontWeight: 700 }}>{inc.author_display}</Box> reported {formatTime(inc.created_at)}
                  </Typography>
                  <Chip label="AUTHOR" size="small" sx={{ borderRadius: 0, bgcolor: 'transparent', color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, fontSize: '0.65rem' }} />
                </Box>
                <Box sx={{ p: 3 }}>
                  <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {inc.body}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* Comments */}
            {inc.comments.map((comment) => (
              comment.is_system ? (
                <Box key={comment.comment_id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, pl: 2, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: 22, top: -30, bottom: -10, width: '2px', bgcolor: COLORS.border, zIndex: 0 }} />
                  <SettingsIcon sx={{ color: COLORS.textMuted, fontSize: 20, zIndex: 1, bgcolor: COLORS.surface }} />
                  <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                    {comment.message}
                    {' '}
                    <Box component="span" sx={{ color: COLORS.border, fontSize: '0.7rem' }}>— {formatTime(comment.created_at)}</Box>
                  </Typography>
                </Box>
              ) : (
                <Box key={comment.comment_id} sx={{ display: 'flex', gap: 2, mb: 4, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: 20, top: -30, bottom: -20, width: '2px', bgcolor: COLORS.border, zIndex: 0 }} />
                  <Avatar sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.info}`, color: COLORS.info, borderRadius: 0, width: 40, height: 40, zIndex: 1 }}>
                    {comment.author_display.substring(0, 2).toUpperCase()}
                  </Avatar>
                  <Paper sx={{ flexGrow: 1, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 0, zIndex: 1 }}>
                    <Box sx={{ p: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                        <Box component="span" sx={{ color: COLORS.text, fontWeight: 700 }}>{comment.author_display}</Box> commented {formatTime(comment.created_at)}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {comment.message}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )
            ))}

            <div ref={commentsEndRef} />

            <Divider sx={{ borderColor: COLORS.border, mb: 4 }} />

            {/* Compose */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar sx={{ bgcolor: COLORS.info, color: COLORS.bg, borderRadius: 0, width: 40, height: 40 }}>
                {(currentUser.substring(0, 2) || 'ME').toUpperCase()}
              </Avatar>
              <Paper sx={{ flexGrow: 1, bgcolor: COLORS.surface, border: `1px solid ${COLORS.info}`, borderRadius: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 1, borderBottom: `1px solid ${COLORS.border}`, bgcolor: 'rgba(212, 255, 0, 0.05)' }}>
                  <Typography sx={{ color: COLORS.info, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', ml: 1 }}>
                    Write a response as <strong>{currentUser}</strong>
                  </Typography>
                </Box>
                <TextField
                  fullWidth multiline minRows={4} variant="standard"
                  placeholder="Leave a comment (Ctrl+Enter to send)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  InputProps={{
                    disableUnderline: true,
                    sx: { color: COLORS.text, p: 2, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }
                  }}
                />
                <Box sx={{ p: 1.5, bgcolor: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    onClick={handleToggleStatus}
                    sx={{
                      color: inc.status === 'OPEN' ? COLORS.critical : COLORS.info,
                      borderRadius: 0, fontFamily: '"Roboto Mono", monospace',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                    {inc.status === 'OPEN' ? 'Close Incident' : 'Reopen Incident'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || posting}
                    sx={{
                      bgcolor: COLORS.info, color: COLORS.bg, borderRadius: 0,
                      fontFamily: '"Roboto Mono", monospace', fontWeight: 700,
                      '&:hover': { bgcolor: COLORS.info },
                      '&.Mui-disabled': { bgcolor: COLORS.border, color: COLORS.border }
                    }}
                  >
                    {posting ? 'Posting…' : 'Comment'}
                  </Button>
                </Box>
              </Paper>
            </Box>

          </Grid>

          <Grid item xs={12} md={3}>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700, mb: 1 }}>
                AUTHOR
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: COLORS.surface, border: `1px solid ${COLORS.info}`, color: COLORS.info, fontSize: '0.7rem', borderRadius: 0 }}>
                  {inc.author_display.substring(0, 2).toUpperCase()}
                </Avatar>
                <Typography sx={{ color: COLORS.info, fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>{inc.author_display}</Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: COLORS.border, mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700, mb: 1 }}>
                STATUS
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={inc.status} size="small"
                  sx={{
                    bgcolor: inc.status === 'OPEN' ? 'rgba(255,0,60,0.1)' : 'rgba(212,255,0,0.1)',
                    color: inc.status === 'OPEN' ? COLORS.critical : COLORS.info,
                    border: `1px solid ${inc.status === 'OPEN' ? COLORS.critical : COLORS.info}`,
                    borderRadius: 0, fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem'
                  }}
                />
              </Box>
            </Box>

            {inc.device_label && (
              <>
                <Divider sx={{ borderColor: COLORS.border, mb: 3 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700, mb: 1 }}>
                    AFFECTED COMPONENT
                  </Typography>
                  <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, bgcolor: COLORS.critical, display: 'inline-block' }} />
                    {inc.device_label}
                  </Typography>
                </Box>
              </>
            )}

          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Discussions;
