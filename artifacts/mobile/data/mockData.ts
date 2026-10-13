export interface Freight {
  id: string;
  origin: string;
  destination: string;
  cargo: string;
  weight: number;
  distance: number;
  budget: number;
  status: 'published' | 'offers_received' | 'carrier_selected' | 'in_transit' | 'delivered' | 'cancelled';
  date: string;
  vehicleType: string;
  offersCount: number;
  ownerId: string;
  ownerName: string;
  /** Code shared by the shipper with the recipient for delivery confirmation. */
  deliveryCode?: string;
}

export interface Mission extends Freight {
  myOfferAmount?: number;
  missionStatus: 'available' | 'offer_sent' | 'accepted' | 'in_progress' | 'completed';
  /** 6-digit code generated when mission is accepted; shared by shipper → recipient */
  deliveryCode?: string;
}

export interface Conversation {
  id: string;
  participantName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  freightLabel: string;
  isOnline: boolean;
}

export interface DriverProposal {
  id: string;
  freightId: string;
  freightOrigin: string;
  freightDestination: string;
  freightCargo: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  driverTrips: number;
  vehicleType: string;
  vehiclePlate: string;
  amount: number;
  proposedPickupDate: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface TripStop {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  startTime: string;
  durationMinutes: number;
  isCurrentStop: boolean;
  reason: 'toll' | 'rest' | 'inspection' | 'fuel' | 'unplanned';
  reasonLabel: string;
}

export interface AppNotification {
  id: string;
  type: 'offer' | 'accepted' | 'rejected' | 'kyc' | 'payment' | 'delivery' | 'message';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'commission';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

export const MOCK_DRIVER_PROPOSALS: DriverProposal[] = [
  {
    id: 'prop_1',
    freightId: 'f1',
    freightOrigin: 'Abidjan, Plateau',
    freightDestination: 'Bouaké Centre',
    freightCargo: 'Produits alimentaires (2.5T)',
    driverId: 'drv_1',
    driverName: 'Moussa Touré',
    driverPhone: '+225 07 55 12 34',
    driverRating: 4.8,
    driverTrips: 142,
    vehicleType: 'Camion 5T',
    vehiclePlate: '1234 AB 01',
    amount: 165000,
    proposedPickupDate: "Aujourd'hui à 14h00",
    message: 'Bonjour, mon camion est bâché et libre à Treichville. Prêt à charger.',
    status: 'pending',
    createdAt: 'Il y a 10 min',
  },
  {
    id: 'prop_2',
    freightId: 'f1',
    freightOrigin: 'Abidjan, Plateau',
    freightDestination: 'Bouaké Centre',
    freightCargo: 'Produits alimentaires (2.5T)',
    driverId: 'drv_2',
    driverName: 'Ibrahim Coulibaly',
    driverPhone: '+225 05 44 89 20',
    driverRating: 4.6,
    driverTrips: 87,
    vehicleType: 'Camion 5T Plateau',
    vehiclePlate: '5678 GH 01',
    amount: 175000,
    proposedPickupDate: "Aujourd'hui à 16h30",
    message: 'Disponible immédiatement avec sangle et bâche de protection.',
    status: 'pending',
    createdAt: 'Il y a 25 min',
  },
  {
    id: 'prop_3',
    freightId: 'f1',
    freightOrigin: 'Abidjan, Plateau',
    freightDestination: 'Bouaké Centre',
    freightCargo: 'Produits alimentaires (2.5T)',
    driverId: 'drv_3',
    driverName: 'Seydou Bamba',
    driverPhone: '+225 01 22 33 44',
    driverRating: 4.9,
    driverTrips: 231,
    vehicleType: 'Camion 5T Frigorifique',
    vehiclePlate: '9012 JK 01',
    amount: 180000,
    proposedPickupDate: 'Demain à 08h00',
    message: 'Chauffeur expérimenté sur l\'axe Abidjan-Bouaké. Arrivée garantie en 5h.',
    status: 'pending',
    createdAt: 'Il y a 1h',
  },
  {
    id: 'prop_4',
    freightId: 'f2',
    freightOrigin: 'Abidjan, Yopougon',
    freightDestination: 'San Pedro',
    freightCargo: 'Matériaux de construction (8T)',
    driverId: 'drv_4',
    driverName: 'Amara Diallo',
    driverPhone: '+225 07 88 99 00',
    driverRating: 4.7,
    driverTrips: 115,
    vehicleType: 'Camion 10T Benne',
    vehiclePlate: '3456 LM 01',
    amount: 340000,
    proposedPickupDate: 'Demain à 07h00',
    message: 'Camion 10T en parfait état, prêt pour le trajet San Pedro par la côtière.',
    status: 'pending',
    createdAt: 'Il y a 2h',
  },
];

export const MOCK_TRIP_STOPS: TripStop[] = [
  {
    id: 'stop_1',
    locationName: 'Péage d\'Attinguié (Autoroute du Nord)',
    latitude: 5.4850,
    longitude: -4.1800,
    startTime: '10:15',
    durationMinutes: 12,
    isCurrentStop: false,
    reason: 'toll',
    reasonLabel: 'Passage péage autoroutier',
  },
  {
    id: 'stop_2',
    locationName: 'Station Shell & Restauration (N\'Zi Comoé)',
    latitude: 6.1200,
    longitude: -4.7500,
    startTime: '12:30',
    durationMinutes: 28,
    isCurrentStop: false,
    reason: 'fuel',
    reasonLabel: 'Ravitaillement & Pause repas',
  },
  {
    id: 'stop_3',
    locationName: 'Contrôle routier / Pesage (Yamoussoukro Sud)',
    latitude: 6.7800,
    longitude: -5.2400,
    startTime: '14:45',
    durationMinutes: 15,
    isCurrentStop: true,
    reason: 'inspection',
    reasonLabel: 'Contrôle de conformité de charge',
  },
];

export const MOCK_FREIGHTS: Freight[] = [
  {
    id: 'f1', origin: 'Abidjan, Plateau', destination: 'Bouaké Centre',
    cargo: 'Produits alimentaires', weight: 2500, distance: 345, budget: 180000,
    status: 'offers_received', date: '2026-07-05', vehicleType: 'Camion 5T',
    offersCount: 3, ownerId: 'user_1', ownerName: 'Kofi Mensah', deliveryCode: '482937',
  },
  {
    id: 'f2', origin: 'Abidjan, Yopougon', destination: 'San Pedro',
    cargo: 'Matériaux de construction', weight: 8000, distance: 430, budget: 350000,
    status: 'published', date: '2026-07-06', vehicleType: 'Camion 10T',
    offersCount: 0, ownerId: 'user_1', ownerName: 'Kofi Mensah', deliveryCode: '619842',
  },
  {
    id: 'f3', origin: 'Abidjan, Cocody', destination: 'Yamoussoukro',
    cargo: 'Électroménager', weight: 1200, distance: 248, budget: 95000,
    status: 'in_transit', date: '2026-07-04', vehicleType: 'Camionnette',
    offersCount: 1, ownerId: 'user_1', ownerName: 'Kofi Mensah', deliveryCode: '482937',
  },
  {
    id: 'f4', origin: 'Abidjan, Marcory', destination: 'Daloa',
    cargo: 'Produits cosmétiques', weight: 800, distance: 392, budget: 120000,
    status: 'delivered', date: '2026-07-01', vehicleType: 'Pick-up',
    offersCount: 2, ownerId: 'user_1', ownerName: 'Kofi Mensah', deliveryCode: '734190',
  },
];

export const MOCK_MISSIONS: Mission[] = [
  {
    id: 'm1', origin: 'Abidjan, Treichville', destination: 'Man',
    cargo: 'Céréales en sacs', weight: 5000, distance: 520, budget: 280000,
    status: 'published', date: '2026-07-05', vehicleType: 'Camion 5T',
    offersCount: 2, ownerId: 'user_2', ownerName: 'Amara Diallo',
    missionStatus: 'available', deliveryCode: '581420',
  },
  {
    id: 'm2', origin: 'Abidjan, Abobo', destination: 'Korhogo',
    cargo: 'Textiles', weight: 2000, distance: 638, budget: 320000,
    status: 'published', date: '2026-07-06', vehicleType: 'Camion 5T',
    offersCount: 1, ownerId: 'user_3', ownerName: 'Fatou Camara',
    missionStatus: 'offer_sent', myOfferAmount: 290000, deliveryCode: '629301',
  },
  {
    id: 'm3', origin: 'Bouaké', destination: 'Abidjan, Port',
    cargo: 'Cacao en fèves', weight: 12000, distance: 345, budget: 450000,
    status: 'published', date: '2026-07-07', vehicleType: 'Semi-remorque',
    offersCount: 4, ownerId: 'user_4', ownerName: 'Ibrahima Sow',
    missionStatus: 'available', deliveryCode: '394815',
  },
  {
    id: 'm4', origin: 'San Pedro', destination: 'Abidjan, Adjamé',
    cargo: 'Bois de construction', weight: 15000, distance: 390, budget: 520000,
    status: 'published', date: '2026-07-08', vehicleType: 'Semi-remorque',
    offersCount: 0, ownerId: 'user_5', ownerName: 'Moussa Touré',
    missionStatus: 'available', deliveryCode: '852963',
  },
  {
    id: 'm5', origin: 'Abidjan, Treichville', destination: 'Yamoussoukro',
    cargo: 'Produits pharmaceutiques', weight: 900, distance: 248, budget: 195000,
    status: 'carrier_selected', date: '2026-07-05', vehicleType: 'Camionnette',
    offersCount: 1, ownerId: 'user_6', ownerName: 'Koffi Assi',
    missionStatus: 'accepted', myOfferAmount: 190000, deliveryCode: '482937',
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', participantName: 'Amara Diallo',
    lastMessage: 'Pouvez-vous confirmer l\'heure de départ ?',
    timestamp: '09:45', unread: 2,
    freightLabel: 'Abidjan → Man', isOnline: true,
  },
  {
    id: 'c2', participantName: 'Moussa Touré',
    lastMessage: 'Livraison effectuée avec succès !',
    timestamp: 'Hier', unread: 0,
    freightLabel: 'Abidjan → Yamoussoukro', isOnline: false,
  },
  {
    id: 'c3', participantName: 'Fatou Camara',
    lastMessage: 'Je suis disponible dès demain matin',
    timestamp: 'Hier', unread: 1,
    freightLabel: 'Abidjan → Korhogo', isOnline: true,
  },
  {
    id: 'c4', participantName: 'Ibrahim Coulibaly',
    lastMessage: 'Mon offre : 285 000 FCFA',
    timestamp: 'Lun', unread: 0,
    freightLabel: 'Bouaké → San Pedro', isOnline: false,
  },
];

export const MOCK_SHIPPER_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'sn1', type: 'offer', title: 'Nouvelle offre de transport',
    body: 'Moussa Touré a proposé 165 000 FCFA pour votre fret Abidjan → Bouaké',
    timestamp: '10 min', read: false,
  },
  {
    id: 'sn2', type: 'message', title: 'Message de Ibrahim Coulibaly',
    body: 'Bonjour, mon camion est disponible pour charger dès demain 08h.',
    timestamp: '45 min', read: false,
  },
  {
    id: 'sn3', type: 'delivery', title: 'Fret pris en charge',
    body: 'Le chauffeur Kofi Assi a débuté le transport vers Yamoussoukro.',
    timestamp: '2h', read: true,
  },
  {
    id: 'sn4', type: 'delivery', title: 'Livraison effectuée avec succès',
    body: 'Votre destinataire à Daloa a confirmé la réception du fret (Code validé).',
    timestamp: 'Hier', read: true,
  },
  {
    id: 'sn5', type: 'kyc', title: 'Compte Expéditeur actif',
    body: 'Votre compte est vérifié. Vous pouvez publier des frets en toute sécurité.',
    timestamp: '3 jours', read: true,
  },
];

