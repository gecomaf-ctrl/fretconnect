import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Image, Alert,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import NativeMap from '@/components/NativeMap';

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
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    origin: '', destination: '', vehicleType: '',
    cargoType: '', weight: '', description: '', budget: '',
  });

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted' && Platform.OS !== 'web') {
        Alert.alert('Permission requise', "L'accès à l'appareil photo est nécessaire pour prendre une photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.5,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos(prev => [...prev, result.assets[0].uri]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.warn('Error launching camera:', error);
      Alert.alert('Erreur', "Impossible d'accéder à l'appareil photo.");
    }
  };

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted' && Platform.OS !== 'web') {
        Alert.alert('Permission requise', "L'accès à la galerie photo est nécessaire pour importer des images.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map(a => a.uri);
        setPhotos(prev => [...prev, ...uris]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.warn('Error launching gallery:', error);
      Alert.alert('Erreur', "Impossible d'accéder à la galerie.");
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    Haptics.selectionAsync();
  };

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
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.muted, borderRadius: colors.radius, overflow: 'hidden' }]}>
              <NativeMap initialRegion={{ latitude: 5.3484, longitude: -4.0186 }} />
              <View style={[styles.mapBadgeOverlay, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="map-pin" size={14} color={colors.primary} />
                <Text style={[styles.mapBadgeText, { color: colors.foreground }]}>Point de départ (Abidjan)</Text>
              </View>
            </View>
            <Input label="Adresse de départ" value={form.origin} onChangeText={set('origin')} placeholder="Abidjan, Plateau, Rue des Jardins" icon="map-pin" />
          </View>
        )}
        {step === 2 && (
          <View style={styles.fields}>
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.muted, borderRadius: colors.radius, overflow: 'hidden' }]}>
              <NativeMap initialRegion={{ latitude: 7.6905, longitude: -5.0404 }} />
              <View style={[styles.mapBadgeOverlay, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="navigation" size={14} color={colors.primary} />
                <Text style={[styles.mapBadgeText, { color: colors.foreground }]}>Destination (Bouaké / Intérieur)</Text>
              </View>
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
            
            {/* Action Buttons */}
            <View style={styles.photoActionsRow}>
              <Pressable
                onPress={takePhotoWithCamera}
                style={[styles.photoActionBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              >
                <Feather name="camera" size={22} color={colors.primary} />
                <Text style={[styles.photoActionText, { color: colors.foreground }]}>Appareil photo</Text>
              </Pressable>
              <Pressable
                onPress={pickFromGallery}
                style={[styles.photoActionBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              >
                <Feather name="image" size={22} color={colors.primary} />
                <Text style={[styles.photoActionText, { color: colors.foreground }]}>Galerie photos</Text>
              </Pressable>
            </View>

            {/* Photos Preview Grid */}
            {photos.length > 0 ? (
              <View style={styles.photosContainer}>
                <Text style={[styles.photoCountText, { color: colors.mutedForeground }]}>
                  {photos.length} photo{photos.length > 1 ? 's' : ''} ajoutée{photos.length > 1 ? 's' : ''}
                </Text>
                <View style={styles.photosGrid}>
                  {photos.map((uri, index) => (
                    <View key={`${uri}-${index}`} style={[styles.photoThumbWrapper, { borderColor: colors.border }]}>
                      <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                      <Pressable
                        style={[styles.removePhotoBadge, { backgroundColor: colors.destructive }]}
                        onPress={() => removePhoto(index)}
                      >
                        <Feather name="x" size={14} color="#FFF" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Pressable
                onPress={pickFromGallery}
                style={[styles.photoAdd, { backgroundColor: colors.input, borderColor: colors.border, borderRadius: colors.radius }]}
              >
                <Feather name="upload-cloud" size={32} color={colors.primary} />
                <Text style={[styles.photoText, { color: colors.primary }]}>Ajouter des photos</Text>
                <Text style={[styles.photoSubtext, { color: colors.mutedForeground }]}>JPG, PNG depuis votre appareil ou galerie</Text>
              </Pressable>
            )}

            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Vous pouvez ignorer cette étape si vous n'avez pas de photos.</Text>
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
              { label: 'Photos', value: photos.length > 0 ? `${photos.length} photo(s) jointe(s)` : 'Aucune photo' },
            ].map(r => (
              <View key={r.label} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{r.value}</Text>
              </View>
            ))}

            {photos.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground, marginBottom: 8 }]}>Aperçu des photos :</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {photos.map((uri, idx) => (
                    <Image key={idx} source={{ uri }} style={{ width: 70, height: 70, borderRadius: 8 }} />
                  ))}
                </ScrollView>
              </View>
            )}
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
    height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  mapBadgeOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  mapBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  fieldLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  fieldHint: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, marginTop: -8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 8,
  },
  photoActionText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  photoAdd: {
    height: 130,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  photoSubtext: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  photosContainer: {
    gap: 10,
    marginTop: 4,
  },
  photoCountText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoThumbWrapper: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  removePhotoBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
