import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { useResponsive } from '../../hooks/useResponsive';
import { mockIncidents } from '../../data/mockIncidents';
import { COLORS } from '../theme';

export default function DiscussionsScreen() {
  const { padding, gap } = useResponsive();
  const [incidentsList, setIncidentsList] = useState(mockIncidents);
  const [selectedId, setSelectedId] = useState(null);
  const [newComment, setNewComment] = useState('');

  const selectedIncident = selectedId
    ? incidentsList.find((inc) => inc.id === selectedId) || null
    : null;

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedIncident) return;
    const comment = {
      id: Date.now(),
      author: 'current_user',
      time: 'just now',
      text: newComment,
      isSystem: false,
    };
    setIncidentsList((prev) =>
      prev.map((inc) =>
        inc.id === selectedIncident.id
          ? { ...inc, comments: [...inc.comments, comment] }
          : inc
      )
    );
    setNewComment('');
  };

  const handleToggleStatus = () => {
    if (!selectedIncident) return;
    const nextStatus = selectedIncident.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
    const systemEntry = {
      id: Date.now(),
      author: 'NEXUS_SYSTEM',
      time: 'just now',
      text: `Incident status changed to ${nextStatus} by [current_user].`,
      isSystem: true,
    };
    setIncidentsList((prev) =>
      prev.map((inc) =>
        inc.id === selectedIncident.id
          ? { ...inc, status: nextStatus, comments: [...inc.comments, systemEntry] }
          : inc
      )
    );
  };

  if (!selectedIncident) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ padding, paddingBottom: padding + 24, gap }}
      >
        <ScreenHeader
          title="Incident Discussions"
          subtitle="Forum for investigating system alarms"
          icon="people-outline"
        />
        {incidentsList.map((inc) => (
          <Pressable key={inc.id} style={styles.listItem} onPress={() => setSelectedId(inc.id)}>
            <Ionicons
              name={inc.status === 'OPEN' ? 'alert-circle' : 'checkmark-circle'}
              size={22}
              color={inc.status === 'OPEN' ? COLORS.critical : COLORS.info}
            />
            <View style={styles.listBody}>
              <Text style={styles.listTitle}>
                {inc.title} <Text style={styles.listId}>{inc.id}</Text>
              </Text>
              <Text style={styles.listMeta}>
                {inc.author} · {inc.createdAt} · {inc.device}
              </Text>
            </View>
            <View style={styles.commentCount}>
              <Ionicons name="chatbubbles-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.countText}>{inc.comments.length}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding, paddingBottom: padding + 32, gap }}
    >
      <Pressable style={styles.back} onPress={() => setSelectedId(null)}>
        <Ionicons name="arrow-back" size={16} color={COLORS.textMuted} />
        <Text style={styles.backText}>Back to Discussions</Text>
      </Pressable>

      <Text style={styles.detailTitle}>
        {selectedIncident.title} <Text style={styles.listId}>{selectedIncident.id}</Text>
      </Text>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusChip,
            {
              borderColor: selectedIncident.status === 'OPEN' ? COLORS.critical : COLORS.info,
              backgroundColor:
                selectedIncident.status === 'OPEN'
                  ? 'rgba(248,81,73,0.1)'
                  : 'rgba(88,166,255,0.1)',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: selectedIncident.status === 'OPEN' ? COLORS.critical : COLORS.info },
            ]}
          >
            {selectedIncident.status}
          </Text>
        </View>
        <Text style={styles.listMeta}>
          {selectedIncident.author} · {selectedIncident.createdAt} · {selectedIncident.comments.length} comments
        </Text>
      </View>

      <View style={styles.threadCard}>
        <Text style={styles.threadAuthor}>{selectedIncident.author} reported</Text>
        <Text style={styles.threadBody}>{selectedIncident.description}</Text>
      </View>

      {selectedIncident.comments.map((comment) =>
        comment.isSystem ? (
          <View key={comment.id} style={styles.systemComment}>
            <Ionicons name="settings-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.systemText}>
              {comment.text} — {comment.time}
            </Text>
          </View>
        ) : (
          <View key={comment.id} style={styles.commentCard}>
            <Text style={styles.commentAuthor}>{comment.author}</Text>
            <Text style={styles.commentTime}>{comment.time}</Text>
            <Text style={styles.commentBody}>{comment.text}</Text>
          </View>
        )
      )}

      <View style={styles.compose}>
        <Text style={styles.label}>Write a response</Text>
        <TextInput
          style={styles.composeInput}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Leave a comment"
          placeholderTextColor={COLORS.textMuted}
          multiline
        />
        <View style={styles.composeActions}>
          <Pressable onPress={handleToggleStatus}>
            <Text
              style={[
                styles.toggleStatus,
                { color: selectedIncident.status === 'OPEN' ? COLORS.critical : COLORS.info },
              ]}
            >
              {selectedIncident.status === 'OPEN' ? 'Close Incident' : 'Reopen Incident'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.commentBtn, !newComment.trim() && styles.commentBtnDisabled]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Text style={styles.commentBtnText}>Comment</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 14,
    marginBottom: 8,
  },
  listBody: { flex: 1 },
  listTitle: { color: COLORS.text, fontFamily: 'monospace', fontWeight: '700', fontSize: 13 },
  listId: { color: COLORS.textMuted, fontWeight: '400' },
  listMeta: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 11, marginTop: 4 },
  commentCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countText: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 12 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  backText: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 12 },
  detailTitle: {
    color: COLORS.text,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontSize: 20,
    marginBottom: 8,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 },
  statusChip: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  threadCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 12,
    marginBottom: 12,
  },
  threadAuthor: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 11, marginBottom: 8 },
  threadBody: { color: COLORS.text, fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  systemComment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
    paddingLeft: 4,
  },
  systemText: { flex: 1, color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
  commentCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 12,
    marginBottom: 10,
  },
  commentAuthor: { color: COLORS.text, fontFamily: 'monospace', fontWeight: '700', fontSize: 12 },
  commentTime: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 10, marginBottom: 6 },
  commentBody: { color: COLORS.text, fontFamily: 'monospace', fontSize: 13, lineHeight: 18 },
  compose: {
    borderWidth: 1,
    borderColor: COLORS.info,
    backgroundColor: COLORS.surface,
    marginTop: 8,
  },
  label: {
    color: COLORS.info,
    fontFamily: 'monospace',
    fontSize: 11,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  composeInput: {
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 13,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  composeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  toggleStatus: { fontFamily: 'monospace', fontSize: 12 },
  commentBtn: { backgroundColor: COLORS.info, paddingHorizontal: 16, paddingVertical: 8 },
  commentBtnDisabled: { backgroundColor: COLORS.border },
  commentBtnText: { color: COLORS.bg, fontFamily: 'monospace', fontWeight: '700', fontSize: 12 },
});
