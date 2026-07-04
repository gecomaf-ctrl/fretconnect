import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatusType =
  | 'published' | 'offers_received' | 'carrier_selected' | 'in_transit' | 'delivered' | 'cancelled'
  | 'available' | 'offer_sent' | 'accepted' | 'in_progress' | 'completed'
  | 'pending' | 'corrections' | 'approved' | 'rejected' | 'none';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  published: { label: 'Publié', color: '#3B82F6' },
  offers_received: { label: 'Offres reçues', color: '#8B5CF6' },
  carrier_selected: { label: 'Transporteur choisi', color: '#F59E0B' },
  in_transit: { label: 'En transit', color: '#FF5C00' },
  delivered: { label: 'Livré', color: '#10B981' },
  cancelled: { label: 'Annulé', color: '#EF4444' },
  available: { label: 'Disponible', color: '#3B82F6' },
  offer_sent: { label: 'Offre envoyée', color: '#8B5CF6' },
  accepted: { label: 'Accepté', color: '#F59E0B' },
  in_progress: { label: 'En cours', color: '#FF5C00' },
  completed: { label: 'Terminé', color: '#10B981' },
  pending: { label: 'En attente', color: '#F59E0B' },
  corrections: { label: 'Corrections', color: '#FF5C00' },
  approved: { label: 'Validé', color: '#10B981' },
  rejected: { label: 'Refusé', color: '#EF4444' },
  none: { label: 'Expéditeur', color: '#6B7280' },
};

interface StatusBadgeProps {
  status: StatusType;
  small?: boolean;
}

export function StatusBadge({ status, small }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: '#6B7280' };
  return (
    <View style={[styles.badge, { backgroundColor: config.color + '22' }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color, fontSize: small ? 11 : 12 }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontFamily: 'Inter_500Medium' },
});