export const MOCK_CARRIER_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'cn1', type: 'accepted', title: 'Offre acceptée !',
    body: 'L\'expéditeur a accepté votre devis de 190 000 FCFA pour Treichville → Yamoussoukro.',
    timestamp: '15 min', read: false,
  },
  {
    id: 'cn2', type: 'offer', title: 'Nouvelle mission disponible',
    body: 'Un fret de 5T (Céréales) correspondant à votre camion est disponible à Treichville.',
    timestamp: '1h', read: false,
  },
  {
    id: 'cn3', type: 'payment', title: 'Paiement débloqué',
    body: 'Vous avez reçu 185 000 FCFA sur votre portefeuille pour la livraison terminée.',
    timestamp: '2h', read: true,
  },
  {
    id: 'cn4', type: 'message', title: 'Message de l\'expéditeur',
    body: 'Pouvez-vous confirmer votre heure estimée d\'arrivée à Bouaké ?',
    timestamp: 'Hier', read: true,
  },
  {
    id: 'cn5', type: 'kyc', title: 'Vérification Chauffeur approuvée',
    body: 'Votre permis et documents de véhicule ont été validés par l\'équipe FretConnect.',
    timestamp: '5 jours', read: true,
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = MOCK_SHIPPER_NOTIFICATIONS;

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1', type: 'credit', amount: 185000,
    description: 'Mission Abidjan → Yamoussoukro',
    date: '01/07/2026', status: 'completed',
  },
  {
    id: 't2', type: 'commission', amount: -9250,
    description: 'Commission FretConnect (5%)',
    date: '01/07/2026', status: 'completed',
  },
  {
    id: 't3', type: 'credit', amount: 320000,
    description: 'Mission Abidjan → Korhogo',
    date: '28/06/2026', status: 'completed',
  },
  {
    id: 't4', type: 'debit', amount: -50000,
    description: 'Retrait vers Mobile Money',
    date: '25/06/2026', status: 'completed',
  },
  {
    id: 't5', type: 'credit', amount: 95000,
    description: 'Mission Abidjan → Daloa',
    date: '20/06/2026', status: 'pending',
  },
];
