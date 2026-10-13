import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Avatar } from '@/components/Avatar';
import { MenuButton } from '@/components/SideMenu';
import {
  MOCK_FREIGHTS,
  MOCK_DRIVER_PROPOSALS,
  MOCK_MISSIONS,
  DriverProposal,
} from '@/data/mockData';

function formatCFA(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' FCFA';
}

type TabType = 'all' | 'proposals' | 'tracking';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [proposals, setProposals] = useState<DriverProposal[]>(MOCK_DRIVER_PROPOSALS);

  const isCarrier = user?.activeAccount === 'carrier' && user?.carrier?.status === 'approved';

  // Expéditions actives
  const activeFreights = MOCK_FREIGHTS.filter(f => f.status !== 'delivered' && f.status !== 'cancelled');
  const inTransitFreight = MOCK_FREIGHTS.find(f => f.status === 'in_transit');

  const handleAcceptProposal = (proposal: DriverProposal) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Accepter la proposition',
      `Confirmez-vous le choix de ${proposal.driverName} pour ${formatCFA(proposal.amount)} ?\n\nLe paiement sera consigné de manière sécurisée jusqu\'à la livraison.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer & Payer',
          style: 'default',
          onPress: () => {
            setProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, status: 'accepted' } : p));
            router.push('/wallet');
          },
        },
      ]
    );
  };

  const handleRejectProposal = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  // ─── RENDU EXPÉDITEUR ────────────────────────────────────────────────────────
  if (!isCarrier) {
    const showTracking = activeTab === 'all' || activeTab === 'tracking';
    const showProposals = activeTab === 'all' || activeTab === 'proposals';

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header Bar */}
        <View style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? 20 : 12),
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}>
          <View style={styles.headerLeft}>
            <MenuButton />
            <View style={{ marginLeft: 8 }}>
              <Text style={[styles.headerGreeting, { color: colors.mutedForeground }]}>
                Espace Expéditeur
              </Text>
              <Text style={[styles.headerName, { color: colors.foreground }]} numberOfLines={1}>
                {user?.name ?? 'Kofi Mensah'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              style={[styles.walletBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '35' }]}
              onPress={() => router.push('/wallet')}
            >
              <Feather name="credit-card" size={14} color={colors.primary} />
              <Text style={[styles.walletAmount, { color: colors.primary }]}>
                {formatCFA(user?.shipper?.wallet?.balance ?? 245000)}
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/profile')}>
              <Avatar name={user?.name ?? 'U'} size={36} />
            </Pressable>
          </View>
        </View>

        {/* Tab Switcher: Distinction claire entre Propositions & Suivi Live */}
        <View style={[styles.tabBarContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScroll}>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setActiveTab('all'); }}
              style={[
                styles.tabPill,
                activeTab === 'all' && { backgroundColor: colors.foreground, borderColor: colors.foreground },
                activeTab !== 'all' && { backgroundColor: colors.muted, borderColor: 'transparent' },
              ]}
            >
              <Text style={[styles.tabPillText, { color: activeTab === 'all' ? colors.background : colors.mutedForeground }]}>
                Vue globale ({proposals.length + (inTransitFreight ? 1 : 0)})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => { Haptics.selectionAsync(); setActiveTab('proposals'); }}
              style={[
                styles.tabPill,
                activeTab === 'proposals' && { backgroundColor: '#FF5C00', borderColor: '#FF5C00' },
                activeTab !== 'proposals' && { backgroundColor: colors.muted, borderColor: 'transparent' },
              ]}
            >
              <MaterialCommunityIcons
                name="handshake"
                size={15}
                color={activeTab === 'proposals' ? '#FFF' : '#FF5C00'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.tabPillText, { color: activeTab === 'proposals' ? '#FFF' : colors.foreground }]}>
                Propositions chauffeurs ({proposals.length})
              </Text>
            </Pressable>

            {inTransitFreight && (
              <Pressable
                onPress={() => { Haptics.selectionAsync(); setActiveTab('tracking'); }}
                style={[
                  styles.tabPill,
                  activeTab === 'tracking' && { backgroundColor: '#10B981', borderColor: '#10B981' },
                  activeTab !== 'tracking' && { backgroundColor: colors.muted, borderColor: 'transparent' },
                ]}
              >
                <View style={[styles.tabPulseDot, { backgroundColor: activeTab === 'tracking' ? '#FFF' : '#10B981' }]} />
                <Text style={[styles.tabPillText, { color: activeTab === 'tracking' ? '#FFF' : '#10B981' }]}>
                  En livraison (1)
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
        >
          {/* ══════════════════════════════════════════════════════════════════
              UNIVER 1 : EXPÉDITION EN COURS DE LIVRAISON (SUIVI GPS DIRECT)
              ══════════════════════════════════════════════════════════════════ */}
          {showTracking && inTransitFreight && (
            <View style={styles.blockWrapper}>
              {/* En-tête de section distinctive avec badge LIVE */}
              <View style={[styles.blockHeaderBadge, { backgroundColor: '#10B98118', borderColor: '#10B98140' }]}>
                <View style={styles.livePulseContainer}>
                  <View style={[styles.livePulseRing, { backgroundColor: '#10B981' }]} />
                  <View style={[styles.livePulseCenter, { backgroundColor: '#10B981' }]} />
                </View>
                <Text style={[styles.blockHeaderBadgeText, { color: '#10B981' }]}>
                  EXPÉDITION EN COURS DE LIVRAISON
                </Text>
              </View>

              {/* Carte interactive Live Delivery */}
              <Pressable
                style={[
                  styles.deliveryLiveCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: '#10B981',
                    borderRadius: colors.radius,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push(`/shipper/tracking/${inTransitFreight.id}` as any);
                }}
              >
                {/* Trajet & État en temps réel */}
                <View style={styles.deliveryRouteRow}>
                  <View style={styles.routeCityBox}>
                    <View style={[styles.cityDot, { backgroundColor: '#10B981' }]} />
                    <Text style={[styles.deliveryCityName, { color: colors.foreground }]}>{inTransitFreight.origin}</Text>
                  </View>
                  <View style={styles.routeArrowBox}>
                    <View style={[styles.routeDashLine, { backgroundColor: colors.border }]} />
                    <MaterialCommunityIcons name="truck-fast" size={18} color="#10B981" />
                    <View style={[styles.routeDashLine, { backgroundColor: colors.border }]} />
                  </View>
                  <View style={styles.routeCityBox}>
                    <View style={[styles.cityDot, { backgroundColor: '#FF5C00' }]} />
                    <Text style={[styles.deliveryCityName, { color: colors.foreground }]}>{inTransitFreight.destination}</Text>
                  </View>
                </View>

                {/* Statut d'avancement et alerte arrêt */}
                <View style={[styles.stoppageAlertBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                  <MaterialCommunityIcons name="alert-octagon" size={16} color="#EF4444" />
                  <Text style={[styles.stoppageAlertText, { color: '#EF4444' }]}>
                    Arrêt détecté (15 min) · Contrôle de pesage à Yamoussoukro Sud
                  </Text>
                </View>

                {/* Chauffeur en charge & Bouton Suivi GPS */}
                <View style={styles.deliveryFooter}>
                  <View style={styles.driverAssignedRow}>
                    <Avatar name="Moussa Touré" size={38} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.driverAssignedName, { color: colors.foreground }]}>Moussa Touré</Text>
                      <Text style={[styles.driverAssignedVehicle, { color: colors.mutedForeground }]}>
                        Camion 5T · {inTransitFreight.cargo} (1 200 kg)
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.openGpsBtn, { backgroundColor: '#10B981' }]}>
                    <MaterialCommunityIcons name="map-marker-radius" size={17} color="#FFF" />
                    <Text style={styles.openGpsBtnText}>Suivre en direct sur la carte</Text>
                    <Feather name="chevron-right" size={16} color="#FFF" />
                  </View>
                </View>
              </Pressable>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              UNIVER 2 : PROPOSITIONS & DEVIS DES CHAUFFEURS (À SÉLECTIONNER)
              ══════════════════════════════════════════════════════════════════ */}
          {showProposals && (
            <View style={styles.blockWrapper}>
              {/* En-tête de section distinctive avec badge ORANGE */}
              <View style={[styles.blockHeaderBadge, { backgroundColor: '#FF5C0018', borderColor: '#FF5C0040' }]}>
                <MaterialCommunityIcons name="tag-outline" size={16} color="#FF5C00" />
                <Text style={[styles.blockHeaderBadgeText, { color: '#FF5C00' }]}>
                  PROPOSITIONS DES CHAUFFEURS ({proposals.length} EN ATTENTE)
                </Text>
              </View>

              <Text style={[styles.blockSubHint, { color: colors.mutedForeground }]}>
                Comparez les tarifs proposés, échangez avec les chauffeurs et validez le transporteur de votre choix.
              </Text>

              {proposals.length === 0 ? (
                <View style={[styles.emptyProposalsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="clock" size={34} color={colors.mutedForeground} />
                  <Text style={[styles.emptyTitle, { color: colors.foreground }]}>En attente de devis</Text>
                  <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                    Les transporteurs sont informés de vos annonces. Dès qu'un chauffeur soumet un devis, il apparaîtra ici.
                  </Text>
                </View>
              ) : (
                proposals.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.proposalItemCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: item.status === 'accepted' ? '#10B981' : colors.border,
                        borderRadius: colors.radius,
                      },
                    ]}
                  >
                    {/* Fret associé */}
                    <View style={[styles.proposalFreightBar, { backgroundColor: colors.muted }]}>
                      <Feather name="box" size={13} color={colors.primary} />
                      <Text style={[styles.proposalFreightTitle, { color: colors.foreground }]} numberOfLines={1}>
                        {item.freightCargo} · <Text style={{ fontWeight: '700' }}>{item.freightOrigin} → {item.freightDestination}</Text>
                      </Text>
                      <Text style={[styles.proposalTimeAgo, { color: colors.mutedForeground }]}>{item.createdAt}</Text>
                    </View>

                    {/* Fiche Chauffeur & Badge de Prix Remarquable */}
                    <View style={styles.proposalMainRow}>
                      <View style={styles.driverProfileLeft}>
                        <Avatar name={item.driverName} size={44} />
                        <View style={styles.proposalDriverDetails}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Text style={[styles.proposalDriverName, { color: colors.foreground }]}>
                              {item.driverName}
                            </Text>
                            <MaterialCommunityIcons name="check-decagram" size={15} color="#10B981" />
                          </View>
                          <View style={styles.driverRatingsRow}>
                            <Feather name="star" size={12} color="#FFB800" />
                            <Text style={[styles.ratingVal, { color: colors.foreground }]}>{item.driverRating}</Text>
                            <Text style={[styles.tripsCount, { color: colors.mutedForeground }]}>({item.driverTrips} trajets)</Text>
                          </View>
                        </View>
                      </View>

                      {/* Badge Prix Remarquable avec couleur de fond et icône d'argent */}
                      <View style={[styles.priceBadgeWrap, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '60' }]}>
                        <View style={styles.priceIconHeader}>
                          <MaterialCommunityIcons name="cash-multiple" size={15} color={colors.primary} />
                          <Text style={[styles.priceCurrencyLabel, { color: colors.primary }]}>Devis</Text>
                        </View>
                        <Text style={[styles.proposalPriceTag, { color: colors.primary }]}>
                          {formatCFA(item.amount)}
                        </Text>
                      </View>
                    </View>

                    {/* Description du Véhicule sur sa propre ligne dédiée (évite toute imbrication) */}
                    <View style={[styles.vehiclePillRow, { backgroundColor: colors.muted }]}>
                      <MaterialCommunityIcons name="truck-outline" size={15} color={colors.primary} />
                      <Text style={[styles.vehiclePillText, { color: colors.foreground }]}>
                        {item.vehicleType}
                      </Text>
                      <Text style={[styles.vehiclePlateText, { color: colors.mutedForeground }]}>
                        ({item.vehiclePlate})
                      </Text>
                    </View>

                    {/* Détails logistiques & Message */}
                    <View style={[styles.proposalLogisticsBox, { backgroundColor: colors.background, borderRadius: 8 }]}>
                      <View style={styles.logisticsRow}>
                        <Feather name="calendar" size={13} color={colors.mutedForeground} />
                        <Text style={[styles.logisticsText, { color: colors.foreground }]}>
                          Prise en charge : <Text style={{ fontWeight: '700' }}>{item.proposedPickupDate}</Text>
                        </Text>
                      </View>
                      {item.message ? (
                        <View style={styles.logisticsRow}>
                          <Feather name="message-square" size={13} color={colors.primary} />
                          <Text style={[styles.logisticsMsgText, { color: colors.mutedForeground }]} numberOfLines={2}>
                            "{item.message}"
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Actions sur la proposition : 1. Refuser | 2. Accepter (AU CENTRE) | 3. Négocier (À DROITE) */}
                    <View style={styles.proposalActionsRow}>
                      {/* 1. Bouton Refuser (Gauche) */}
                      <Pressable
                        style={styles.actionBtnRefuse}
                        onPress={() => handleRejectProposal(item.id)}
                      >
                        <Feather name="x" size={15} color="#EF4444" />
                        <Text style={styles.actionBtnRefuseText}>Refuser</Text>
                      </Pressable>

                      {/* 2. Bouton Accepter (AU CENTRE) */}
                      <Pressable
                        style={[
                          styles.actionBtnAccept,
                          {
                            backgroundColor: item.status === 'accepted' ? '#059669' : '#10B981',
                          },
                        ]}
                        onPress={() => handleAcceptProposal(item)}
                      >
                        <Feather
                          name={item.status === 'accepted' ? 'check' : 'check-circle'}
                          size={15}
                          color="#FFF"
                        />
                        <Text style={styles.actionBtnAcceptText}>
                          {item.status === 'accepted' ? 'Acceptée' : 'Accepter'}
                        </Text>
                      </Pressable>

                      {/* 3. Bouton Négocier (Droite) */}
                      <Pressable
                        style={styles.actionBtnNegotiate}
                        onPress={() => router.push('/chat/c1' as any)}
                      >
                        <Feather name="message-circle" size={15} color="#FFF" />
                        <Text style={styles.actionBtnNegotiateText}>Négocier</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Mes Annonces Récents */}
          {activeTab === 'all' && (
            <View style={styles.blockWrapper}>
              <View style={styles.sectionSimpleHeader}>
                <Text style={[styles.sectionSimpleTitle, { color: colors.foreground }]}>Mes annonces de fret</Text>
                <Pressable onPress={() => router.push('/(tabs)/freight')}>
                  <Text style={[styles.seeAllSimpleText, { color: colors.primary }]}>Voir tout ({activeFreights.length})</Text>
                </Pressable>
              </View>

              {activeFreights.slice(0, 2).map((f) => (
                <Pressable
                  key={f.id}
                  style={[styles.miniFreightRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/shipper/freight/${f.id}` as any)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.miniFreightRoute, { color: colors.foreground }]}>
                      {f.origin} → {f.destination}
                    </Text>
                    <Text style={[styles.miniFreightMeta, { color: colors.mutedForeground }]}>
                      {f.cargo} · {f.weight.toLocaleString()} kg · Budget : {formatCFA(f.budget)}
                    </Text>
                  </View>
                  <View style={[styles.offersCountBadge, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[styles.offersCountBadgeText, { color: colors.primary }]}>
                      {f.offersCount} devis
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={17} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button : Publier un fret */}
        <View style={[styles.fabContainer, { bottom: insets.bottom + (Platform.OS === 'web' ? 24 : 16) }]}>
          <Pressable
            style={[styles.publishFab, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/shipper/publish');
            }}
          >
            <Feather name="plus-circle" size={20} color="#FFF" />
            <Text style={styles.publishFabText}>Publier un nouveau fret</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── RENDU CHAUFFEUR / TRANSPORTEUR ──────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Chauffeur */}
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + (Platform.OS === 'web' ? 20 : 12),
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.headerGreeting, { color: colors.mutedForeground }]}>Espace Chauffeur</Text>
            <Text style={[styles.headerName, { color: colors.foreground }]} numberOfLines={1}>
              {user?.name ?? 'Transporteur'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={[styles.walletBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '35' }]}
            onPress={() => router.push('/wallet')}
          >
            <Feather name="credit-card" size={14} color={colors.primary} />
            <Text style={[styles.walletAmount, { color: colors.primary }]}>
              {formatCFA(user?.carrier?.wallet?.balance ?? 446250)}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/profile')}>
            <Avatar name={user?.name ?? 'U'} size={36} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
      >
        <View style={styles.carrierCtaCard}>
          <Pressable
            style={[styles.carrierSearchBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={() => router.push('/(tabs)/freight')}
          >
            <Feather name="search" size={20} color="#FFF" />
            <Text style={styles.carrierSearchText}>Rechercher et postuler à des frets</Text>
          </Pressable>
        </View>

        <View style={styles.blockWrapper}>
          <View style={styles.sectionSimpleHeader}>
            <Text style={[styles.sectionSimpleTitle, { color: colors.foreground }]}>Missions de transport disponibles</Text>
            <Pressable onPress={() => router.push('/(tabs)/freight')}>
              <Text style={[styles.seeAllSimpleText, { color: colors.primary }]}>Voir tout</Text>
            </Pressable>
          </View>

          {MOCK_MISSIONS.map((m) => (
            <Pressable
              key={m.id}
              style={[styles.miniFreightRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/carrier/mission/${m.id}` as any)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.miniFreightRoute, { color: colors.foreground }]}>
                  {m.origin} → {m.destination}
                </Text>
                <Text style={[styles.miniFreightMeta, { color: colors.mutedForeground }]}>
                  {m.cargo} · {m.weight.toLocaleString()} kg · Budget : {formatCFA(m.budget)}
                </Text>
              </View>
              <View style={[styles.actionBtnAccept, { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8 }]}>
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Postuler</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  headerName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  walletAmount: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  tabBarContainer: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  tabBarScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  tabPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  scrollContent: {
    padding: 16,
    gap: 22,
  },
  blockWrapper: {
    gap: 12,
  },
  blockHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  blockHeaderBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  blockSubHint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 17,
  },
  livePulseContainer: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  livePulseRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.4,
  },
  livePulseCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deliveryLiveCard: {
    borderWidth: 2,
    padding: 16,
    gap: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  deliveryRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeCityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '38%',
  },
  cityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  deliveryCityName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  routeArrowBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  routeDashLine: {
    flex: 1,
    height: 2,
  },
  stoppageAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  stoppageAlertText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
  },
  deliveryFooter: {
    gap: 12,
    paddingTop: 4,
  },
  driverAssignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAssignedName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  driverAssignedVehicle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  openGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  openGpsBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  emptyProposalsCard: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
  proposalItemCard: {
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  proposalFreightBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  proposalFreightTitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  proposalTimeAgo: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  proposalMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  driverProfileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  proposalDriverDetails: {
    flex: 1,
    gap: 3,
  },
  proposalDriverName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  driverRatingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingVal: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  tripsCount: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  vehiclePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  vehiclePillText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  vehiclePlateText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  priceBadgeWrap: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  priceIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceCurrencyLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
  },
  proposalPriceTag: {
    fontSize: 15,
    fontFamily: 'Inter_800ExtraBold',
  },
  proposalLogisticsBox: {
    padding: 10,
    gap: 6,
  },
  logisticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logisticsText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  logisticsMsgText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    flex: 1,
  },
  proposalActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    width: '100%',
  },
  actionBtnRefuse: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: '#EF444415',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  actionBtnRefuseText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  actionBtnNegotiate: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: '#2563EB',
  },
  actionBtnNegotiateText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  actionBtnAccept: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 9,
  },
  actionBtnAcceptText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter_800ExtraBold',
  },
  sectionSimpleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionSimpleTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  seeAllSimpleText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  miniFreightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  miniFreightRoute: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  miniFreightMeta: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  offersCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  offersCountBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  fabContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  publishFab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    shadowColor: '#FF5C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  publishFabText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  carrierCtaCard: {
    marginBottom: 10,
  },
  carrierSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
  },
  carrierSearchText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});
