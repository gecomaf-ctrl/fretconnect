import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const TOTAL = 6;

const VEHICLE_OPTIONS = ['Pick-up', 'Camionnette', 'Camion 3T', 'Camion 5T', 'Camion 10T', 'Semi-remorque'];
const CARGO_TYPES = ['Alimentaire', 'Matériaux', 'Électronique', 'Textile', 'Chimique', 'Autre'];

type SelectChipsProps = { options: string[]; value: string; onChange: (v: string) => void };

function SelectChips({ options, value, onChange }: SelectChipsProps) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => (
        <Pressable
          key={o}
          onPress={() => { onChange(o); Haptics.selectionAsync(); }}
          style={[styles.chip, { backgroundColor: value === o ? colors.primary : colors.input, borderRadius: 20 }]}
        >
          <Text style={[styles.chipText, { color: value === o ? '#FFF' : colors.foreground }]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function PublishFreightScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [published, setPublished] = useState(false);
  const [form, setForm] = useState({
    origin: '', destination: '', vehicleType: '',
    cargoType: '', weight: '', description: '', budget: '',
  });

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const goNext = () => {
    if (step < TOTAL) { setStep(s => s + 1); Haptics.selectionAsync(); }
    else { handlePublish(); }
  };

  const handlePublish = async () => {
    await new Promise(r => setTimeout(r, 800));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPublished(true);
  };

  const STEP_TITLES = [
    'Lieu de départ',
    'Destination',
    'Type de véhicule',
    'Marchandise',
    'Photos',
    'Récapitulatif',
  ];

  if (published) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.successScreen, { paddingTop: insets.top + 40 }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + '18' }]}>
            <Feather name="check-circle" size={56} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Fret publié !</Text>
          <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
            Votre fret a été publié avec succès. Les transporteurs vont commencer à soumettre leurs offres.
          </Text>
          <Button
            label="Voir mes frets"
            onPress={() => { router.dismissAll(); router.replace('/(tabs)/freight'); }}
            fullWidth size="lg"
          />
          <Button
            label="Retour à l'accueil"
            onPress={() => { router.dismissAll(); }}
            variant="ghost" fullWidth size="md"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}>
        <Pressable onPress={() => step > 1 ? setStep(s => s - 1) : router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.stepCount, { color: colors.mutedForeground }]}>{step}/{TOTAL}</Text>
          <Text style={[styles.stepTitle, { color: colors.foreground }]}>{STEP_TITLES[step - 1]}</Text>
        </View>
        <Pressable onPress={() => router.back()}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${(step / TOTAL) * 100}%` as any }]} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 120 }]} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <View style={styles.fields}>
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              <Feather name="map-pin" size={32} color={colors.primary} />
              <Text style={[styles.mapHint, { color: colors.mutedForeground }]}>Sélectionnez le point de départ sur la carte</Text>
            </View>
            <Input label="Adresse de départ" value={form.origin} onChangeText={set('origin')} placeholder="Abidjan, Plateau, Rue des Jardins" icon="map-pin" />
          </View>
        )}
        {step === 2 && (
          <View style={styles.fields}>
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              <Feather name="navigation" size={32} color={colors.primary} />
              <Text style={[styles.mapHint, { color: colors.mutedForeground }]}>Sélectionnez la destination sur la carte</Text>
            </View>
            <Input label="Adresse de destination" value={form.destination} onChangeText={set('destination')} placeholder="Bouaké, Marché Central" icon="navigation" />
          </View>
        )}
        {step === 3 && (
          <View style={styles.fields}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Type de véhicule souhaité</Text>
            <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>Choisissez le type de véhicule adapté à votre marchandise</Text>
            <SelectChips options={VEHICLE_OPTIONS} value={form.vehicleType} onChange={set('vehicleType')} />
          </View>
        )}
        {step === 4 && (
          <View style={styles.fields}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Type de marchandise</Text>
            <SelectChips options={CARGO_TYPES} value={form.cargoType} onChange={set('cargoType')} />
            <Input label="Poids (kg)" value={form.weight} onChangeText={set('weight')} placeholder="2500" icon="package" keyboardType="numeric" />
            <Input label="Description" value={form.description} onChangeText={set('description')} placeholder="Décrivez votre marchandise..." multiline numberOfLines={3} />
            <Input label="Budget proposé (FCFA)" value={form.budget} onChangeText={set('budget')} placeholder="150 000" icon="credit-card" keyboardType="numeric" />
          </View>
        )}
        {step === 5 && (
          <View style={styles.fields}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Photos de la marchandise</Text>
            <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>Ajoutez des photos pour rassurer les transporteurs (optionnel)</Text>
            <Pressable style={[styles.photoAdd, { backgroundColor: colors.input, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Feather name="camera" size={28} color={colors.primary} />
              <Text style={[styles.photoText, { color: colors.primary }]}>Ajouter des photos</Text>
            </Pressable>
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Vous pouvez ignorer cette étape</Text>
          </View>
        )}
        {step === 6 && (
          <View style={styles.fields}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Vérifiez votre fret</Text>
            {[
              { label: 'Départ', value: form.origin || 'Non renseigné' },
              { label: 'Destination', value: form.destination || 'Non renseigné' },
              { label: 'Véhicule', value: form.vehicleType || 'Non renseigné' },
              { label: 'Marchandise', value: form.cargoType || 'Non renseigné' },
              { label: 'Poids', value: form.weight ? `${form.weight} kg` : 'Non renseigné' },
              { label: 'Budget', value: form.budget ? `${parseInt(form.budget, 10).toLocaleString('fr-FR')} FCFA` : 'Non renseigné' },
            ].map(r => (
              <View key={r.label} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{r.value}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16), backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button label={step === TOTAL ? 'Publier le fret' : 'Suivant'} onPress={goNext} fullWidth size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  stepCount: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  stepTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  progressTrack: { height: 3 },
  progressFill: { height: 3 },
  form: { padding: 20 },
  fields: { gap: 16 },
  mapPlaceholder: {
    height: 160, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  mapHint: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  fieldLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  fieldHint: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, marginTop: -8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  photoAdd: {
    height: 140, borderWidth: 1.5, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  photoText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  skipText: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  summaryLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  summaryValue: { fontSize: 14, fontFamily: 'Inter_500Medium', maxWidth: '55%', textAlign: 'right' },
  bottomBar: { padding: 16, borderTopWidth: 1 },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  successSubtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 24 },
});
