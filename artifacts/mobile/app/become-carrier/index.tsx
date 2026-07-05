import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const TOTAL_STEPS = 7;

const STEP_TITLES = [
  'Informations personnelles',
  "Pièce d'identité",
  'Permis de conduire',
  'Informations du véhicule',
  'Documents du véhicule',
  "Documents d'entreprise",
  'Récapitulatif',
];

const VEHICLE_TYPES = ['Pick-up', 'Camionnette', 'Camion 3T', 'Camion 5T', 'Camion 10T', 'Semi-remorque'];
const ID_TYPES = ["Carte nationale d'identité", 'Passeport', 'Titre de séjour'];
const LICENSE_CATEGORIES = ['B', 'C', 'D', 'CE', 'DE'];

interface FormData {
  firstName: string; lastName: string; phone: string; email: string; address: string;
  idType: string; idNumber: string; idExpiry: string;
  licenseNumber: string; licenseCategory: string; licenseExpiry: string;
  vehicleType: string; vehicleBrand: string; vehicleModel: string; vehicleYear: string;
  vehiclePlate: string; vehiclePayload: string;
  companyName: string; rccm: string;
}

type SelectChipsProps = { options: string[]; value: string; onChange: (v: string) => void };

function SelectChips({ options, value, onChange }: SelectChipsProps) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => (
        <Pressable
          key={o}
          onPress={() => { onChange(o); Haptics.selectionAsync(); }}
          style={[
            styles.chip,
            {
              backgroundColor: value === o ? colors.primary : colors.input,
              borderRadius: 20,
            },
          ]}
        >
          <Text style={[styles.chipText, { color: value === o ? '#FFF' : colors.foreground }]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function DocUploadPlaceholder({ label }: { label: string }) {
  const colors = useColors();
  return (
    <Pressable style={[styles.docUpload, { backgroundColor: colors.input, borderColor: colors.border, borderRadius: colors.radius }]}>
      <Feather name="upload-cloud" size={22} color={colors.mutedForeground} />
      <Text style={[styles.docLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.docHint, { color: colors.mutedForeground }]}>JPG, PNG ou PDF</Text>
    </Pressable>
  );
}

export default function BecomeCarrierScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { submitCarrierRequest } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', phone: '', email: '', address: '',
    idType: '', idNumber: '', idExpiry: '',
    licenseNumber: '', licenseCategory: '', licenseExpiry: '',
    vehicleType: '', vehicleBrand: '', vehicleModel: '', vehicleYear: '', vehiclePlate: '', vehiclePayload: '',
    companyName: '', rccm: '',
  });

  const set = (key: keyof FormData) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const goNext = () => {
    if (step < TOTAL_STEPS) { setStep(s => s + 1); Haptics.selectionAsync(); }
    else { handleSubmit(); }
  };

  const goBack = () => {
    if (step > 1) setStep(s => s - 1);
    else router.back();
  };

  const handleSubmit = () => {
    submitCarrierRequest();
    setSubmitted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.successScreen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.warning + '18' }]}>
            <MaterialCommunityIcons name="clock-outline" size={56} color={colors.warning} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Demande soumise</Text>
          <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
            Votre demande est en cours de vérification par notre équipe. Vous recevrez une notification dès que votre dossier sera traité.
          </Text>
          <View style={[styles.statusCard, { backgroundColor: colors.warning + '12', borderRadius: colors.radius }]}>
            <Feather name="clock" size={18} color={colors.warning} />
            <Text style={[styles.statusText, { color: colors.warning }]}>En attente de validation</Text>
          </View>
          <Button
            label="Retour à l'accueil"
            onPress={() => { router.dismissAll(); router.replace('/(tabs)'); }}
            fullWidth
            size="lg"
            style={{ marginTop: 16 }}
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
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.stepCount, { color: colors.mutedForeground }]}>Étape {step}/{TOTAL_STEPS}</Text>
          <Text style={[styles.stepTitle, { color: colors.foreground }]}>{STEP_TITLES[step - 1]}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${(step / TOTAL_STEPS) * 100}%` as any }]} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <View style={styles.fields}>
            <Input label="Prénom" value={form.firstName} onChangeText={set('firstName')} placeholder="Kofi" icon="user" autoCapitalize="words" />
            <Input label="Nom" value={form.lastName} onChangeText={set('lastName')} placeholder="Mensah" icon="user" autoCapitalize="words" />
            <Input label="Téléphone" value={form.phone} onChangeText={set('phone')} placeholder="+225 07 00 00 00" icon="phone" keyboardType="phone-pad" />
            <Input label="Email" value={form.email} onChangeText={set('email')} placeholder="votre@email.com" icon="mail" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Adresse" value={form.address} onChangeText={set('address')} placeholder="Abidjan, Cocody" icon="map-pin" />
          </View>
        )}
        {step === 2 && (
          <View style={styles.fields}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Type de document</Text>
            <SelectChips options={ID_TYPES} value={form.idType} onChange={set('idType')} />
            <Input label="Numéro" value={form.idNumber} onChangeText={set('idNumber')} placeholder="CI-123456789" icon="credit-card" />
            <Input label="Date d'expiration" value={form.idExpiry} onChangeText={set('idExpiry')} placeholder="JJ/MM/AAAA" icon="calendar" />
            <DocUploadPlaceholder label="Photo de la pièce d'identité (recto/verso)" />
          </View>
        )}
        {step === 3 && (
          <View style={styles.fields}>
            <Input label="Numéro de permis" value={form.licenseNumber} onChangeText={set('licenseNumber')} placeholder="123456789" icon="award" />
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Catégorie</Text>
            <SelectChips options={LICENSE_CATEGORIES} value={form.licenseCategory} onChange={set('licenseCategory')} />
            <Input label="Date d'expiration" value={form.licenseExpiry} onChangeText={set('licenseExpiry')} placeholder="JJ/MM/AAAA" icon="calendar" />
            <DocUploadPlaceholder label="Photo du permis de conduire" />
          </View>
        )}
        {step === 4 && (
          <View style={styles.fields}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Type de véhicule</Text>
            <SelectChips options={VEHICLE_TYPES} value={form.vehicleType} onChange={set('vehicleType')} />
            <Input label="Marque" value={form.vehicleBrand} onChangeText={set('vehicleBrand')} placeholder="Mercedes, MAN, Renault..." icon="truck" autoCapitalize="words" />
            <Input label="Modèle" value={form.vehicleModel} onChangeText={set('vehicleModel')} placeholder="Actros, TGX..." icon="truck" />
            <Input label="Année" value={form.vehicleYear} onChangeText={set('vehicleYear')} placeholder="2018" icon="calendar" keyboardType="number-pad" maxLength={4} />
            <Input label="Immatriculation" value={form.vehiclePlate} onChangeText={set('vehiclePlate')} placeholder="AB 1234 CD" icon="hash" autoCapitalize="characters" />
            <Input label="Charge utile (kg)" value={form.vehiclePayload} onChangeText={set('vehiclePayload')} placeholder="5000" icon="package" keyboardType="number-pad" />
          </View>
        )}
        {step === 5 && (
          <View style={styles.fields}>
            <DocUploadPlaceholder label="Carte grise du véhicule" />
            <DocUploadPlaceholder label="Attestation d'assurance" />
            <DocUploadPlaceholder label="Visite technique (si applicable)" />
            <DocUploadPlaceholder label="Photos du véhicule (3 minimum)" />
          </View>
        )}
        {step === 6 && (
          <View style={styles.fields}>
            <Text style={[styles.optionalNote, { color: colors.mutedForeground, backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              Cette étape est optionnelle. Si vous exercez en tant qu'entreprise, veuillez fournir vos documents.
            </Text>
            <Input label="Nom de l'entreprise (optionnel)" value={form.companyName} onChangeText={set('companyName')} placeholder="Mon Transport SARL" icon="briefcase" />
            <Input label="RCCM (optionnel)" value={form.rccm} onChangeText={set('rccm')} placeholder="CI-ABJ-2020-B-12345" icon="file-text" />
            <DocUploadPlaceholder label="Attestation fiscale (optionnel)" />
            <DocUploadPlaceholder label="Autres documents (optionnel)" />
          </View>
        )}
        {step === 7 && (
          <View style={styles.fields}>
            <Text style={[styles.summaryNote, { color: colors.mutedForeground }]}>
              Vérifiez vos informations avant de soumettre votre demande.
            </Text>
            {[
              { label: 'Nom complet', value: `${form.firstName} ${form.lastName}` },
              { label: 'Téléphone', value: form.phone },
              { label: 'Type de véhicule', value: form.vehicleType },
              { label: 'Immatriculation', value: form.vehiclePlate },
            ].map(r => (
              <View key={r.label} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{r.value || '—'}</Text>
              </View>
            ))}
            <View style={[styles.termsBox, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              <Feather name="info" size={16} color={colors.mutedForeground} />
              <Text style={[styles.termsText, { color: colors.mutedForeground }]}>
                En soumettant, vous acceptez d'être vérifié par notre équipe et que vos documents soient examinés.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={[
        styles.bottomBar,
        { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16), backgroundColor: colors.card, borderTopColor: colors.border },
      ]}>
        {step > 1 && (
          <Button label="Précédent" onPress={goBack} variant="secondary" size="md" style={styles.prevBtn} />
        )}
        <Button
          label={step === TOTAL_STEPS ? 'Soumettre ma demande' : 'Suivant'}
          onPress={goNext}
          size="md"
          style={step > 1 ? styles.nextBtnSmall : styles.nextBtnFull}
        />
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
  backBtn: { padding: 6 },
  headerCenter: { alignItems: 'center', flex: 1 },
  stepCount: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  stepTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  progressTrack: { height: 3 },
  progressFill: { height: 3 },
  form: { padding: 20 },
  fields: { gap: 16 },
  fieldLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  chip: { paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  docUpload: {
    borderWidth: 1.5, borderStyle: 'dashed', padding: 20,
    alignItems: 'center', gap: 8,
  },
  docLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  docHint: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  optionalNote: { fontSize: 13, fontFamily: 'Inter_400Regular', padding: 12, lineHeight: 20 },
  summaryNote: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  summaryLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  summaryValue: { fontSize: 14, fontFamily: 'Inter_500Medium', maxWidth: '60%', textAlign: 'right' },
  termsBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, marginTop: 8 },
  termsText: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },
  bottomBar: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 16,
    borderTopWidth: 1,
  },
  prevBtn: { flex: 1 },
  nextBtnSmall: { flex: 2 },
  nextBtnFull: { flex: 1 },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  successSubtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 24 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, width: '100%', justifyContent: 'center' },
  statusText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
