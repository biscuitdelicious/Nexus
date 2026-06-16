import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fetchLocations, createSensor } from '../../services/api';
import { COLORS } from '../theme';

const initialForm = {
  name: '',
  sensorNo: '',
  locationId: '',
  unit: '°C',
  lowerLimit: '',
  upperLimit: '',
};

const UNIT_OPTIONS = ['°C', '%', 'Mbps', 'ms', 'V', 'A'];

export default function AddDeviceModal({ visible, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [locations, setLocations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    fetchLocations().then((list) => {
      if (cancelled) return;
      setLocations(list);
      if (list.length) {
        setForm((f) => ({ ...f, locationId: String(list[0].id) }));
      }
    });
    return () => { cancelled = true; };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setForm(initialForm);
      setError('');
      setSubmitting(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim() || !form.sensorNo.trim() || !form.locationId) {
      setError('Name, Sensor No, and Location are required');
      return;
    }
    setSubmitting(true);
    const result = await createSensor(form);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message || 'Create failed');
      return;
    }
    onCreated?.(result.sensor);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Add New Device</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Field label="NAME" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />
            <Field label="SENSOR NO" value={form.sensorNo} onChangeText={(v) => setForm((f) => ({ ...f, sensorNo: v }))} />
            <Text style={styles.label}>LOCATION</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={form.locationId}
                onValueChange={(v) => setForm((f) => ({ ...f, locationId: v }))}
                style={styles.picker}
                dropdownIconColor={COLORS.textMuted}
              >
                {locations.map((loc) => (
                  <Picker.Item key={loc.id} label={loc.name} value={String(loc.id)} color={COLORS.text} />
                ))}
              </Picker>
            </View>
            <Text style={styles.label}>UNIT</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={form.unit}
                onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                style={styles.picker}
              >
                {UNIT_OPTIONS.map((u) => (
                  <Picker.Item key={u} label={u} value={u} color={COLORS.text} />
                ))}
              </Picker>
            </View>
            <View style={styles.row}>
              <Field label="LOWER LIMIT" value={form.lowerLimit} keyboardType="numeric" onChangeText={(v) => setForm((f) => ({ ...f, lowerLimit: v }))} flex />
              <Field label="UPPER LIMIT" value={form.upperLimit} keyboardType="numeric" onChangeText={(v) => setForm((f) => ({ ...f, upperLimit: v }))} flex />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable style={styles.btn} onPress={onClose} disabled={submitting}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={COLORS.bg} />
              ) : (
                <Text style={[styles.btnText, styles.btnTextPrimary]}>CREATE</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChangeText, keyboardType, flex }) {
  return (
    <View style={flex ? styles.flex : null}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={COLORS.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  title: { color: COLORS.text, fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 18, marginBottom: 12 },
  label: { color: COLORS.textMuted, fontSize: 10, fontFamily: 'monospace', letterSpacing: 1, marginTop: 8, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontFamily: 'monospace',
    padding: 10,
    fontSize: 14,
  },
  pickerWrap: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  picker: { color: COLORS.text },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  error: { color: COLORS.critical, fontFamily: 'monospace', fontSize: 12, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderColor: COLORS.border },
  btn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, padding: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: COLORS.info, borderColor: COLORS.info },
  btnText: { color: COLORS.text, fontFamily: 'monospace', fontWeight: '700', fontSize: 12 },
  btnTextPrimary: { color: COLORS.bg },
});
